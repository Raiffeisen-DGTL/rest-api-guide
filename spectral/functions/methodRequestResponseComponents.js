import { resolveRef } from './utils/refResolver.js'

/**
 * Checks if a schema is a reference to a component or contains only references to components
 * @param {object} schema - The schema to check
 * @returns {boolean} - True if the schema is a reference or contains only references
 */
function isSchemaReferencingComponents(schema) {
  if (!schema || typeof schema !== 'object') {
    return false
  }

  // Direct reference to a component
  if (schema.$ref) {
    return true
  }

  // Handle composite schemas
  if (schema.allOf && Array.isArray(schema.allOf)) {
    return schema.allOf.every((item) => isSchemaReferencingComponents(item))
  }

  if (schema.oneOf && Array.isArray(schema.oneOf)) {
    return schema.oneOf.every((item) => isSchemaReferencingComponents(item))
  }

  if (schema.anyOf && Array.isArray(schema.anyOf)) {
    return schema.anyOf.every((item) => isSchemaReferencingComponents(item))
  }

  // Handle additionalProperties
  if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
    return isSchemaReferencingComponents(schema.additionalProperties)
  }

  // If we get here, it's an inline schema
  return false
}

export default function methodRequestResponseComponents(paths, _opts, context) {
  if (!paths || typeof paths !== 'object') {
    return []
  }

  const results = []

  for (const [path, pathItem] of Object.entries(paths)) {
    let resolvedPathItem = pathItem
    if (pathItem.$ref) {
      resolvedPathItem = resolveRef(pathItem.$ref, context)
    }
    for (const [method, operation] of Object.entries(resolvedPathItem)) {
      if (
        ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace'].includes(
          method.toLowerCase(),
        )
      ) {
        // Check request body
        let resolvedBody = operation.requestBody
        if (resolvedBody?.$ref) {
          continue
        }
        if (resolvedBody && resolvedBody.content) {
          for (const [mediaType, content] of Object.entries(resolvedBody.content)) {
            // Only check for application/json content type
            if (mediaType === 'application/json' && content.schema) {
              // Check if schema is referencing components or contains only references
              if (isSchemaReferencingComponents(content.schema)) {
                // This is a reference to a component or contains only references, which is what we want
                // No error needed
              } else {
                // Schema is defined inline, which is what we want to flag
                results.push({
                  message:
                    'Тело запроса и ответа должны быть вынесены в блок Components Object как Schema.',
                  path: [
                    ...context.path,
                    path,
                    method,
                    'requestBody',
                    'content',
                    mediaType,
                    'schema',
                  ],
                })
              }
            }
          }
        }

        // Check responses
        if (operation.responses && typeof operation.responses === 'object') {
          for (const [statusCode, response] of Object.entries(operation.responses)) {
            let resolvedResponse = response
            if (response.$ref) {
              continue
            }
            if (resolvedResponse.content && typeof resolvedResponse.content === 'object') {
              for (const [mediaType, content] of Object.entries(resolvedResponse.content)) {
                // Only check for application/json content type
                if (mediaType === 'application/json' && content.schema) {
                  // Check if schema is referencing components or contains only references
                  if (isSchemaReferencingComponents(content.schema)) {
                    // This is a reference to a component or contains only references, which is what we want
                    // No error needed
                  } else {
                    // Schema is defined inline, which is what we want to flag
                    results.push({
                      message:
                        'Тело запроса и ответа должны быть вынесены в блок Components Object как Schema.',
                      path: [
                        ...context.path,
                        path,
                        method,
                        'responses',
                        statusCode,
                        'content',
                        mediaType,
                        'schema',
                      ],
                    })
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return results
}
