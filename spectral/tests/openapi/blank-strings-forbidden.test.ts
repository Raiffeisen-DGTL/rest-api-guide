import { setupSpectral } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

let linter: Spectral

describe('Blank strings forbidden rule tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/openapi/base/blank-strings-forbidden.yaml'
    linter = await setupSpectral(rulesFile)
  })

  test('should not report an error when spec does not have blank strings', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should report an error when spec has blank strings in title', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: '   ',
        version: '0.0.2',
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].path.join('.')).toBe('info.title')
    expect(results[0].message).toBe('Пустые строки запрещены')
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should report an error when spec has blank strings in parameters.description', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/v1/api/test': {
          get: {
            tags: ['testing endpoint'],
            summary: 'Для тестирования правил',
            operationId: 'getTest',
            responses: {
              '200': {
                description: '',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].path.join('.')).toBe('paths./v1/api/test.get.responses.200.description')
    expect(results[0].message).toBe('Пустые строки запрещены')
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should report an error when spec has blank strings in responses', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/v1/api/test': {
          get: {
            tags: ['testing endpoint'],
            summary: 'Для тестирования правил',
            operationId: 'getTest',
            responses: {
              '200': {
                description: 'OK',
              },
              '400': {
                description: 'Плохой запрос',
                content: {
                  'application/json': {
                    schema: {
                      required: [' ', 'requestId'],
                      properties: {
                        error: {
                          type: 'object',
                          description: 'Объект с кодом ошибки',
                          'x-raif-api-description-en': 'Object with a code error',
                          required: ['code'],
                          properties: {
                            code: {
                              type: 'string',
                              description: 'Значение кода ошибки',
                              'x-raif-api-description-en': ' \t',
                              example: '',
                            },
                          },
                        },
                      },
                      type: 'object',
                    },
                    examples: {
                      'Некорректный запрос': {
                        summary: ' ',
                        value: {
                          error: {
                            code: 'app.invalid.request',
                            message: 'Bad Request',
                          },
                          requestId: 'c396fda4d36c4f12',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(4)
    expect(results[0].path.join('.')).toBe(
      'paths./v1/api/test.get.responses.400.content.application/json.schema.required.0',
    )
    expect(results[1].path.join('.')).toBe(
      'paths./v1/api/test.get.responses.400.content.application/json.schema.properties.error.properties.code.x-raif-api-description-en',
    )
    expect(results[2].path.join('.')).toBe(
      'paths./v1/api/test.get.responses.400.content.application/json.schema.properties.error.properties.code.example',
    )
    expect(results[3].path.join('.')).toBe(
      'paths./v1/api/test.get.responses.400.content.application/json.examples.Некорректный запрос.summary',
    )
    expect(results[0].message).toBe('Пустые строки запрещены')
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should report an error when spec has blank strings in description', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
        description: '   ',
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].path.join('.')).toBe('info.description')
    expect(results[0].message).toBe('Пустые строки запрещены')
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should report an error when spec has blank strings in title and description', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: '   ',
        version: '0.0.2',
        description: '   ',
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(2)
    expect(results[0].path.join('.')).toBe('info.title')
    expect(results[0].message).toBe('Пустые строки запрещены')
    expect(results[1].path.join('.')).toBe('info.description')
    expect(results[1].severity).toBe(Severity.error)
  })

  test('should report an error when spec has only whitespace characters', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: '  \t  ',
        version: '0.0.2',
        description: '  \n  ',
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(2)
    expect(results[0].path.join('.')).toBe('info.title')
    expect(results[0].message).toBe('Пустые строки запрещены')
    expect(results[1].path.join('.')).toBe('info.description')
    expect(results[1].severity).toBe(Severity.error)
  })

  test('should report an error when spec has empty string in title', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: '',
        version: '0.0.2',
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].path.join('.')).toBe('info.title')
    expect(results[0].message).toBe('Пустые строки запрещены')
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should report an error when spec has empty string in description', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
        description: '',
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].path.join('.')).toBe('info.description')
    expect(results[0].message).toBe('Пустые строки запрещены')
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should report an error when spec has title with only spaces and tabs', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: '   \t   ',
        version: '0.0.2',
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].path.join('.')).toBe('info.title')
    expect(results[0].message).toBe('Пустые строки запрещены')
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should report an error when spec has description with only spaces and newlines', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
        description: '   \n   \n   ',
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].path.join('.')).toBe('info.description')
    expect(results[0].message).toBe('Пустые строки запрещены')
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should not report an error when spec has valid content with spaces', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: '  Test Spec  ',
        version: '0.0.2',
        description: '  This is a valid description with spaces  ',
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should report an error when spec has title with only special characters that are not spaces', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: '!!!',
        version: '0.0.2',
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should report an error when spec has description with only special characters that are not spaces', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
        description: '!!!',
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should report an error when spec has title with only numbers', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: '12345',
        version: '0.0.2',
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should report an error when spec has description with only numbers', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
        description: '12345',
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should report an error when spec has title with only special characters and spaces', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: '   !@#$%   ',
        version: '0.0.2',
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should report an error when spec has description with only special characters and spaces', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
        description: '   !@#$%   ',
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })
})
