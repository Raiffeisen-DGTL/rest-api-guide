import { createRulesetFunction } from '@stoplight/spectral-core'
import { resolveRef } from './utils/refResolver.js'

export default createRulesetFunction(
  {
    input: {
      type: 'object',
    },
    options: null,
  },
  function objectRequestResponsePostfix(document, opts, context) {
    // When resolved: false, we get the entire document
    // We need to find all object references and check if their names are correct based on usage

    const results = []

    // Helper function to extract object name from reference
    function getObjectNameFromRef(ref) {
      if (!ref) return null
      // For refs like './file.yaml#/UserCreate' or '#/components/schemas/UserCreate'
      // We want to extract 'UserCreate'
      const parts = ref.split('#/')
      if (parts.length === 1) {
        // Just a file reference without a path
        return null
      }
      const path = parts[parts.length - 1] // Get the last part after #
      return path.split('/').pop() // Get the last segment
    }

    // Helper function to check if a path item is a valid HTTP method
    function isHttpMethod(method) {
      return ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace'].includes(
        method.toLowerCase(),
      )
    }

    // Collect all object references with their usage context
    const objectRefs = [] // array of { name, ref, usedInRequest, usedInResponse }

    if (document.paths) {
      for (const path in document.paths) {
        const pathItem = document.paths[path]

        // Resolve pathItem reference if it exists
        let resolvedPathItem = pathItem
        if (pathItem && pathItem.$ref) {
          try {
            resolvedPathItem = resolveRef(pathItem.$ref, context)
          } catch (e) {
            // If we can't resolve the reference, skip it
            continue
          }
        }

        for (const method in resolvedPathItem) {
          if (!isHttpMethod(method)) continue

          const operation = resolvedPathItem[method]

          // Resolve operation reference if it exists
          let resolvedOperation = operation
          if (operation && operation.$ref) {
            try {
              resolvedOperation = resolveRef(operation.$ref, context)
            } catch (e) {
              // If we can't resolve the reference, skip it
              continue
            }
          }

          // Check requestBody - can be a direct object or a reference
          if (resolvedOperation.requestBody) {
            if (resolvedOperation.requestBody.$ref) {
              // requestBody is a reference
              const objectName = getObjectNameFromRef(resolvedOperation.requestBody.$ref)
              if (objectName) {
                objectRefs.push({
                  name: objectName,
                  ref: resolvedOperation.requestBody.$ref,
                  usedInRequest: true,
                  usedInResponse: false,
                })
              }
            } else if (resolvedOperation.requestBody.content) {
              // requestBody is a direct object, check schema references inside
              const content = resolvedOperation.requestBody.content
              for (const mediaType in content) {
                const schema = content[mediaType].schema
                if (schema && schema.$ref) {
                  const objectName = getObjectNameFromRef(schema.$ref)
                  if (objectName) {
                    objectRefs.push({
                      name: objectName,
                      ref: schema.$ref,
                      usedInRequest: true,
                      usedInResponse: false,
                    })
                  }
                }
              }
            }
          }

          // Check responses - can be direct objects or references
          if (resolvedOperation.responses) {
            for (const responseCode in resolvedOperation.responses) {
              const response = resolvedOperation.responses[responseCode]
              if (response.$ref) {
                // response is a reference
                const objectName = getObjectNameFromRef(response.$ref)
                if (objectName) {
                  objectRefs.push({
                    name: objectName,
                    ref: response.$ref,
                    usedInRequest: false,
                    usedInResponse: true,
                  })
                }
              } else if (response.content) {
                // response is a direct object, check schema references inside
                for (const mediaType in response.content) {
                  const schema = response.content[mediaType].schema
                  if (schema && schema.$ref) {
                    const objectName = getObjectNameFromRef(schema.$ref)
                    if (objectName) {
                      objectRefs.push({
                        name: objectName,
                        ref: schema.$ref,
                        usedInRequest: false,
                        usedInResponse: true,
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

    // Group references by object name and determine usage pattern
    const objectUsage = new Map() // name -> { usedInRequest, usedInResponse, refs[] }

    for (const objRef of objectRefs) {
      if (!objectUsage.has(objRef.name)) {
        objectUsage.set(objRef.name, {
          usedInRequest: false,
          usedInResponse: false,
          refs: [],
        })
      }

      const usage = objectUsage.get(objRef.name)
      if (objRef.usedInRequest) usage.usedInRequest = true
      if (objRef.usedInResponse) usage.usedInResponse = true
      usage.refs.push(objRef)
    }

    // Now check all the objects
    for (const [name, usage] of objectUsage.entries()) {
      // If object is used in both request and response, no postfix required
      if (usage.usedInRequest && usage.usedInResponse) {
        continue
      }

      // If object is used only in request
      if (usage.usedInRequest && !usage.usedInResponse) {
        if (!name.endsWith('Request')) {
          // Try to find a good path for the error
          let path = []
          // Use the first reference to determine where to report the error
          const firstRef = usage.refs[0]
          // If it's an internal schema reference, point to the schema
          if (firstRef.ref.startsWith('#/components/schemas/')) {
            path = ['components', 'schemas', name]
          }
          results.push({
            message:
              'Объекты запросов и ответов должны быть заданы стилем PascalCase с постфиксами Request/Response',
            path: path,
          })
        }
        continue
      }

      // If object is used only in response
      if (usage.usedInResponse && !usage.usedInRequest) {
        if (!name.endsWith('Response')) {
          // Try to find a good path for the error
          let path = []
          // Use the first reference to determine where to report the error
          const firstRef = usage.refs[0]
          // If it's an internal schema reference, point to the schema
          if (firstRef.ref.startsWith('#/components/schemas/')) {
            path = ['components', 'schemas', name]
          }
          results.push({
            message:
              'Объекты запросов и ответов должны быть заданы стилем PascalCase с постфиксами Request/Response',
            path: path,
          })
        }
      }
    }

    return results
  },
)
