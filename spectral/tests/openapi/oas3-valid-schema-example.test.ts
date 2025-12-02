import { retrieveDocument, setupSpectral } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

let linter: Spectral

describe('oas3-valid-schema-example rule tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/openapi/base/oas3-valid-schema-example.yaml'
    linter = await setupSpectral(rulesFile)
  })

  // Test for components.schemas pattern
  test('should not report an error when example is valid in components.schemas', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
                example: 123,
              },
              name: {
                type: 'string',
                example: 'John Doe',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should report an error when example type does not match schema type in components.schemas', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
                example: 'not-an-integer', // This should trigger an error
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].path.join('.')).toBe('components.schemas.User.properties.id.example')
    expect(results[0].message).toBe(
      'Examples в описании схемы должны соответствовать объявленным типам',
    )
    expect(results[0].severity).toBe(Severity.error)
  })

  // Test for content pattern
  test('should not report an error when example is valid in content', async () => {
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
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'integer',
                            example: 123, // This should be valid
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

  test('should report an error when example type does not match schema type in content', async () => {
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
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'integer',
                            example: 'not-an-integer', // This should trigger an error
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
    expect(results.length).toBe(1)
    expect(results[0].message).toBe(
      'Examples в описании схемы должны соответствовать объявленным типам',
    )
    expect(results[0].severity).toBe(Severity.error)
  })

  // Test for headers pattern
  test('should not report an error when example is valid in headers', async () => {
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
                    description: 'Rate limit',
                    schema: {
                      type: 'integer',
                      example: 100, // This should be valid
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

  test('should report an error when example type does not match schema type in headers', async () => {
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
                    description: 'Rate limit',
                    schema: {
                      type: 'integer',
                      example: 'not-an-integer', // This should trigger an error
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
      'Examples в описании схемы должны соответствовать объявленным типам',
    )
    expect(results[0].severity).toBe(Severity.error)
  })

  // Test for parameters pattern
  test('should not report an error when example is valid in parameters', async () => {
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
                schema: {
                  type: 'integer',
                  example: 123, // This should be valid
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

  test('should report an error when example type does not match schema type in parameters', async () => {
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
                schema: {
                  type: 'integer',
                  example: 'not-an-integer', // This should trigger an error
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
    expect(results[0].message).toBe(
      'Examples в описании схемы должны соответствовать объявленным типам',
    )
    expect(results[0].severity).toBe(Severity.error)
  })

  // Test for enum validation
  test('should report an error when example is invalid for enum type in components.schemas', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      components: {
        schemas: {
          Status: {
            type: 'string',
            enum: ['active', 'inactive'],
            example: 'pending', // This should trigger an error as 'pending' is not in enum
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].message).toBe(
      'Examples в описании схемы должны соответствовать объявленным типам',
    )
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should not report an error when example matches enum type in components.schemas', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      components: {
        schemas: {
          Status: {
            type: 'string',
            enum: ['active', 'inactive'],
            example: 'active', // This should be valid
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  // Test for default values
  test('should not report an error when default value is valid in components.schemas', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
                default: 123, // This should be valid
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should report an error when default value type does not match schema type in components.schemas', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
                default: 'not-an-integer', // This should trigger an error
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].message).toBe(
      'Examples в описании схемы должны соответствовать объявленным типам',
    )
    expect(results[0].severity).toBe(Severity.error)
  })

  // Tests for external references
  test('should not report an error when external schema with valid example is referenced', async () => {
    const specFile =
      './tests/openapi/testData/oas3ValidSchemaExample/spec-with-direct-external-schema-valid-example.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(0)
  })

  test('should report an error when external schema with invalid example is referenced', async () => {
    const specFile =
      './tests/openapi/testData/oas3ValidSchemaExample/spec-with-direct-external-schema-invalid-example.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(1)
    expect(results[0].message).toBe(
      'Examples в описании схемы должны соответствовать объявленным типам',
    )
    expect(results[0].severity).toBe(Severity.error)
  })
})
