import { setupSpectral, retrieveDocument } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

let linter: Spectral

describe('valid-schema-example rule tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/openapi/valid-schema-example.yaml'
    linter = await setupSpectral(rulesFile)
  })

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

  test('should report an error when schema in components.schemas with allOf does not have example', async () => {
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
                      $ref: '#/components/schemas/Supplier',
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
          Supplier: {
            type: 'object',
            properties: {
              state: {
                allOf: [
                  {
                    $ref: '#/components/schemas/State',
                  },
                ],
              },
            },
          },
          State: {
            type: 'string',
            // Missing example here
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].message).toBe('Все схемы должны иметь example')
    expect(results[0].path.join('.')).toBe(
      'paths./v1/api/test.get.responses.200.content.application/json.schema.properties.state',
    )
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should not report an error when schema in components.schemas with allOf has example', async () => {
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
                      $ref: '#/components/schemas/Supplier',
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
          Supplier: {
            type: 'object',
            properties: {
              state: {
                allOf: [
                  {
                    $ref: '#/components/schemas/State',
                  },
                ],
              },
            },
          },
          State: {
            type: 'string',
            example: 'active',
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should not report an error when schema in components.schemas with oneOf has example', async () => {
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
                      $ref: '#/components/schemas/Supplier',
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
          Supplier: {
            type: 'object',
            properties: {
              state: {
                oneOf: [
                  {
                    $ref: '#/components/schemas/State',
                  },
                ],
              },
            },
          },
          State: {
            type: 'string',
            example: 'active',
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should not report an error when schema in components.schemas with anyOf has example', async () => {
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
                      $ref: '#/components/schemas/Supplier',
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
          Supplier: {
            type: 'object',
            properties: {
              state: {
                anyOf: [
                  {
                    $ref: '#/components/schemas/State',
                  },
                ],
              },
            },
          },
          State: {
            type: 'string',
            example: 'active',
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should report an error when schema in components.schemas with oneOf does not have example', async () => {
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
                      $ref: '#/components/schemas/Supplier',
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
          Supplier: {
            type: 'object',
            properties: {
              state: {
                oneOf: [
                  {
                    $ref: '#/components/schemas/State',
                  },
                ],
              },
            },
          },
          State: {
            type: 'string',
            // Missing example here
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].message).toBe('Все схемы должны иметь example')
    expect(results[0].path.join('.')).toBe(
      'paths./v1/api/test.get.responses.200.content.application/json.schema.properties.state',
    )
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should report an error when schema in components.schemas with anyOf does not have example', async () => {
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
                      $ref: '#/components/schemas/Supplier',
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
          Supplier: {
            type: 'object',
            properties: {
              state: {
                anyOf: [
                  {
                    $ref: '#/components/schemas/State',
                  },
                ],
              },
            },
          },
          State: {
            type: 'string',
            // Missing example here
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].message).toBe('Все схемы должны иметь example')
    expect(results[0].path.join('.')).toBe(
      'paths./v1/api/test.get.responses.200.content.application/json.schema.properties.state',
    )
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should not report an error when schema in components.schemas with ref inside items has example', async () => {
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
                      $ref: '#/components/schemas/Supplier',
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
          Supplier: {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                example: [
                  {
                    id: 123,
                    name: 'Test Item',
                  },
                ],
                items: {
                  $ref: '#/components/schemas/Item',
                },
              },
            },
          },
          Item: {
            type: 'object',
            example: {
              id: 123,
              name: 'Test Item',
            },
            properties: {
              id: {
                type: 'integer',
                example: 123,
              },
              name: {
                type: 'string',
                example: 'Test Item',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should report an error when schema in components.schemas with ref inside items does not have example', async () => {
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
                      $ref: '#/components/schemas/Supplier',
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
          Supplier: {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Item',
                },
              },
            },
          },
          Item: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
                // example is missing
              },
              name: {
                type: 'string',
                // example is missing
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
      'paths./v1/api/test.get.responses.200.content.application/json.schema.properties.items',
    )
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should report an error when schema in components.schemas with ref inside items does not have example for object', async () => {
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
                      $ref: '#/components/schemas/Supplier',
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
          Supplier: {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Item',
                },
              },
            },
          },
          Item: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
                example: 123,
              },
              name: {
                type: 'string',
                example: 'Test Item',
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
      'paths./v1/api/test.get.responses.200.content.application/json.schema.properties.items',
    )
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should report an error when schema in components.schemas with ref inside items does not have example for properties', async () => {
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
                      $ref: '#/components/schemas/Supplier',
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
          Supplier: {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Item',
                },
              },
            },
          },
          Item: {
            type: 'object',
            example: {
              id: 123,
              name: 'Test Item',
            },
            properties: {
              id: {
                type: 'integer',
              },
              name: {
                type: 'string',
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
      'paths./v1/api/test.get.responses.200.content.application/json.schema.properties.items',
    )
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should report an error when schema in components.schemas with anyOf has multiple refs without example', async () => {
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
                      $ref: '#/components/schemas/Supplier',
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
          Supplier: {
            type: 'object',
            properties: {
              state: {
                anyOf: [
                  {
                    $ref: '#/components/schemas/State1',
                  },
                  {
                    $ref: '#/components/schemas/State2',
                  },
                ],
              },
            },
          },
          State1: {
            type: 'string',
            // Missing example here
          },
          State2: {
            type: 'string',
            // Missing example here
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].message).toBe('Все схемы должны иметь example')
    expect(results[0].path.join('.')).toBe(
      'paths./v1/api/test.get.responses.200.content.application/json.schema.properties.state',
    )
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should not report an error when schema in components.schemas with anyOf has multiple refs with one having example', async () => {
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
                      $ref: '#/components/schemas/Supplier',
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
          Supplier: {
            type: 'object',
            properties: {
              state: {
                anyOf: [
                  {
                    $ref: '#/components/schemas/State1',
                  },
                  {
                    $ref: '#/components/schemas/State2',
                  },
                ],
              },
            },
          },
          State1: {
            type: 'string',
            // Missing example here
          },
          State2: {
            type: 'string',
            example: 'active',
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should not report an error when schema in components.schemas with anyOf has multiple refs with examples', async () => {
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
                      $ref: '#/components/schemas/Supplier',
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
          Supplier: {
            type: 'object',
            properties: {
              state: {
                anyOf: [
                  {
                    $ref: '#/components/schemas/State1',
                  },
                  {
                    $ref: '#/components/schemas/State2',
                  },
                ],
              },
            },
          },
          State1: {
            type: 'string',
            example: 'active',
          },
          State2: {
            type: 'string',
            example: 'inactive',
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should report an error when array schema does not have example', async () => {
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
                        tags: {
                          type: 'array',
                          items: {
                            type: 'string',
                            example: 'tag1',
                          },
                          // array schema itself missing example
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
      'paths./users.get.responses.200.content.application/json.schema.properties.tags',
    )
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should not report an error when array schema has example', async () => {
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
                        tags: {
                          type: 'array',
                          example: ['tag1', 'tag2'],
                          items: {
                            type: 'string',
                            example: 'tag1',
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
    expect(results.length).toBe(0)
  })

  test('should not report an error when array schema in components has example', async () => {
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
                      $ref: '#/components/schemas/User',
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
          User: {
            type: 'object',
            properties: {
              tags: {
                type: 'array',
                example: ['tag1', 'tag2'],
                items: {
                  type: 'string',
                  example: 'tag1',
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

  test('should report an error when array schema in components does not have example', async () => {
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
                      $ref: '#/components/schemas/User',
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
          User: {
            type: 'object',
            properties: {
              tags: {
                type: 'array',
                items: {
                  type: 'string',
                  example: 'tag1',
                },
                // array schema itself missing example
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
      'paths./users.get.responses.200.content.application/json.schema.properties.tags',
    )
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should not report an error when schema in external file has example', async () => {
    const specFile =
      './tests/openapi/testData/validSchemaExample/spec-with-external-model-with-example.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(0)
  })

  test('should report an error when schema in external file does not have example', async () => {
    const specFile =
      './tests/openapi/testData/validSchemaExample/spec-with-external-model-without-example.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(1)
    expect(results[0].message).toBe('Все схемы должны иметь example')
    // For external references, the error is reported at the schema level, not at the property level
    expect(results[0].path.join('.')).toBe(
      'paths./test.get.responses.200.content.application/json.schema',
    )
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should report an error when schema in external file has missing property examples', async () => {
    const specFile =
      './tests/openapi/testData/validSchemaExample/spec-with-external-model-with-partial-example.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(1)
    expect(results[0].message).toBe('Все схемы должны иметь example')
    // For external references, the error is reported at the schema level, not at the property level
    expect(results[0].path.join('.')).toBe(
      'paths./test.get.responses.200.content.application/json.schema',
    )
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should report error for complex external schema with multiple missing examples', async () => {
    const specFile =
      './tests/openapi/testData/validSchemaExample/spec-with-complex-external-model-without-examples.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(1)
    expect(results[0].message).toBe('Все схемы должны иметь example')
    expect(results[0].path.join('.')).toBe(
      'paths./test.get.responses.200.content.application/json.schema',
    )
    expect(results[0].severity).toBe(Severity.error)
  })
})
