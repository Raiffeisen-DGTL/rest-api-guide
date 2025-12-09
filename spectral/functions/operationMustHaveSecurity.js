'use strict'

import { createRulesetFunction } from '@stoplight/spectral-core'

export default createRulesetFunction(
  {
    input: {
      // На вход попадает операция (объект get/put/...)
      type: 'object',
    },
    options: null,
  },
  (operation, _opts, context) => {
    const results = []

    // Весь документ
    const doc = context.document?.data ?? {}

    const hasGlobalSecurity = Array.isArray(doc.security) && doc.security.length > 0
    const hasOperationSecurity = Array.isArray(operation.security) && operation.security.length > 0

    // Если есть глобальная security — ничего не требуем от операций
    if (hasGlobalSecurity) return results

    // Если глобальной security нет — операция должна иметь свою
    if (!hasOperationSecurity) {
      results.push({
        message: 'Операция должна содержать security, если глобальный security блок отсутствует.',
        path: context.path, // путь до операции
      })
    }
    return results
  },
)
