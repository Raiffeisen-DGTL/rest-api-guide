'use strict'
import { createRulesetFunction } from '@stoplight/spectral-core'

const seenTargets = new WeakSet()

export default createRulesetFunction(
  {
    input: {
      type: 'object',
    },
    options: null,
  },
  function arrayItems(targetVal) {
    if (targetVal == null || typeof targetVal !== 'object') {
      return
    }

    // Если уже проверяли этот объект (например, после резолва $ref), больше не проверяем
    if (seenTargets.has(targetVal)) {
      return
    }
    seenTargets.add(targetVal)

    // Проверяем тип array (включая 3.1, где type может быть массивом)
    const { type } = targetVal
    const isArrayType = type === 'array' || (Array.isArray(type) && type.includes('array'))

    if (!isArrayType) {
      return
    }

    // Проверяем, что есть хотя бы один из допустимых ключей для элементов
    const hasItems = Object.prototype.hasOwnProperty.call(targetVal, 'items')
    const hasPrefixItems = Object.prototype.hasOwnProperty.call(targetVal, 'prefixItems')

    if (!hasItems && !hasPrefixItems) {
      return [
        {
          message: 'Объекты типа Array должны содержать массив элементов',
        },
      ]
    }
  },
)
