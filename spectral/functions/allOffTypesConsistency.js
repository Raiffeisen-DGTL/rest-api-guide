'use strict'
import { createRulesetFunction } from '@stoplight/spectral-core'

export default createRulesetFunction(
  {
    input: null,
    options: null,
  },
  function allOffTypesConsistency(targetVal, opts, context) {
    if (!targetVal || !Array.isArray(targetVal.allOf)) return

    const allOf = targetVal.allOf
    const resolvedDoc = context.documentInventory?.resolved || context.document.data

    // Вспомогательная функция для поиска значения по JSON Pointer
    const getByJsonPointer = (doc, pointer) => {
      if (!pointer.startsWith('#/')) return undefined
      return pointer
        .slice(2)
        .split('/')
        .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), doc)
    }

    const types = []

    for (const item of allOf) {
      if (item && item.$ref) {
        const resolved = getByJsonPointer(resolvedDoc, item.$ref)
        if (resolved && resolved.type) {
          types.push(resolved.type)
        } else {
          // если не нашёл тип по ссылке, просто пометим как "ref"
          types.push('ref')
        }
      } else if (item && item.type) {
        types.push(item.type)
      }
    }

    if (types.length === 0) return

    const firstType = types[0]
    const inconsistent = types.some((t) => t !== firstType)

    if (inconsistent) {
      return [
        {
          message: `Элементы allOf должны иметь одинаковый тип. Найдены: ${types.join(', ')}`,
          path: [...context.path, 'allOf'],
        },
      ]
    }
  },
)
