'use strict'

/**
 * Decodes a JSON Pointer segment according to RFC 6901
 * @param {string} segment - The encoded segment
 * @returns {string} - The decoded segment
 */
function decodePointerSegment(segment) {
  return segment.replace(/~1/g, '/').replace(/~0/g, '~')
}

/**
 * Gets a value from an object using a JSON Pointer path
 * @param {object} object - The object to traverse
 * @param {string} path - The JSON Pointer path (e.g., "components/schemas/User")
 * @returns {object|undefined} - The value at the path or undefined if not found
 */
function getValue(object, path) {
  return path.split('/').reduce((o, k) => {
    // Декодируем сегмент пути согласно JSON Pointer спецификации
    const decodedKey = decodePointerSegment(k)
    return (o || {})[decodedKey]
  }, object)
}

/**
 * Resolves relative paths with ../ segments
 * @param {string} basePath - The base path
 * @param {string} refValue - The reference value starting with ../
 * @returns {string} - The resolved absolute path
 */
function resolveRelativePath(basePath, refValue) {
  let currentPath = basePath
  let relativePath = refValue

  // Обрабатываем все ../ в начале пути
  while (relativePath.startsWith('../')) {
    currentPath = currentPath.substring(0, currentPath.lastIndexOf('/'))
    relativePath = relativePath.substring(3)
  }

  return currentPath + '/' + relativePath
}

/**
 * Resolves a relative path to an absolute path based on the current document context
 * @param {string} refValue - The reference value (e.g., './path/to/file.yaml#/components/schemas/Schema')
 * @param {object} context - The Spectral context object
 * @returns {string} - The absolute path to the referenced file
 */
function resolveAbsolutePath(refValue, context) {
  // Разделяем путь на директорию и имя файла
  const basePath = context.document.source
    ? context.document.source.substring(0, context.document.source.lastIndexOf('/'))
    : ''
  // Обрабатываем различные форматы путей
  let absolutePath = refValue
  if (basePath) {
    if (refValue.startsWith('./')) {
      // Относительный путь от текущей директории
      absolutePath = basePath + '/' + refValue.substring(2)
    } else if (refValue.startsWith('../')) {
      // Относительный путь вверх по директориям
      absolutePath = resolveRelativePath(basePath, refValue)
    } else if (!refValue.startsWith('/')) {
      // Относительный путь без префикса (от текущей директории)
      absolutePath = basePath + '/' + refValue
    }
    // Для абсолютных путей (начинающихся с /) оставляем как есть
  }
  return absolutePath
}

/**
 * Resolves a reference from the document inventory
 * @param {string[]} parts - The reference parts [filePath, jsonPointer]
 * @param {object} context - The Spectral context object
 * @returns {object|undefined} - The resolved reference value or undefined if not found
 */
function resolveFromDocumentInventory(parts, context) {
  if (
    context.documentInventory &&
    context.documentInventory.referencedDocuments &&
    context.documentInventory.referencedDocuments[parts[0]]
  ) {
    const fileContent = context.documentInventory.referencedDocuments[parts[0]].data
    if (parts.length === 1) {
      return fileContent
    } else if (parts.length === 2) {
      return getValue(fileContent, parts[1])
    }
  }
  return undefined
}

/**
 * Resolves a reference by loading the file directly from the filesystem
 * @param {string[]} parts - The reference parts [filePath, jsonPointer]
 * @returns {object|undefined} - The resolved reference value or undefined if not found
 */
function resolveFromFilesystem(parts) {
  try {
    const fs = require('fs')
    const yaml = require('js-yaml')

    // Получаем абсолютный путь к файлу
    const filePath = parts[0]
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8')
      const parsedContent = yaml.load(fileContent)
      if (parts.length === 1) {
        return parsedContent
      } else if (parts.length === 2) {
        return getValue(parsedContent, parts[1])
      }
    }
  } catch (e) {
    // Игнорируем ошибки загрузки файла
  }
  return undefined
}

/**
 * Resolves a reference to its actual value
 * @param {string} refValue - The reference value (e.g., '#/components/schemas/Schema' or './file.yaml#/components/schemas/Schema')
 * @param {object} context - The Spectral context object
 * @returns {object|undefined} - The resolved reference value or undefined if not found
 */
function resolveRef(refValue, context) {
  // Helper function to handle internal references
  const handleInternalRef = () => {
    const newRef = refValue.replace('#/', '')
    return getValue(context.document.data, newRef)
  }

  // Helper function to handle external references
  const handleExternalRef = () => {
    // Преобразование относительного пути в абсолютный
    const absolutePath = resolveAbsolutePath(refValue, context)
    const parts = absolutePath.split('#/')

    // Проверяем, есть ли документ в documentInventory
    const fromInventory = resolveFromDocumentInventory(parts, context)
    if (fromInventory !== undefined) {
      return fromInventory
    }

    // Если документ не найден в documentInventory, пытаемся загрузить его напрямую
    const fromFilesystem = resolveFromFilesystem(parts)
    if (fromFilesystem !== undefined) {
      return fromFilesystem
    }

    throw new SyntaxError('Wrong reference value: ' + refValue)
  }

  if (refValue.startsWith('#/')) {
    return handleInternalRef()
  } else {
    return handleExternalRef()
  }
}

export { resolveRef }
