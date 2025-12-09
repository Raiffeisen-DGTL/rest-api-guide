import { setupSpectral, retrieveDocument } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

let linter: Spectral

describe('Body Fields Camel Case rule tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/openapi/body-fields-camel-case.yaml'
    linter = await setupSpectral(rulesFile)
  })
  test('should not report an error when body fields are in camelCase', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/test': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      userId: {
                        type: 'string',
                      },
                      firstName: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        userId: {
                          type: 'string',
                        },
                        firstName: {
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
    expect(results.length).toBe(0)
  })
  test('should report an error when body fields are not in camelCase', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/test': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      user_id: {
                        type: 'string',
                      },
                      first_name: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        user_id: {
                          type: 'string',
                        },
                        first_name: {
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
    expect(results.length).toBe(4)
    expect(results[0].severity).toBe(Severity.error)
  })
  test('should not report an error when body fields are in camelCase in components', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              userId: {
                type: 'string',
              },
              firstName: {
                type: 'string',
              },
            },
          },
        },
      },
      paths: {
        '/test': {
          post: {
            requestBody: {
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
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })
  test('should report an error when body fields are not in camelCase in components', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              user_id: {
                type: 'string',
              },
              first_name: {
                type: 'string',
              },
            },
          },
        },
      },
      paths: {
        '/test': {
          post: {
            requestBody: {
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
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(4)
    // Check that we have errors for both properties, but order may vary
    const paths = results.map((r) => r.path.join('.'))
    expect(paths).toContain(
      'paths./test.post.requestBody.content.application/json.schema.properties.user_id',
    )
    expect(paths).toContain(
      'paths./test.post.requestBody.content.application/json.schema.properties.first_name',
    )
    expect(results[0].message).toBe('Поля в requestBody и responseBody должны быть в camelCase')
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should report error when body fields are not in camelCase in referenced file', async () => {
    const specFile = './tests/openapi/testData/ref-test-spec.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(1)
    expect(results[0].path.join('.')).toBe(
      'paths./test.get.responses.200.content.application/json.schema',
    )
    expect(results[0].message).toBe('Поля в requestBody и responseBody должны быть в camelCase')
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should not report an error when body fields are in camelCase in external file', async () => {
    const specFile = './tests/openapi/testData/spec-with-external-body-fields-valid.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(0)
  })

  test('should report errors when body fields are not in camelCase in external file', async () => {
    const specFile = './tests/openapi/testData/spec-with-external-body-fields.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(2)

    for (const result of results) {
      expect(result.message).toBe('Поля в requestBody и responseBody должны быть в camelCase')
    }
    const paths = results.map((r) => r.path.join('.'))
    expect(paths).toContain('paths./test.post.requestBody.content.application/json.schema')
    expect(paths).toContain('paths./test.post.responses.200.content.application/json.schema')
  })
})
