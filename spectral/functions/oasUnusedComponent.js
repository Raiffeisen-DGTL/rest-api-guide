'use strict'
import { unreferencedReusableObject } from '@stoplight/spectral-functions'
import { createRulesetFunction } from '@stoplight/spectral-core'
import { isObject } from './utils/isObject.js'
import { resolveRef } from './utils/refResolver.js'

export default createRulesetFunction(
  {
    // Указываем, что входной объект должен содержать "components"
    input: {
      type: 'object',
      properties: {
        components: {
          type: 'object',
        },
      },
      required: ['components'],
    },
    options: null, // без дополнительных опций
  },

  function oasUnusedComponent(targetVal, opts, context) {
    const results = []

    // Список всех возможных типов reusable-компонентов в OpenAPI.
    const componentTypes = [
      'schemas',
      'responses',
      'parameters',
      'examples',
      'requestBodies',
      'headers',
      'links',
      'callbacks',
    ]

    // Keep track of components that are actually referenced
    const referencedComponents = new Set()

    // Keep track of external files we've already processed to avoid infinite loops
    const processedExternalFiles = new Set()

    // Keep track of components referenced in external files
    const externalReferencedComponents = new Map()

    // Find all references in the document
    function findReferences(obj, path = []) {
      if (!obj || typeof obj !== 'object') return

      // If this is a reference object
      if (obj.$ref && typeof obj.$ref === 'string') {
        if (obj.$ref.startsWith('#/')) {
          // Internal reference - track it
          const refPath = obj.$ref.substring(2) // Remove '#/'
          if (refPath.startsWith('components/')) {
            const pathParts = refPath.split('/')
            if (pathParts.length >= 3) {
              const componentType = pathParts[1]
              const componentName = pathParts[2]
              referencedComponents.add(`${componentType}/${componentName}`)
            }
          }
        } else {
          // External reference - resolve it and track what components are used from the external file
          try {
            // Extract the file path and fragment
            const parts = obj.$ref.split('#/')
            const filePath = parts[0]

            if (!processedExternalFiles.has(filePath)) {
              processedExternalFiles.add(filePath)

              // Resolve the entire external file
              const fileRef = filePath
              const fileData = resolveRef(fileRef, context)
              if (fileData && fileData.components) {
                // Initialize tracking for this external file
                externalReferencedComponents.set(filePath, new Set())
              }
            }

            // If there's a fragment, track which component is referenced
            if (parts.length > 1) {
              const fragment = parts[1]
              if (fragment.startsWith('components/')) {
                const pathParts = fragment.split('/')
                if (pathParts.length >= 3) {
                  const componentType = pathParts[1]
                  const componentName = pathParts[2]
                  const fileComponents = externalReferencedComponents.get(filePath)
                  if (fileComponents) {
                    fileComponents.add(`${componentType}/${componentName}`)
                  }
                }
              }
            }

            // Also resolve the specific reference to check for nested references
            const resolved = resolveRef(obj.$ref, context)
            if (resolved) {
              // Recursively check for references in the resolved content
              findReferences(resolved)
            }
          } catch (e) {
            // Ignore resolution errors
          }
        }
      }

      // Recursively check all properties
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => findReferences(item, [...path, index]))
      } else {
        Object.keys(obj).forEach((key) => {
          findReferences(obj[key], [...path, key])
        })
      }
    }

    // Check for unused components in an external file
    function checkExternalFileComponents(externalData, filePath, context) {
      const referencedInFile = externalReferencedComponents.get(filePath) || new Set()

      // Check each component type in the external file
      for (const type of componentTypes) {
        const externalComponents = externalData.components && externalData.components[type]
        if (!isObject(externalComponents)) continue

        // Use the same unreferencedReusableObject function to check for unused components
        const externalResults = unreferencedReusableObject(
          externalComponents,
          { reusableObjectsLocation: `#/components/${type}` },
          context,
        )

        // Filter out components that are actually referenced from this document
        if (Array.isArray(externalResults)) {
          const filteredResults = externalResults.filter((result) => {
            const componentName = result.path[result.path.length - 1]
            return !referencedInFile.has(`${type}/${componentName}`)
          })

          filteredResults.forEach((result) => {
            results.push({
              message: 'Спецификация не должна содержать неиспользуемые компоненты',
              path: result.path,
            })
          })
        }
      }
    }

    // Search for references in the entire document
    findReferences(context.document.data)

    // Check external files for unused components
    for (const [filePath, referencedComponentsSet] of externalReferencedComponents.entries()) {
      try {
        const fileData = resolveRef(filePath, context)
        if (fileData && fileData.components) {
          checkExternalFileComponents(fileData, filePath, context)
        }
      } catch (e) {
        // Ignore resolution errors
      }
    }

    // Перебираем все секции components
    for (const type of componentTypes) {
      const value = targetVal.components[type]
      if (!isObject(value)) continue

      // Проверка неиспользуемых элементов внутри каждой категории (schemas, responses, ...).
      const resultsForType = unreferencedReusableObject(
        value,
        { reusableObjectsLocation: `#/components/${type}` },
        context,
      )

      // Filter out components that are actually referenced
      if (Array.isArray(resultsForType)) {
        const filteredResults = resultsForType.filter((result) => {
          const componentName = result.path[result.path.length - 1]
          return !referencedComponents.has(`${type}/${componentName}`)
        })
        results.push(...filteredResults)
      }
    }

    // Возвращаем все найденные предупреждения / ошибки.
    return results
  },
)
