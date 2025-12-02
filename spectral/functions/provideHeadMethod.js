import { createRulesetFunction } from '@stoplight/spectral-core'
import { resolveRef } from './utils/refResolver.js'

// MIME-типы, которые считаются файлами
const FILE_MIME_TYPES = [
  'application/octet-stream',
  'application/xml',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Excel .xlsx
  'application/vnd.ms-excel', // Excel .xls
  'application/zip',
  'application/gzip',
  'application/vnd.oasis.opendocument.text', // ODT
  'application/msword', // DOC
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
]

export default createRulesetFunction(
  {
    input: {
      type: 'object',
    },
    options: null,
  },
  function ensureHeadForFileDownload(input, _, context) {
    // Защита от null/undefined или не-объектов
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      return []
    }

    let pathItem = input

    // Если это $ref — разрешаем его
    if (pathItem.$ref) {
      try {
        const resolved = resolveRef(pathItem.$ref, context)
        if (resolved && typeof resolved === 'object') {
          pathItem = resolved
        } else {
          return [
            {
              message: 'Не удалось разрешить $ref для пути.',
              path: context.path,
            },
          ]
        }
      } catch (e) {
        return [
          {
            message: 'Ошибка при разрешении $ref для пути.',
            path: context.path,
          },
        ]
      }
    }

    const errors = []

    // Проверяем, есть ли GET-метод
    if (pathItem.get) {
      let getOperation = pathItem.get

      // Если GET — это $ref, разрешаем его
      if (getOperation.$ref) {
        try {
          getOperation = resolveRef(getOperation.$ref, context)
        } catch (e) {
          errors.push({
            message: 'Ошибка при разрешении $ref в GET-методе.',
            path: [...context.path, 'get'],
          })
        }
      }

      // Проверяем, возвращает ли GET файл
      let hasFileResponse = false

      if (getOperation.responses) {
        for (const [code, response] of Object.entries(getOperation.responses)) {
          if (code.toString().startsWith('2') && response.content) {
            const contentTypes = Object.keys(response.content)
            if (contentTypes.some((type) => FILE_MIME_TYPES.includes(type))) {
              hasFileResponse = true
              break
            }
          }
        }
      }

      // Если GET возвращает файл, но нет HEAD — добавляем ошибку
      if (hasFileResponse && !pathItem.head) {
        errors.push({
          message: `GET-метод должен иметь соответствующий HEAD-метод, если возвращает файл.`,
          path: [...context.path, 'head'],
        })
      }
    }

    return errors
  },
)
