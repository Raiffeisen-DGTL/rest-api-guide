import { createRulesetFunction } from '@stoplight/spectral-core'
import { isPlainObject } from './utils/json.js'
import { resolveRef } from './utils/refResolver.js'

export default createRulesetFunction(
  {
    input: {
      type: 'object',
      additionalProperties: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    options: {
      type: 'object',
      properties: {
        oasVersion: { enum: [2, 3] },
      },
      additionalProperties: false,
    },
  },
  function oasSecurityDefined(input, { oasVersion }, context) {
    const { document, path } = context
    const schemeNames = Object.keys(input)
    if (schemeNames.length === 0) return

    if (!isPlainObject(document.data)) return

    // Resolve security schemes, handling external references
    let allDefs =
      oasVersion === 2
        ? document.data.securityDefinitions
        : isPlainObject(document.data.components)
          ? document.data.components.securitySchemes
          : null

    // If securitySchemes is a reference, resolve it
    if (isPlainObject(allDefs) && typeof allDefs.$ref === 'string') {
      try {
        allDefs = resolveRef(allDefs.$ref, { document })
      } catch (e) {
        // If we can't resolve the reference, continue with the original logic
      }
    } else if (
      typeof allDefs === 'string' &&
      (allDefs.startsWith('#/') || allDefs.startsWith('./') || allDefs.startsWith('../'))
    ) {
      try {
        allDefs = resolveRef(allDefs, { document })
      } catch (e) {
        // If we can't resolve the reference, continue with the original logic
      }
    }

    let results

    for (const schemeName of schemeNames) {
      if (!isPlainObject(allDefs) || !(schemeName in allDefs)) {
        const object = path.length === 2 ? 'API' : 'Operation'
        const location = oasVersion === 2 ? 'securityDefinitions' : 'components.securitySchemes'
        results ??= []
        results.push({
          message: `${object} "security" values must match a scheme defined in the "${location}" object.`,
          path: [...path, schemeName],
        })
        continue
      }

      const scope = input[schemeName]
      for (let i = 0; i < scope.length; i++) {
        const scopeName = scope[i]
        if (!isScopeDefined(oasVersion, scopeName, allDefs[schemeName])) {
          results ??= []
          results.push({
            message: `"${scopeName}" must be listed among scopes.`,
            path: [...path, schemeName, i],
          })
        }
      }
    }

    return results
  },
)

function isScopeDefined(oasVersion, scopeName, securityScheme) {
  if (!isPlainObject(securityScheme)) return false

  if (oasVersion === 2) {
    return isPlainObject(securityScheme.scopes) && scopeName in securityScheme.scopes
  }

  if (isPlainObject(securityScheme.flows)) {
    for (const flow of Object.values(securityScheme.flows)) {
      if (isPlainObject(flow) && isPlainObject(flow.scopes) && scopeName in flow.scopes) {
        return true
      }
    }
  }

  return false
}
