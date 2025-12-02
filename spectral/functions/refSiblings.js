'use strict'

import { createRulesetFunction } from '@stoplight/spectral-core'
import { isObject } from './utils/isObject.js'
import { resolveRef } from './utils/refResolver.js'

export default createRulesetFunction(
  {
    input: null,
    options: null,
  },
  function refSiblings(paths, opts, context) {
    if (!paths || typeof paths !== 'object') {
      return []
    }

    const results = []
    // Set to track processed references to prevent infinite recursion
    const processedRefs = new Set()

    // Проверяет объект на наличие $ref с соседними свойствами
    function checkRefWithSiblings(obj, currentPath) {
      if (!Object.prototype.hasOwnProperty.call(obj, '$ref')) {
        return
      }

      const keys = Object.keys(obj)
      // Если есть другие свойства besides $ref, это ошибка
      if (keys.length > 1) {
        for (const key of keys) {
          if (key !== '$ref') {
            results.push({
              message: 'Рядом с $ref не должно быть property',
              path: [...currentPath, key],
            })
          }
        }
      }
    }

    // Рекурсивная функция для поиска $ref свойств и проверки их на наличие соседей
    function checkForRefSiblings(obj, currentPath) {
      if (!isObject(obj)) {
        return
      }

      // Проверяем текущий объект на наличие $ref с соседями
      checkRefWithSiblings(obj, currentPath)

      // Рекурсивно проверяем все вложенные объекты
      for (const [key, value] of Object.entries(obj)) {
        if (isObject(value)) {
          checkForRefSiblings(value, [...currentPath, key])
        }
      }
    }

    // Обрабатывает разрешение ссылок и проверку содержимого
    function processResolvedRef(refValue, currentPath, ctx) {
      // Prevent infinite recursion by tracking processed references
      if (processedRefs.has(refValue)) {
        return
      }

      // Add this reference to the set of processed references
      processedRefs.add(refValue)

      try {
        const resolved = resolveRef(refValue, {
          ...ctx,
          path: [...currentPath, '$ref'],
        })

        if (isObject(resolved)) {
          // Проверяем разрешенный объект на наличие $ref с соседями
          checkRefWithSiblings(resolved, currentPath)
          // Рекурсивно проверяем вложенные объекты в разрешенном содержимом
          checkExternalRefs(resolved, currentPath, ctx)
        }
      } catch (e) {
        // Игнорируем ошибки разрешения ссылок
      }
    }

    // Рекурсивная функция для проверки внешних ссылок
    function checkExternalRefs(obj, currentPath, ctx) {
      if (!isObject(obj)) {
        return
      }

      for (const [key, value] of Object.entries(obj)) {
        if (key === '$ref' && typeof value === 'string') {
          // Если это ссылка, разрешаем её и проверяем содержимое
          processResolvedRef(value, currentPath, ctx)
        } else if (isObject(value)) {
          // Рекурсивно проверяем вложенные объекты
          checkExternalRefs(value, [...currentPath, key], ctx)
        }
      }
    }

    // Проверяем основной документ
    checkForRefSiblings(paths, context.path)

    // Проверяем внешние ссылки
    checkExternalRefs(paths, context.path, context)

    return results
  },
)
