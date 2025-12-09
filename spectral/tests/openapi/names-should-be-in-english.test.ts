import { retrieveDocument, setupSpectral } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

let linter: Spectral

describe('Names Should Be In English rule tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/openapi/names-should-be-in-english.yaml'
    linter = await setupSpectral(rulesFile)
  })

  test('should not report an error when all names are in English', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/v1/api/users': {
          get: {
            operationId: 'getUsers',
            parameters: [
              {
                name: 'userId',
                in: 'query',
                schema: {
                  type: 'string',
                },
              },
            ],
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        name: {
                          type: 'string',
                        },
                        age: {
                          type: 'integer',
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
      components: {
        parameters: {
          resourceId: {
            name: 'id',
            in: 'path',
            schema: {
              type: 'string',
            },
          },
        },
        schemas: {
          User: {
            type: 'object',
            properties: {
              firstName: {
                type: 'string',
              },
              lastName: {
                type: 'string',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should report an error when parameter name contains non-English characters', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/v1/api/users': {
          get: {
            operationId: 'getUsers',
            parameters: [
              {
                name: 'имя', // Russian characters
                in: 'query',
                schema: {
                  type: 'string',
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
    expect(results[0].path.join('.')).toBe('paths./v1/api/users.get.parameters.0.name')
    expect(results[0].message).toBe(
      'Названия полей, параметров и операций должны быть на английском языке',
    )
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should report an error when schema property name contains non-English characters', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/v1/api/users': {
          get: {
            operationId: 'getUsers',
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        имя: {
                          // Russian characters
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
    expect(results[0].message).toBe(
      'Названия полей, параметров и операций должны быть на английском языке',
    )
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should report an error when schema property names in external file contain non-English characters', async () => {
    const specFile = './tests/openapi/testData/names-should-be-in-english-spec-not-valid.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(2)
  })

  test('should not report an error when schema names in external file are in English', async () => {
    const specFile = './tests/openapi/testData/names-should-be-in-english-english-spec-valid.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(0)
  })

  test('should report an error when enum values contain non-English characters', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      components: {
        schemas: {
          Status: {
            type: 'string',
            enum: ['active', 'неактивный', 'ожидание'],
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(2)
    expect(results[0].path.join('.')).toBe('components.schemas.Status.enum.1')
    expect(results[0].message).toBe(
      'Названия полей, параметров и операций должны быть на английском языке',
    )
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should not report an error when enum values are in English', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      components: {
        schemas: {
          Status: {
            type: 'string',
            enum: ['active', 'inactive', 'pending'],
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })
})
