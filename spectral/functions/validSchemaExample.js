import { createRulesetFunction } from '@stoplight/spectral-core'

const COMPOSITE_KEYWORDS = ['oneOf', 'allOf', 'anyOf']

function hasExample(schema, context, visited = new Set()) {
  if (!schema || typeof schema !== 'object') {
    return false
  }

  if (Object.prototype.hasOwnProperty.call(schema, 'example')) {
    return true
  }

  if (schema.$ref) {
    const refKey = schema.$ref
    if (visited.has(refKey)) {
      return false
    }

    visited.add(refKey)

    let resolved
    try {
      resolved = context.utils.resolveRef(schema)
    } catch (error) {
      throw error
    }

    if (resolved && typeof resolved === 'object') {
      return hasExample(resolved, context, visited)
    }
    return false
  }

  for (const keyword of COMPOSITE_KEYWORDS) {
    const variants = schema[keyword]
    if (Array.isArray(variants)) {
      for (const variant of variants) {
        if (hasExample(variant, context, new Set(visited))) {
          return true
        }
      }
    }
  }
  return false
}

export default createRulesetFunction(
  {
    input: {
      type: 'object',
    },
    options: null,
  },
  function validSchemaExample(input, _, context) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      return []
    }

    let schema = input

    if (schema.$ref) {
      try {
        const resolved = context.utils.resolveRef(schema)
        if (resolved && typeof resolved === 'object') {
          schema = resolved
        } else {
          return [
            {
              message: 'Не удалось разрешить $ref или ссылка указывает не на объект.',
              path: context.path,
            },
          ]
        }
      } catch (e) {
        return [
          {
            message: 'Ошибка при разрешении $ref.',
            path: context.path,
          },
        ]
      }
    }
    const errors = []

    if (schema.type === 'object' && schema.properties && typeof schema.properties === 'object') {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        const propPath = [...context.path, 'properties', propName]

        let propHasExample = false
        try {
          propHasExample = hasExample(propSchema, context)
        } catch (e) {
          errors.push({
            message: `Ошибка при разрешении $ref в свойстве '${propName}'.`,
            path: propPath,
          })
          continue
        }

        if (!propHasExample) {
          const message = propSchema.$ref
            ? `Ссылка на схему в свойстве '${propName}' не имеет example.`
            : `Свойство '${propName}' должно иметь пример (example).`

          errors.push({
            message,
            path: [...propPath, 'example'],
          })
        }
      }
    } else if (schema.type && schema.type !== 'object') {
      try {
        if (!hasExample(schema, context)) {
          errors.push({
            message: 'Все схемы должны иметь example',
            path: [...context.path, 'example'],
          })
        }
      } catch (e) {
        errors.push({
          message: 'Ошибка при разрешении $ref.',
          path: context.path,
        })
      }
    }
    return errors
  },
)
