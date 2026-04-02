import { setupSpectral } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

let linter: Spectral

describe('Response Error Structure Rule Tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/openapi/response-error-structure.yaml'
    linter = await setupSpectral(rulesFile)
  })

  const baseSpec = {
    openapi: '3.0.3',
    info: {
      title: 'Test Spec',
      version: '0.0.1',
    },
  }
  test('should not report an error for minimal valid error response (code + message)', async () => {
    const specFile = {
      ...baseSpec,
      paths: {
        '/v1/users': {
          get: {
            operationId: 'getUsers',
            summary: 'Get users',
            responses: {
              '200': {
                description: 'Successful response',
              },
              '404': {
                description: 'Not found',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        error: {
                          type: 'object',
                          properties: {
                            code: { type: 'string' },
                            message: { type: 'string' },
                          },
                          required: ['code', 'message'],
                        },
                      },
                      required: ['error'],
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
    expect(results.length).toBe(0)
  })

  test('should not report an error for error response with details array', async () => {
    const specFile = {
      ...baseSpec,
      paths: {
        '/v1/users': {
          post: {
            operationId: 'createUser',
            summary: 'Create user',
            responses: {
              '400': {
                description: 'Validation error',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        error: {
                          type: 'object',
                          properties: {
                            code: { type: 'string' },
                            message: { type: 'string' },
                            details: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  param: { type: 'string' },
                                  message: { type: 'string' },
                                },
                                required: ['param', 'message'],
                              },
                            },
                          },
                          required: ['code', 'message'],
                        },
                      },
                      required: ['error'],
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
    expect(results.length).toBe(0)
  })

  test('should not report an error for error response with details including optional code field', async () => {
    const specFile = {
      ...baseSpec,
      paths: {
        '/v1/users': {
          post: {
            operationId: 'createUser',
            summary: 'Create user',
            responses: {
              '422': {
                description: 'Validation error',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        error: {
                          type: 'object',
                          properties: {
                            code: { type: 'string' },
                            message: { type: 'string' },
                            details: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  param: { type: 'string' },
                                  message: { type: 'string' },
                                  code: { type: 'string' },
                                },
                                required: ['param', 'message'],
                              },
                            },
                          },
                          required: ['code', 'message'],
                        },
                      },
                      required: ['error'],
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
    expect(results.length).toBe(0)
  })

  test('should not report an error for 500 error response', async () => {
    const specFile = {
      ...baseSpec,
      paths: {
        '/v1/users': {
          get: {
            operationId: 'getUsers',
            summary: 'Get users',
            responses: {
              '500': {
                description: 'Internal server error',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        error: {
                          type: 'object',
                          properties: {
                            code: { type: 'string' },
                            message: { type: 'string' },
                          },
                          required: ['code', 'message'],
                        },
                      },
                      required: ['error'],
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
    expect(results.length).toBe(0)
  })

  test('should not report an error for 2xx responses (not error responses)', async () => {
    const specFile = {
      ...baseSpec,
      paths: {
        '/v1/users': {
          get: {
            operationId: 'getUsers',
            summary: 'Get users',
            responses: {
              '200': {
                description: 'Successful response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        data: { type: 'string' },
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
    expect(results.length).toBe(0)
  })

  test('should not report an error when error response has no application/json content', async () => {
    const specFile = {
      ...baseSpec,
      paths: {
        '/v1/files': {
          get: {
            operationId: 'getFiles',
            summary: 'Get files',
            responses: {
              '404': {
                description: 'Not found',
                content: {
                  'text/plain': {
                    schema: {
                      type: 'string',
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
    expect(results.length).toBe(0)
  })

  test('should not report an error when error response has no content', async () => {
    const specFile = {
      ...baseSpec,
      paths: {
        '/v1/users': {
          delete: {
            operationId: 'deleteUser',
            summary: 'Delete user',
            responses: {
              '404': {
                description: 'Not found',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should report an error when error response has no error property', async () => {
    const specFile = {
      ...baseSpec,
      paths: {
        '/v1/users': {
          get: {
            operationId: 'getUsers',
            summary: 'Get users',
            responses: {
              '400': {
                description: 'Bad request',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        code: { type: 'string' },
                        text: { type: 'string' },
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
    expect(results.length).toBe(1)
    expect(results[0].message).toBe('Схема ответа с ошибкой должна содержать свойство "error".')
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should report an error when error object is missing code', async () => {
    const specFile = {
      ...baseSpec,
      paths: {
        '/v1/users': {
          get: {
            operationId: 'getUsers',
            summary: 'Get users',
            responses: {
              '400': {
                description: 'Bad request',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        error: {
                          type: 'object',
                          properties: {
                            message: { type: 'string' },
                          },
                          required: ['message'],
                        },
                      },
                      required: ['error'],
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
    expect(results.length).toBe(1)
    expect(results[0].message).toBe('Объект "error" должен содержать свойство "code".')
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should report an error when error object is missing message', async () => {
    const specFile = {
      ...baseSpec,
      paths: {
        '/v1/users': {
          get: {
            operationId: 'getUsers',
            summary: 'Get users',
            responses: {
              '400': {
                description: 'Bad request',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        error: {
                          type: 'object',
                          properties: {
                            code: { type: 'string' },
                          },
                          required: ['code'],
                        },
                      },
                      required: ['error'],
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
    expect(results.length).toBe(1)
    expect(results[0].message).toBe('Объект "error" должен содержать свойство "message".')
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should not report an error when error object has unknown properties', async () => {
    const specFile = {
      ...baseSpec,
      paths: {
        '/v1/users': {
          get: {
            operationId: 'getUsers',
            summary: 'Get users',
            responses: {
              '400': {
                description: 'Bad request',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        error: {
                          type: 'object',
                          properties: {
                            code: { type: 'string' },
                            message: { type: 'string' },
                            description: { type: 'string' },
                          },
                          required: ['code', 'message'],
                        },
                      },
                      required: ['error'],
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
    expect(results.length).toBe(0)
  })

  test('should report an error when details items use field instead of param', async () => {
    const specFile = {
      ...baseSpec,
      paths: {
        '/v1/users': {
          post: {
            operationId: 'createUser',
            summary: 'Create user',
            responses: {
              '400': {
                description: 'Validation error',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        error: {
                          type: 'object',
                          properties: {
                            code: { type: 'string' },
                            message: { type: 'string' },
                            details: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  field: { type: 'string' },
                                  error: { type: 'string' },
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
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    const messages = results.map((r) => r.message)
    expect(messages).toContain('Элементы "error.details" должны содержать свойство "param".')
    expect(messages).toContain('Элементы "error.details" должны содержать свойство "message".')
  })

  test('should report an error when error.code is not a string', async () => {
    const specFile = {
      ...baseSpec,
      paths: {
        '/v1/users': {
          get: {
            operationId: 'getUsers',
            summary: 'Get users',
            responses: {
              '400': {
                description: 'Bad request',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        error: {
                          type: 'object',
                          properties: {
                            code: { type: 'integer' },
                            message: { type: 'string' },
                          },
                          required: ['code', 'message'],
                        },
                      },
                      required: ['error'],
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
    expect(results.length).toBe(1)
    expect(results[0].message).toBe('Свойство "error.code" должно быть строкой.')
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should report an error when error is not an object', async () => {
    const specFile = {
      ...baseSpec,
      paths: {
        '/v1/users': {
          get: {
            operationId: 'getUsers',
            summary: 'Get users',
            responses: {
              '400': {
                description: 'Bad request',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        error: {
                          type: 'string',
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
    expect(results.length).toBe(1)
    expect(results[0].message).toBe('Свойство "error" должно быть объектом.')
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should report an error when details is not an array', async () => {
    const specFile = {
      ...baseSpec,
      paths: {
        '/v1/users': {
          post: {
            operationId: 'createUser',
            summary: 'Create user',
            responses: {
              '400': {
                description: 'Validation error',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        error: {
                          type: 'object',
                          properties: {
                            code: { type: 'string' },
                            message: { type: 'string' },
                            details: {
                              type: 'object',
                            },
                          },
                          required: ['code', 'message'],
                        },
                      },
                      required: ['error'],
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
    expect(results.length).toBe(1)
    expect(results[0].message).toBe('Свойство "error.details" должно быть массивом.')
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should validate multiple error responses in different methods', async () => {
    const specFile = {
      ...baseSpec,
      paths: {
        '/v1/users': {
          get: {
            operationId: 'getUsers',
            summary: 'Get users',
            responses: {
              '404': {
                description: 'Not found',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        error: {
                          type: 'object',
                          properties: {
                            code: { type: 'string' },
                            message: { type: 'string' },
                          },
                          required: ['code', 'message'],
                        },
                      },
                      required: ['error'],
                    },
                  },
                },
              },
            },
          },
          post: {
            operationId: 'createUser',
            summary: 'Create user',
            responses: {
              '400': {
                description: 'Bad request',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        message: { type: 'string' },
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
    // GET 404 is valid, POST 400 is invalid (no error property)
    expect(results.length).toBe(1)
    expect(results[0].message).toBe('Схема ответа с ошибкой должна содержать свойство "error".')
    expect(results[0].path.join('.')).toContain('post')
  })

  // ========== $ref ==========

  test('should not report an error when error response schema is a valid $ref to component', async () => {
    const specFile = {
      ...baseSpec,
      paths: {
        '/v1/users': {
          get: {
            operationId: 'getUsers',
            summary: 'Get users',
            responses: {
              '404': {
                description: 'Not found',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ErrorResponse',
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          ErrorResponse: {
            type: 'object',
            properties: {
              error: {
                type: 'object',
                properties: {
                  code: { type: 'string' },
                  message: { type: 'string' },
                },
                required: ['code', 'message'],
              },
            },
            required: ['error'],
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should report an error when error response schema is an invalid $ref to component', async () => {
    const specFile = {
      ...baseSpec,
      paths: {
        '/v1/users': {
          get: {
            operationId: 'getUsers',
            summary: 'Get users',
            responses: {
              '404': {
                description: 'Not found',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ErrorResponse',
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          ErrorResponse: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].message).toBe('Схема ответа с ошибкой должна содержать свойство "error".')
    expect(results[0].severity).toBe(Severity.error)
  })

  // ========== required ==========

  test('should report an error when error field is not in required', async () => {
    const specFile = {
      ...baseSpec,
      paths: {
        '/v1/users': {
          get: {
            operationId: 'getUsers',
            summary: 'Get users',
            responses: {
              '400': {
                description: 'Bad request',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        error: {
                          type: 'object',
                          properties: {
                            code: { type: 'string' },
                            message: { type: 'string' },
                          },
                          required: ['code'],
                        },
                      },
                      required: ['error'],
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
    expect(results.length).toBe(1)
    expect(results[0].message).toBe('Свойство "error.message" должно быть объявлено в required.')
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should report an error when error.message is not in required', async () => {
    const specFile = {
      ...baseSpec,
      paths: {
        '/v1/users': {
          get: {
            operationId: 'getUsers',
            summary: 'Get users',
            responses: {
              '400': {
                description: 'Bad request',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        error: {
                          type: 'object',
                          properties: {
                            code: { type: 'string' },
                            message: { type: 'string' },
                          },
                          required: ['code'],
                        },
                      },
                      required: ['error'],
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
    expect(results.length).toBe(1)
    expect(results[0].message).toBe('Свойство "error.message" должно быть объявлено в required.')
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should report an error when details item param is not in required', async () => {
    const specFile = {
      ...baseSpec,
      paths: {
        '/v1/users': {
          post: {
            operationId: 'createUser',
            summary: 'Create user',
            responses: {
              '400': {
                description: 'Validation error',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        error: {
                          type: 'object',
                          properties: {
                            code: { type: 'string' },
                            message: { type: 'string' },
                            details: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  param: { type: 'string' },
                                  message: { type: 'string' },
                                },
                                required: ['message'],
                              },
                            },
                          },
                          required: ['code', 'message'],
                        },
                      },
                      required: ['error'],
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
    expect(results.length).toBe(1)
    expect(results[0].message).toBe(
      'Свойство "param" в элементах "error.details" должно быть объявлено в required.',
    )
    expect(results[0].severity).toBe(Severity.error)
  })

  // ========== 4XX / 5XX wildcard codes ==========

  test('should not report an error for 4XX wildcard with valid error structure', async () => {
    const specFile = {
      ...baseSpec,
      paths: {
        '/v1/users': {
          get: {
            operationId: 'getUsers',
            summary: 'Get users',
            responses: {
              '4XX': {
                description: 'Client error',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        error: {
                          type: 'object',
                          properties: {
                            code: { type: 'string' },
                            message: { type: 'string' },
                          },
                          required: ['code', 'message'],
                        },
                      },
                      required: ['error'],
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
    expect(results.length).toBe(0)
  })

  test('should report an error for 5XX wildcard with invalid error structure', async () => {
    const specFile = {
      ...baseSpec,
      paths: {
        '/v1/users': {
          get: {
            operationId: 'getUsers',
            summary: 'Get users',
            responses: {
              '5XX': {
                description: 'Server error',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        message: { type: 'string' },
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
    expect(results.length).toBe(1)
    expect(results[0].message).toBe('Схема ответа с ошибкой должна содержать свойство "error".')
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should report an error when schema has no properties at all', async () => {
    const specFile = {
      ...baseSpec,
      paths: {
        '/v1/users': {
          get: {
            operationId: 'getUsers',
            summary: 'Get users',
            responses: {
              '400': {
                description: 'Bad request',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
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
    expect(results.length).toBe(1)
    expect(results[0].message).toBe('Схема ответа с ошибкой должна содержать свойство "error".')
    expect(results[0].severity).toBe(Severity.error)
  })
})
