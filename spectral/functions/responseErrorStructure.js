'use strict'
import { createRulesetFunction } from '@stoplight/spectral-core'

function isErrorStatusCode(code) {
  const num = Number(code)
  if (!isNaN(num)) {
    return num >= 400 && num < 600
  }
  return code === '4XX' || code === '5XX'
}

function getSchemaProperties(schema) {
  if (!schema || typeof schema !== 'object') {
    return null
  }
  return schema.properties || null
}

function validateErrorSchema(schema, basePath) {
  const errors = []

  if (!schema || typeof schema !== 'object') {
    return errors
  }

  const properties = getSchemaProperties(schema)
  if (!properties) {
    errors.push({
      message: 'Схема ответа с ошибкой должна содержать свойство "error".',
      path: basePath,
    })
    return errors
  }

  // Проверяем наличие свойства error
  if (!properties.error) {
    errors.push({
      message: 'Схема ответа с ошибкой должна содержать свойство "error".',
      path: [...basePath, 'properties'],
    })
    return errors
  }

  const errorSchema = properties.error
  const errorPath = [...basePath, 'properties', 'error']

  // Проверяем что error — объект
  if (errorSchema.type && errorSchema.type !== 'object') {
    errors.push({
      message: 'Свойство "error" должно быть объектом.',
      path: [...errorPath, 'type'],
    })
    return errors
  }

  const errorProperties = getSchemaProperties(errorSchema)
  if (!errorProperties) {
    errors.push({
      message: 'Объект "error" должен содержать свойства "code" и "message".',
      path: errorPath,
    })
    return errors
  }

  const errorRequired = Array.isArray(errorSchema.required) ? errorSchema.required : []

  // Проверяем наличие и обязательность полей code и message
  if (!errorProperties.code) {
    errors.push({
      message: 'Объект "error" должен содержать свойство "code".',
      path: [...errorPath, 'properties'],
    })
  } else if (!errorRequired.includes('code')) {
    errors.push({
      message: 'Свойство "error.code" должно быть объявлено в required.',
      path: [...errorPath, 'required'],
    })
  }

  if (!errorProperties.message) {
    errors.push({
      message: 'Объект "error" должен содержать свойство "message".',
      path: [...errorPath, 'properties'],
    })
  } else if (!errorRequired.includes('message')) {
    errors.push({
      message: 'Свойство "error.message" должно быть объявлено в required.',
      path: [...errorPath, 'required'],
    })
  }

  // Проверяем что code — строка
  if (errorProperties.code && errorProperties.code.type && errorProperties.code.type !== 'string') {
    errors.push({
      message: 'Свойство "error.code" должно быть строкой.',
      path: [...errorPath, 'properties', 'code', 'type'],
    })
  }

  // Проверяем что message — строка
  if (
    errorProperties.message &&
    errorProperties.message.type &&
    errorProperties.message.type !== 'string'
  ) {
    errors.push({
      message: 'Свойство "error.message" должно быть строкой.',
      path: [...errorPath, 'properties', 'message', 'type'],
    })
  }

  // Проверяем details если присутствует
  if (errorProperties.details) {
    const detailsSchema = errorProperties.details
    const detailsPath = [...errorPath, 'properties', 'details']

    // Проверяем, что details — массив ( либо имеет type: array, либо содержит array в anyOf)
    const isDetailsArray =
      detailsSchema.type === 'array' ||
      (detailsSchema.anyOf && detailsSchema.anyOf.some((item) => item.type === 'array'))

    if (detailsSchema.type && detailsSchema.type !== 'array' && !isDetailsArray) {
      errors.push({
        message: 'Свойство "error.details" должно быть массивом.',
        path: [...detailsPath, 'type'],
      })
    }

    // Получаем реальный items из anyOf или напрямую
    let itemsSchema = null
    if (isDetailsArray) {
      if (detailsSchema.anyOf && Array.isArray(detailsSchema.anyOf)) {
        // Ищем вариант с items
        for (const anyOfItem of detailsSchema.anyOf) {
          if (anyOfItem.items && typeof anyOfItem.items === 'object') {
            itemsSchema = anyOfItem.items
            break
          }
        }
      } else if (detailsSchema.items && typeof detailsSchema.items === 'object') {
        itemsSchema = detailsSchema.items
      }
    }

    // Проверяем items массива details
    if (itemsSchema && typeof itemsSchema === 'object') {
      const itemProperties = getSchemaProperties(itemsSchema)
      const itemsPath = [...detailsPath, 'items']

      // Если у items нет properties, это ошибка, так как мы ожидаем объект с полями
      if (!itemProperties) {
        errors.push({
          message:
            'Элементы "error.details" должны быть объектами со свойствами "param" и "message".',
          path: itemsPath,
        })
      } else {
        const itemRequired = Array.isArray(itemsSchema.required) ? itemsSchema.required : []

        // Проверяем наличие и обязательность полей param
        if (!itemProperties.param) {
          errors.push({
            message: 'Элементы "error.details" должны содержать свойство "param".',
            path: [...itemsPath, 'properties'],
          })
        } else if (!itemRequired.includes('param')) {
          errors.push({
            message:
              'Свойство "param" в элементах "error.details" должно быть объявлено в required.',
            path: [...itemsPath, 'required'],
          })
        }

        // Проверяем наличие и обязательность полей message
        if (!itemProperties.message) {
          errors.push({
            message: 'Элементы "error.details" должны содержать свойство "message".',
            path: [...itemsPath, 'properties'],
          })
        } else if (!itemRequired.includes('message')) {
          errors.push({
            message:
              'Свойство "message" в элементах "error.details" должно быть объявлено в required.',
            path: [...itemsPath, 'required'],
          })
        }
      }
    }
  }

  return errors
}

export default createRulesetFunction(
  {
    input: {
      type: 'object',
    },
    options: null,
  },
  function responseErrorStructure(input) {
    const paths = input.paths
    if (!paths || typeof paths !== 'object') {
      return []
    }

    const results = []

    for (const [path, pathItem] of Object.entries(paths)) {
      if (!pathItem || typeof pathItem !== 'object') {
        continue
      }

      for (const [method, operation] of Object.entries(pathItem)) {
        if (!operation || typeof operation !== 'object' || !operation.responses) {
          continue
        }

        for (const [statusCode, response] of Object.entries(operation.responses)) {
          if (!isErrorStatusCode(statusCode)) {
            continue
          }

          if (!response || typeof response !== 'object') {
            continue
          }

          const content = response.content
          if (!content || typeof content !== 'object') {
            continue
          }

          for (const [mediaType, mediaContent] of Object.entries(content)) {
            if (mediaType !== 'application/json') {
              continue
            }

            if (!mediaContent || !mediaContent.schema) {
              continue
            }

            const schemaPath = [
              'paths',
              path,
              method,
              'responses',
              statusCode,
              'content',
              mediaType,
              'schema',
            ]

            const schemaErrors = validateErrorSchema(mediaContent.schema, schemaPath)
            results.push(...schemaErrors)
          }
        }
      }
    }

    return results
  },
)
