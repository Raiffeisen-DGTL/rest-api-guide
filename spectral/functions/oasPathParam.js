'use strict'
import { isObject } from './utils/isObject.js'
import { createRulesetFunction } from '@stoplight/spectral-core'
import { resolveRef } from './utils/refResolver.js'

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

/**
 * Обрабатывает параметры на уровне пути или операции
 */
function processParameters(parameters, basePath, results, seenParams) {
  const processedParams = {}
  if (Array.isArray(parameters)) {
    for (const [i, value] of parameters.entries()) {
      if (!isObject(value)) continue
      const fullParameterPath = [...basePath, i]
      if (isUnknownNamedPathParam(value, fullParameterPath, results, processedParams)) {
        processedParams[value.name] = fullParameterPath
      }
    }
  }
  return processedParams
}

/**
 * Разрешает ссылку с обработкой ошибок
 */
function resolveReference(ref, contextPath, context) {
  try {
    const refContext = { ...context, path: contextPath }
    return resolveRef(ref, refContext)
  } catch (e) {
    return null
  }
}

/**
 * Извлекает параметры пути из строки пути
 */
function extractPathElements(pathKey, results) {
  const pathElements = []
  let match
  while ((match = pathRegex.exec(pathKey))) {
    const varName = match[0].replace(/[{}?*;]/g, '')
    if (pathElements.includes(varName)) {
      results.push(
        generateResult(`Path "${pathKey}" must not use parameter "{${varName}}" multiple times.`, [
          'paths',
          pathKey,
        ]),
      )
    } else {
      pathElements.push(varName)
    }
  }
  return pathElements
}

/**
 * Проверяет эквивалентность путей
 */
function checkPathEquivalence(path, originalPathKey, uniquePaths, results) {
  const normalized = path.replace(pathRegex, '%') // '%' = шаблон
  if (normalized in uniquePaths) {
    results.push(
      generateResult(
        `Paths "${String(uniquePaths[normalized])}" and "${path}" must not be equivalent.`,
        ['paths', originalPathKey],
      ),
    )
  } else {
    uniquePaths[normalized] = path
  }
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
   * @param {*} opts Опции (не используются)
   * @param {object} context Контекст Spectral
   * @returns {Array<object>} Список ошибок (или пустой массив)
   */
  function oasPathParam(paths, opts, context) {
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
      let pathValue = paths[path]
      const originalPathKey = path

      // Если путь является ссылкой, разрешаем её
      if (isObject(pathValue) && pathValue.$ref) {
        const resolvedPath = resolveReference(pathValue.$ref, ['paths', path], context)
        if (resolvedPath === null) continue
        pathValue = resolvedPath
      }

      if (!isObject(pathValue)) continue

      // --- Проверка эквивалентных путей ---
      checkPathEquivalence(path, originalPathKey, uniquePaths, results)

      // --- Извлекаем переменные в пути ---
      const pathElements = extractPathElements(originalPathKey, results)

      // --- Обработка параметров, определённых на уровне пути ---
      const topParams = processParameters(
        pathValue.parameters,
        ['paths', originalPathKey, 'parameters'],
        results,
        {},
      )

      // --- Обработка параметров на уровне операций ---
      if (isObject(pathValue)) {
        for (const op of Object.keys(pathValue)) {
          let operationValue = pathValue[op]
          const originalOpKey = op

          // Если операция является ссылкой, разрешаем её
          if (isObject(operationValue) && operationValue.$ref) {
            const resolvedOp = resolveReference(
              operationValue.$ref,
              ['paths', originalPathKey, op],
              context,
            )
            if (resolvedOp === null) continue

            // Заменяем operationValue на разрешённое значение для дальнейшей обработки
            if (isObject(resolvedOp)) {
              operationValue = resolvedOp
            }
          }

          if (!isObject(operationValue)) continue

          if (op === 'parameters' || !validOperationKeys.includes(op)) {
            continue
          }

          const operationPath = ['paths', originalPathKey, originalOpKey]

          const operationParams = processParameters(
            operationValue.parameters,
            [...operationPath, 'parameters'],
            results,
            {},
          )

          // Объединяем параметры уровня пути и операции
          const definedParams = { ...topParams, ...operationParams }

          // Проверки взаимного соответствия
          ensureAllDefinedPathParamsAreUsedInPath(
            originalPathKey,
            definedParams,
            pathElements,
            results,
          )
          ensureAllExpectedParamsInPathAreDefined(
            originalPathKey,
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
