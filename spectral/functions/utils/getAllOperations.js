'use strict'

// import { isPlainObject } from '@stoplight/json'
import { isPlainObject } from './json.js'
// Список допустимых HTTP‑методов, которые могут встречаться в OpenAPI.
const validOperationKeys = ['get', 'head', 'post', 'put', 'patch', 'delete', 'options', 'trace']

/**
 * Генератор, который проходит по объекту "paths" в OpenAPI и
 * возвращает каждую найденную операцию.
 *
 * Пример структуры:
 * {
 *   "/users": { get: {...}, post: {...} },
 *   "/pets":  { get: {...} }
 * }
 *
 * На каждой итерации возвращается объект формата:
 * { path: "/users", operation: "get", value: {...} }
 *
 * @param {*} paths — объект OpenAPI.paths
 * @returns {IterableIterator<{ path: string, operation: string, value: object }>}
 */
function* getAllOperations(paths) {
  // Проверяем, что paths — это объект
  if (!isPlainObject(paths)) {
    return
  }

  // Перебираем все ключи верхнего уровня (пути, например "/users", "/pets")
  for (const path of Object.keys(paths)) {
    const operations = paths[path]

    if (!isPlainObject(operations)) {
      continue
    }

    // Для каждого пути перебираем методы (get, post, и т.д.)
    for (const operation of Object.keys(operations)) {
      // Проверяем, что значение — объект и что это допустимый HTTP‑метод
      if (!isPlainObject(operations[operation]) || !validOperationKeys.includes(operation)) {
        continue
      }

      // Возвращаем найденную операцию
      yield {
        path, // например: "/users"
        operation, // например: "get"
        value: operations[operation], // сам объект операции
      }
    }
  }
}
export { getAllOperations }
