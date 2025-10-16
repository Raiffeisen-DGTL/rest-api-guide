import { setupSpectral } from './utils/utils'
import { Spectral } from '@stoplight/spectral-core'

let linter: Spectral

describe('Array-Items rule tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/base/array-items.yaml'
    linter = await setupSpectral(rulesFile)
  })

  test('should not report an error when array items is present in format oas3_0', async () => {
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
            properties: {
              favoriteColorSets: {
                type: 'array',
                items: {
                  type: 'string',
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

  test('should not report an error when array items is present in format oas3_1', async () => {
    const specFile = {
      openapi: '3.1.0',
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
            properties: {
              favoriteColorSets: {
                type: 'array',
                items: {
                  type: 'string',
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

  test('should report an error when array items is missing in format oas3_0', async () => {
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
              favoriteColorSets: {
                type: 'array',
                // Missing items field - this should trigger the rule
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].message).toBe('Объекты типа Array должны содержать массив элементов')
  })

  test('should report an error when array items is missing in format oas3_1', async () => {
    const specFile = {
      openapi: '3.1.0',
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
              favoriteColorSets: {
                type: 'array',
                // Missing items field - this should trigger the rule
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].message).toBe('Объекты типа Array должны содержать массив элементов')
  })

  // Test for OpenAPI 3.1 with the specific pattern: '$..[?( @ && @.type && @.type.constructor.name === "Array" && @.type.includes("array"))]'
  test('should report an error when array items is missing using 3.1 specific pattern', async () => {
    const specFile = {
      openapi: '3.1.0',
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
              favoriteColorSets: {
                type: ['array'],
                // Using array type format for 3.1 - missing items field - this should trigger the rule
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].message).toBe('Объекты типа Array должны содержать массив элементов')
  })

  // Test for OpenAPI 3.1 with the specific pattern that should NOT trigger the rule
  test('should not report an error when array items is present using 3.1 specific pattern', async () => {
    const specFile = {
      openapi: '3.1.0',
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
            properties: {
              favoriteColorSets: {
                type: ['array'],
                items: {
                  type: 'string',
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
})
