'use strict'
import { isObject } from './utils/isObject.js'
import { createRulesetFunction } from '@stoplight/spectral-core'

// Шаблон для поиска параметров пути вида {id}, {;id}, {?userId}, {userId*} и т.п.
const pathRegex = /(\{;?\??[a-zA-Z0-9_-]+\*?\})/g

function isNamedPathParam(p) {
  return p && p.in === 'path' && typeof p.name === 'string'
}

function isUnknownNamedPathParam(p, jsonPath, results, seen) {
  if (!isNamedPathParam(p)) {
    return false
  }

  // must have required:true
  if (p.required !== true) {
    results.push(generateResult(requiredMessage(p.name), jsonPath))
  }

  // must be unique
  if (p.name in seen) {
    results.push(generateResult(uniqueDefinitionMessage(p.name), jsonPath))
    return false
  }

  return true
}

function ensureAllDefinedPathParamsAreUsedInPath(path, params, expectedNames, results) {
  for (const p of Object.keys(params)) {
    if (!params[p]) continue

    if (!expectedNames.includes(p)) {
      const resPath = params[p]
      results.push(generateResult(`Parameter "${p}" must be used in path "${path}".`, resPath))
    }
  }
}

/**
 * Проверяет, что все параметры, встречающиеся в самом пути (например {userId}),
 * действительно определены в path/operation.parameters.
 */
function ensureAllExpectedParamsInPathAreDefined(
  path,
  params,
  expectedNames,
  operationPath,
  results,
) {
  for (const p of expectedNames) {
    if (!(p in params)) {
      results.push(
        generateResult(
          `Operation must define parameter "{${p}}" as expected by path "${path}".`,
          operationPath,
        ),
      )
    }
  }
}

/**
 * Создаёт объект результата с сообщением и JSON‑путём.
 */
function generateResult(message, path) {
  return { message, path }
}

/**
 * Текст ошибки: параметр пути должен иметь required:true
 */
function requiredMessage(name) {
  return `Path parameter "${name}" must have "required" property that is set to "true".`
}

/**
 * Текст ошибки: параметр пути не должен быть определён несколько раз.
 */
function uniqueDefinitionMessage(name) {
  return `Path parameter "${name}" must not be defined multiple times.`
}

export default createRulesetFunction(
  {
    input: { type: 'object' },
    options: null,
  },

  /**
   * Основная проверка Path Parameters в OpenAPI.
   *
   * @param {object} paths Объект `paths` из OpenAPI
   * @returns {Array<object>} Список ошибок (или пустой массив)
   */
  function oasPathParam(paths) {
    /**
     * Логика проверки:
     *
     * 1️⃣ path‑переменные из строки "/users/{id}" должны быть объявлены как parameters (path/operation);
     * 2️⃣ path/operation.parameters не должны содержать лишних имён, которых нет в пути;
     * 3️⃣ пути вида `/resource/{one}` и `/resource/{two}` эквивалентны → ошибка;
     * 4️⃣ каждый path‑параметр должен быть required:true и не дублироваться.
     */

    const results = []
    const uniquePaths = {} // Для проверки эквивалентных normalized‑путей
    const validOperationKeys = ['get', 'head', 'post', 'put', 'patch', 'delete', 'options', 'trace']

    // Перебираем все пути документа
    for (const path of Object.keys(paths)) {
      const pathValue = paths[path]
      if (!isObject(pathValue)) continue

      // --- Проверка эквивалентных путей ---
      const normalized = path.replace(pathRegex, '%') // '%' = шаблон
      if (normalized in uniquePaths) {
        results.push(
          generateResult(
            `Paths "${String(uniquePaths[normalized])}" and "${path}" must not be equivalent.`,
            ['paths', path],
          ),
        )
      } else {
        uniquePaths[normalized] = path
      }

      // --- Извлекаем переменные в пути ---
      const pathElements = []
      let match
      while ((match = pathRegex.exec(path))) {
        const varName = match[0].replace(/[{}?*;]/g, '')
        if (pathElements.includes(varName)) {
          results.push(
            generateResult(`Path "${path}" must not use parameter "{${varName}}" multiple times.`, [
              'paths',
              path,
            ]),
          )
        } else {
          pathElements.push(varName)
        }
      }

      // --- Обработка параметров, определённых на уровне пути ---
      const topParams = {}
      if (Array.isArray(pathValue.parameters)) {
        for (const [i, value] of pathValue.parameters.entries()) {
          if (!isObject(value)) continue
          const fullParameterPath = ['paths', path, 'parameters', i]
          if (isUnknownNamedPathParam(value, fullParameterPath, results, topParams)) {
            topParams[value.name] = fullParameterPath
          }
        }
      }

      // --- Обработка параметров на уровне операций ---
      if (isObject(paths[path])) {
        for (const op of Object.keys(pathValue)) {
          const operationValue = pathValue[op]
          if (!isObject(operationValue)) continue

          if (op === 'parameters' || !validOperationKeys.includes(op)) {
            continue
          }

          const operationParams = {}
          const { parameters } = operationValue
          const operationPath = ['paths', path, op]

          if (Array.isArray(parameters)) {
            for (const [i, p] of parameters.entries()) {
              if (!isObject(p)) continue
              const fullParamPath = [...operationPath, 'parameters', i]
              if (isUnknownNamedPathParam(p, fullParamPath, results, operationParams)) {
                operationParams[p.name] = fullParamPath
              }
            }
          }
          // Объединяем параметры уровня пути и операции
          const definedParams = { ...topParams, ...operationParams }
          // Проверки взаимного соответствия
          ensureAllDefinedPathParamsAreUsedInPath(path, definedParams, pathElements, results)
          ensureAllExpectedParamsInPathAreDefined(
            path,
            definedParams,
            pathElements,
            operationPath,
            results,
          )
        }
      }
    }

    return results
  },
)
