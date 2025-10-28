import { setupSpectral } from './utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from './utils/severity'

let linter: Spectral

describe('valid-schema-example rule tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/base/valid-schema-example.yaml'
    linter = await setupSpectral(rulesFile)
  })

  // Test for components.schemas pattern
  test('should report an error when schema in components.schemas does not have example', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        contact: {
          url: 'https://sometestserver.ru/198',
        },
        title: 'Test Spec',
        version: '0.0.2',
      },
      servers: [
        {
          description: 'test',
          url: 'https://test.sometestserver.ru/',
        },
        {
          description: 'prod',
          url: 'https://prod.sometestserver.ru/',
        },
      ],
      paths: {
        '/v1/api/test': {
          get: {
            tags: ['testing endpoint'],
            summary: 'Для тестирования правил',
            operationId: 'getTest',
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/TheBadModel',
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
          TheBadModel: {
            type: 'object',
            properties: {
              number_of_connectors: {
                type: 'integer',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].message).toBe('Все схемы должны иметь example')
    expect(results[0].path.join('.')).toBe(
      'paths./v1/api/test.get.responses.200.content.application/json.schema.properties.number_of_connectors',
    )
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should not report an error when schema in components.schemas has example', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        contact: {
          url: 'https://sometestserver.ru/198',
        },
        title: 'Test Spec',
        version: '0.0.2',
      },
      servers: [
        {
          description: 'test',
          url: 'https://test.sometestserver.ru/',
        },
        {
          description: 'prod',
          url: 'https://prod.sometestserver.ru/',
        },
      ],
      paths: {
        '/v1/api/test': {
          get: {
            tags: ['testing endpoint'],
            summary: 'Для тестирования правил',
            operationId: 'getTest',
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/TheGoodModel',
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
          TheGoodModel: {
            type: 'object',
            example: {
              number_of_connectors: 4,
            },
            properties: {
              number_of_connectors: {
                type: 'integer',
                example: 4,
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  // Test for request bodies pattern
  test('should report an error when schema in request body does not have example', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      paths: {
        '/users': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string',
                        // example is missing
                      },
                    },
                  },
                },
              },
            },
            responses: {
              '201': {
                description: 'Created',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].message).toBe('Все схемы должны иметь example')
    expect(results[0].path.join('.')).toBe(
      'paths./users.post.requestBody.content.application/json.schema.properties.name',
    )
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should not report an error when schema in request body has example', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      paths: {
        '/users': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    example: {
                      name: 'John Doe',
                    },
                    properties: {
                      name: {
                        type: 'string',
                        example: 'John Doe',
                      },
                    },
                  },
                },
              },
            },
            responses: {
              '201': {
                description: 'Created',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  // Test for response bodies pattern
  test('should report an error when schema in response body does not have example', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      paths: {
        '/users': {
          get: {
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'integer',
                          // example is missing
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
    expect(results[0].message).toBe('Все схемы должны иметь example')
    expect(results[0].path.join('.')).toBe(
      'paths./users.get.responses.200.content.application/json.schema.properties.id',
    )
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should not report an error when schema in response body has example', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      paths: {
        '/users': {
          get: {
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      example: {
                        id: 123,
                      },
                      properties: {
                        id: {
                          type: 'integer',
                          example: 123,
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
    expect(results.length).toBe(0)
  })

  // Test for parameters pattern
  test('should report an error when schema in parameter does not have example', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      paths: {
        '/users/{id}': {
          get: {
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: {
                  type: 'integer',
                  // example is missing
                },
              },
            ],
            responses: {
              '200': {
                description: 'OK',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].message).toBe('Все схемы должны иметь example')
    expect(results[0].path.join('.')).toBe('paths./users/{id}.get.parameters.0.schema')
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should not report an error when schema in parameter has example', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      paths: {
        '/users/{id}': {
          get: {
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: {
                  type: 'integer',
                  example: 123,
                },
              },
            ],
            responses: {
              '200': {
                description: 'OK',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  // Test for headers pattern
  test('should report an error when schema in header does not have example', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      paths: {
        '/users': {
          get: {
            responses: {
              '200': {
                description: 'OK',
                headers: {
                  'X-Rate-Limit': {
                    schema: {
                      type: 'integer',
                      // example is missing
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
    expect(results[0].message).toBe('Все схемы должны иметь example')
    expect(results[0].path.join('.')).toBe(
      'paths./users.get.responses.200.headers.X-Rate-Limit.schema',
    )
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should not report an error when schema in header has example', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      paths: {
        '/users': {
          get: {
            responses: {
              '200': {
                description: 'OK',
                headers: {
                  'X-Rate-Limit': {
                    schema: {
                      type: 'integer',
                      example: 100,
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

  // Test for non-JSON content type exclusion
  test('should not report an error for schema in non-JSON content type', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      paths: {
        '/users': {
          post: {
            requestBody: {
              content: {
                'text/plain': {
                  schema: {
                    type: 'string',
                    // example is missing, but should be ignored because content type is not application/json
                  },
                },
              },
            },
            responses: {
              '201': {
                description: 'Created',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should report an error for schema in JSON content type when example is missing', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      paths: {
        '/users': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string',
                        // example is missing and content type is application/json, so should report error
                      },
                    },
                  },
                },
              },
            },
            responses: {
              '201': {
                description: 'Created',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].message).toBe('Все схемы должны иметь example')
    expect(results[0].path.join('.')).toBe(
      'paths./users.post.requestBody.content.application/json.schema.properties.name',
    )
    expect(results[0].severity).toBe(Severity.error)
  })
})
