import { setupSpectral } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

describe('Method Request Response Components Rule Tests', () => {
  let linter: Spectral

  beforeAll(async () => {
    // Use our isolated ruleset for testing
    const rulesFile = './rules/openapi/base/method-request-response-components.yaml'
    linter = await setupSpectral(rulesFile)
  })

  test('should not report an error when request body and response schemas have $ref fields', async () => {
    const specFile = {
      openapi: '3.0.0',
      paths: {
        '/users': {
          get: {
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/User',
                    },
                  },
                },
              },
            },
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/UserInput',
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
              id: { type: 'integer' },
              name: { type: 'string' },
            },
          },
          UserInput: {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should report an error when request body schema does not have $ref field', async () => {
    const specFile = {
      openapi: '3.0.0',
      paths: {
        '/users': {
          get: {
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/User',
                    },
                  },
                },
              },
            },
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
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
              id: { type: 'integer' },
              name: { type: 'string' },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].path.join('.')).toBe(
      'paths./users.get.requestBody.content.application/json.schema',
    )
    expect(results[0].message).toBe(
      'Тело запроса и ответа должны быть вынесены в блок components как schema',
    )
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should report an error when response schema does not have $ref field', async () => {
    const specFile = {
      openapi: '3.0.0',
      paths: {
        '/users': {
          get: {
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/UserInput',
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          UserInput: {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].path.join('.')).toBe(
      'paths./users.get.responses.200.content.application/json.schema',
    )
    expect(results[0].message).toBe(
      'Тело запроса и ответа должны быть вынесены в блок components как schema',
    )
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should report errors for both request body and response when neither have $ref fields', async () => {
    const specFile = {
      openapi: '3.0.0',
      paths: {
        '/users': {
          get: {
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
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
    expect(results.length).toBe(2)

    // Check that we have both expected paths, regardless of order
    const paths = results.map((result) => result.path.join('.'))
    expect(paths).toContain('paths./users.get.requestBody.content.application/json.schema')
    expect(paths).toContain('paths./users.get.responses.200.content.application/json.schema')

    // Check that all results have the correct message and severity
    results.forEach((result) => {
      expect(result.message).toBe(
        'Тело запроса и ответа должны быть вынесены в блок components как schema',
      )
      expect(result.severity).toBe(Severity.error)
    })
  })

  test('should not report an error for application/octet-stream content type', async () => {
    const specFile = {
      openapi: '3.0.0',
      paths: {
        '/files': {
          post: {
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/octet-stream': {
                    schema: {
                      type: 'string',
                      format: 'binary',
                    },
                  },
                },
              },
            },
            requestBody: {
              content: {
                'application/octet-stream': {
                  schema: {
                    type: 'string',
                    format: 'binary',
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

  test('should report an error for application/json but not for application/octet-stream in the same spec', async () => {
    const specFile = {
      openapi: '3.0.0',
      paths: {
        '/mixed': {
          post: {
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer' },
                      },
                    },
                  },
                  'application/octet-stream': {
                    schema: {
                      type: 'string',
                      format: 'binary',
                    },
                  },
                },
              },
            },
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                    },
                  },
                },
                'application/octet-stream': {
                  schema: {
                    type: 'string',
                    format: 'binary',
                  },
                },
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(2)

    // Check that errors are only for application/json
    results.forEach((result) => {
      expect(result.path.join('.')).toMatch('application/json')
    })
  })
})
