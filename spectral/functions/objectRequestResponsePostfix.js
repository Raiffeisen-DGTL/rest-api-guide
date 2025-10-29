import { createRulesetFunction } from '@stoplight/spectral-core'

export default createRulesetFunction(
  {
    input: {
      type: 'string',
    },
    options: null,
  },
  function objectRequestResponsePostfix(targetVal, opts, context) {
    // Получаем весь документ
    const document = context.document.data

    // Сначала найдем все схемы, которые используются в запросах или ответах
    const usedSchemas = new Set()

    if (document.paths) {
      for (const path in document.paths) {
        const pathItem = document.paths[path]
        for (const method in pathItem) {
          const operation = pathItem[method]

          // Проверяем в запросах (requestBody)
          if (operation.requestBody) {
            const content = operation.requestBody.content
            if (content) {
              for (const mediaType in content) {
                const schema = content[mediaType].schema
                if (schema && schema.$ref) {
                  const refName = schema.$ref.split('/').pop()
                  usedSchemas.add(refName)
                }
              }
            }
          }

          // Проверяем в ответах (responses)
          if (operation.responses) {
            for (const responseCode in operation.responses) {
              const response = operation.responses[responseCode]
              if (response.content) {
                for (const mediaType in response.content) {
                  const schema = response.content[mediaType].schema
                  if (schema && schema.$ref) {
                    const refName = schema.$ref.split('/').pop()
                    usedSchemas.add(refName)
                  }
                }
              }
            }
          }
        }
      }
    }

    // Проверяем, используется ли текущая схема в запросах или ответах
    const schemaName = targetVal
    if (!usedSchemas.has(schemaName)) {
      // Если схема не используется в запросах/ответах, не проверяем её
      return []
    }

    // Проверяем, что имя начинается с заглавной буквы и заканчивается на Request или Response
    const hasCorrectPostfix = /^[A-Z][a-zA-Z0-9]*(Request|Response)$/.test(targetVal)

    // Определяем, где используется эта схема
    let usedInRequest = false
    let usedInResponse = false

    if (document.paths) {
      for (const path in document.paths) {
        const pathItem = document.paths[path]
        for (const method in pathItem) {
          const operation = pathItem[method]

          // Проверяем в запросах (requestBody)
          if (operation.requestBody) {
            const content = operation.requestBody.content
            if (content) {
              for (const mediaType in content) {
                const schema = content[mediaType].schema
                if (schema && schema.$ref) {
                  const refName = schema.$ref.split('/').pop()
                  if (refName === schemaName) {
                    usedInRequest = true
                  }
                }
              }
            }
          }

          // Проверяем в ответах (responses)
          if (operation.responses) {
            for (const responseCode in operation.responses) {
              const response = operation.responses[responseCode]
              if (response.content) {
                for (const mediaType in response.content) {
                  const schema = response.content[mediaType].schema
                  if (schema && schema.$ref) {
                    const refName = schema.$ref.split('/').pop()
                    if (refName === schemaName) {
                      usedInResponse = true
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    // Если модель используется и в запросе, и в ответе, то постфикс не обязателен
    if (usedInRequest && usedInResponse) {
      return []
    }

    // Если модель используется только в запросе
    if (usedInRequest && !usedInResponse) {
      if (!targetVal.endsWith('Request')) {
        return [
          {
            message: `${targetVal} используется в запросе и должно заканчиваться на Request`,
            path: [...context.path],
          },
        ]
      }
      return []
    }

    // Если модель используется только в ответе
    if (usedInResponse && !usedInRequest) {
      if (!targetVal.endsWith('Response')) {
        return [
          {
            message: `${targetVal} используется в ответе и должно заканчиваться на Response`,
            path: [...context.path],
          },
        ]
      }
      return []
    }

    // Если модель не используется в запросах/ответах (не должно происходить из-за первой проверки)
    if (!hasCorrectPostfix) {
      return [
        {
          message: `${targetVal} не соответствует формату PascalCase с постфиксом Request/Response`,
          path: [...context.path],
        },
      ]
    }

    return []
  },
)
