'use strict'
import { createRulesetFunction } from '@stoplight/spectral-core'
import { getAllOperations } from './utils/getAllOperations.js'
import { isObject } from './utils/isObject.js'

/**
 * Проверка уникальности operationId во всех операциях OpenAPI документа.
 * В OpenAPI каждое поле `operationId` в paths должно быть уникальным.
 */
export default createRulesetFunction(
  {
    // Входные данные — объект (ожидается OpenAPI.paths)
    input: {
      type: 'object',
    },
    options: null, // без дополнительных опций
  },

  /**
   * Основная функция правила.
   * @param {object} paths - объект OpenAPI.paths
   * @returns {Array<object>} - массив найденных проблем (результатов)
   */
  function oasOpIdUnique(paths) {
    // Здесь будут накапливаться результаты — объекты с message и path
    const results = []

    // Массив уже встречавшихся operationId
    const seenIds = []

    // Перебираем все операции (например: GET /users, POST /login и т.д.)
    for (const { path, operation } of getAllOperations(paths)) {
      const pathValue = paths[path]
      // Если значение paths[path] не объект — пропускаем
      if (!isObject(pathValue)) continue

      const operationValue = pathValue[operation]
      // Если операция не объект или не имеет поля operationId — также пропускаем
      if (!isObject(operationValue) || !('operationId' in operationValue)) {
        continue
      }

      // Извлекаем operationId
      const { operationId } = operationValue

      // Проверяем, встречался ли он ранее
      if (seenIds.includes(operationId)) {
        // Если этот ID уже был, добавляем ошибку в результаты
        results.push({
          message: 'operationId must be unique.',
          path: ['paths', path, operation, 'operationId'],
        })
      } else {
        // Если нет — добавляем в список встреченных
        seenIds.push(operationId)
      }
    }

    // Возвращаем список всех найденных нарушений
    return results
  },
)
