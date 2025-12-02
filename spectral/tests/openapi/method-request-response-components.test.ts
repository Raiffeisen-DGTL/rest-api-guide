import { retrieveDocument, setupSpectral } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

describe('Method Request Response Components Rule Tests', () => {
  let linter: Spectral

  beforeAll(async () => {
    // Use our isolated ruleset for testing
    const rulesFile = './rules/openapi/base/method-request-response-components.yaml'
    linter = await setupSpectral(rulesFile)
  })

  test('should report an error when request body schema does not have $ref field in referenced file', async () => {
    const specFile = './tests/openapi/testData/methodRequestResponseComponents/ref-test-spec.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(1)
    expect(results[0].path.join('.')).toBe(
      'paths./test.get.requestBody.content.application/json.schema',
    )
    expect(results[0].message).toBe(
      'Тело запроса и ответа должны быть вынесены в блок components как schema',
    )
    expect(results[0].severity).toBe(Severity.error)
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

  test('should not report errors when path is referenced externally and uses external schema refs', async () => {
    const specFile =
      './tests/openapi/testData/methodRequestResponseComponents/method-request-response-components-spec-with-external-schema-refs.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(0)
  })

  test('should report errors when path is referenced externally but main document contains inline schemas', async () => {
    const specFile =
      './tests/openapi/testData/methodRequestResponseComponents/method-request-response-components-spec-with-mixed-paths.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(3)
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should report an error when path is referenced externally', async () => {
    const specFile =
      './tests/openapi/testData/methodRequestResponseComponents/method-request-response-components-2-level-deep.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(1)
  })

  test('should not report an error when request body schema has $ref field pointing to internal component', async () => {
    const specFile = {
      openapi: '3.0.0',
      paths: {
        '/users': {
          post: {
            requestBody: {
              $ref: '#/components/requestBodies/UserCreateBody',
            },
            responses: {
              '201': {
                description: 'Created',
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
              id: { type: 'integer' },
              name: { type: 'string' },
            },
          },
          UserCreate: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
            },
          },
        },
        requestBodies: {
          UserCreateBody: {
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UserCreate',
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

  test('should not report an error when request body has $ref field pointing to external component file', async () => {
    const specFile =
      './tests/openapi/testData/methodRequestResponseComponents/method-request-response-components-spec-with-external-request-body-ref.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(0)
  })

  test('should not report an error when response has $ref field pointing to internal component', async () => {
    const specFile = {
      openapi: '3.0.0',
      paths: {
        '/users': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/UserCreate',
                  },
                },
              },
            },
            responses: {
              '201': {
                $ref: '#/components/responses/UserCreatedResponse',
              },
            },
          },
        },
      },
      components: {
        schemas: {
          UserCreate: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
            },
          },
          User: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
            },
          },
        },
        responses: {
          UserCreatedResponse: {
            description: 'Created',
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
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should not report an error when response has $ref field pointing to internal component with schema', async () => {
    const specFile = {
      openapi: '3.0.0',
      paths: {
        '/users': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/UserCreate',
                  },
                },
              },
            },
            responses: {
              '201': {
                $ref: '#/components/responses/UserCreatedResponse',
              },
            },
          },
        },
      },
      components: {
        schemas: {
          UserCreate: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
            },
          },
          User: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
            },
          },
        },
        responses: {
          UserCreatedResponse: {
            description: 'Created',
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
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should not report an error when response has $ref field pointing to external component file', async () => {
    const specFile =
      './tests/openapi/testData/methodRequestResponseComponents/method-request-response-components-spec-with-external-response-ref.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(0)
  })

  test('should not report an error when request body schema uses allOf with $ref to components.schemas', async () => {
    const specFile = {
      openapi: '3.0.0',
      paths: {
        '/users': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/UserCreate' },
                      { $ref: '#/components/schemas/UserMetadata' },
                    ],
                  },
                },
              },
            },
            responses: {
              '201': {
                description: 'Created',
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
              id: { type: 'integer' },
              name: { type: 'string' },
            },
          },
          UserCreate: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
            },
          },
          UserMetadata: {
            type: 'object',
            properties: {
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should not report an error when request body schema uses oneOf with $ref to components.schemas', async () => {
    const specFile = {
      openapi: '3.0.0',
      paths: {
        '/users': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    oneOf: [
                      { $ref: '#/components/schemas/UserCreate' },
                      { $ref: '#/components/schemas/AdminCreate' },
                    ],
                  },
                },
              },
            },
            responses: {
              '201': {
                description: 'Created',
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
              id: { type: 'integer' },
              name: { type: 'string' },
            },
          },
          UserCreate: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
            },
          },
          AdminCreate: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
              permissions: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should not report an error when request body schema uses anyOf with $ref to components.schemas', async () => {
    const specFile = {
      openapi: '3.0.0',
      paths: {
        '/users': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    anyOf: [
                      { $ref: '#/components/schemas/UserCreate' },
                      { $ref: '#/components/schemas/UserUpdate' },
                    ],
                  },
                },
              },
            },
            responses: {
              '201': {
                description: 'Created',
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
              id: { type: 'integer' },
              name: { type: 'string' },
            },
          },
          UserCreate: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
            },
            required: ['name', 'email'],
          },
          UserUpdate: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should report an error when request body schema uses allOf with inline schemas', async () => {
    const specFile = {
      openapi: '3.0.0',
      paths: {
        '/users': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          email: { type: 'string' },
                        },
                      },
                      {
                        type: 'object',
                        properties: {
                          createdAt: { type: 'string', format: 'date-time' },
                        },
                      },
                    ],
                  },
                },
              },
            },
            responses: {
              '201': {
                description: 'Created',
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
      'paths./users.post.requestBody.content.application/json.schema',
    )
    expect(results[0].message).toBe(
      'Тело запроса и ответа должны быть вынесены в блок components как schema',
    )
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should report an error when request body schema uses oneOf with inline schemas', async () => {
    const specFile = {
      openapi: '3.0.0',
      paths: {
        '/users': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    oneOf: [
                      {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          email: { type: 'string' },
                        },
                      },
                      {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          permissions: {
                            type: 'array',
                            items: { type: 'string' },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            responses: {
              '201': {
                description: 'Created',
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
      'paths./users.post.requestBody.content.application/json.schema',
    )
    expect(results[0].message).toBe(
      'Тело запроса и ответа должны быть вынесены в блок components как schema',
    )
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should report an error when request body schema uses anyOf with inline schemas', async () => {
    const specFile = {
      openapi: '3.0.0',
      paths: {
        '/users': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    anyOf: [
                      {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          email: { type: 'string' },
                        },
                        required: ['name', 'email'],
                      },
                      {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          phone: { type: 'string' },
                        },
                      },
                    ],
                  },
                },
              },
            },
            responses: {
              '201': {
                description: 'Created',
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
      'paths./users.post.requestBody.content.application/json.schema',
    )
    expect(results[0].message).toBe(
      'Тело запроса и ответа должны быть вынесены в блок components как schema',
    )
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should not report an error when responses schema uses allOf with $ref to components.schemas', async () => {
    const specFile = {
      openapi: '3.0.0',
      paths: {
        '/users': {
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
            responses: {
              '201': {
                description: 'Created',
                content: {
                  'application/json': {
                    schema: {
                      allOf: [
                        { $ref: '#/components/schemas/UserCreate' },
                        { $ref: '#/components/schemas/UserMetadata' },
                      ],
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
          UserCreate: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
            },
          },
          UserMetadata: {
            type: 'object',
            properties: {
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should not report an error when responses schema uses oneOf with $ref to components.schemas', async () => {
    const specFile = {
      openapi: '3.0.0',
      paths: {
        '/users': {
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
            responses: {
              '201': {
                description: 'Created',
                content: {
                  'application/json': {
                    schema: {
                      oneOf: [
                        { $ref: '#/components/schemas/UserCreate' },
                        { $ref: '#/components/schemas/AdminCreate' },
                      ],
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
          UserCreate: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
            },
          },
          AdminCreate: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
              permissions: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should not report an error when responses schema uses anyOf with $ref to components.schemas', async () => {
    const specFile = {
      openapi: '3.0.0',
      paths: {
        '/users': {
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
            responses: {
              '201': {
                description: 'Created',
                content: {
                  'application/json': {
                    schema: {
                      anyOf: [
                        { $ref: '#/components/schemas/UserCreate' },
                        { $ref: '#/components/schemas/UserUpdate' },
                      ],
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
          UserCreate: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
            },
            required: ['name', 'email'],
          },
          UserUpdate: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should report an error when responses schema uses allOf with inline schemas', async () => {
    const specFile = {
      openapi: '3.0.0',
      paths: {
        '/users': {
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
            responses: {
              '201': {
                description: 'Created',
                content: {
                  'application/json': {
                    schema: {
                      allOf: [
                        {
                          type: 'object',
                          properties: {
                            name: { type: 'string' },
                            email: { type: 'string' },
                          },
                        },
                        {
                          type: 'object',
                          properties: {
                            createdAt: { type: 'string', format: 'date-time' },
                          },
                        },
                      ],
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
      'paths./users.post.responses.201.content.application/json.schema',
    )
    expect(results[0].message).toBe(
      'Тело запроса и ответа должны быть вынесены в блок components как schema',
    )
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should report an error when responses schema uses oneOf with inline schemas', async () => {
    const specFile = {
      openapi: '3.0.0',
      paths: {
        '/users': {
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
            responses: {
              '201': {
                description: 'Created',
                content: {
                  'application/json': {
                    schema: {
                      oneOf: [
                        {
                          type: 'object',
                          properties: {
                            name: { type: 'string' },
                            email: { type: 'string' },
                          },
                        },
                        {
                          type: 'object',
                          properties: {
                            name: { type: 'string' },
                            permissions: {
                              type: 'array',
                              items: { type: 'string' },
                            },
                          },
                        },
                      ],
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
      'paths./users.post.responses.201.content.application/json.schema',
    )
    expect(results[0].message).toBe(
      'Тело запроса и ответа должны быть вынесены в блок components как schema',
    )
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should report an error when responses schema uses anyOf with inline schemas', async () => {
    const specFile = {
      openapi: '3.0.0',
      paths: {
        '/users': {
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
            responses: {
              '201': {
                description: 'Created',
                content: {
                  'application/json': {
                    schema: {
                      anyOf: [
                        {
                          type: 'object',
                          properties: {
                            name: { type: 'string' },
                            email: { type: 'string' },
                          },
                          required: ['name', 'email'],
                        },
                        {
                          type: 'object',
                          properties: {
                            name: { type: 'string' },
                            phone: { type: 'string' },
                          },
                        },
                      ],
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
      'paths./users.post.responses.201.content.application/json.schema',
    )
    expect(results[0].message).toBe(
      'Тело запроса и ответа должны быть вынесены в блок components как schema',
    )
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should not report an error when request body schema uses additionalProperties with $ref to components.schemas', async () => {
    const specFile = {
      openapi: '3.0.0',
      paths: {
        '/users': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    additionalProperties: {
                      $ref: '#/components/schemas/UserMetadata',
                    },
                  },
                },
              },
            },
            responses: {
              '201': {
                description: 'Created',
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
              id: { type: 'integer' },
              name: { type: 'string' },
            },
          },
          UserMetadata: {
            type: 'object',
            properties: {
              key: { type: 'string' },
              value: { type: 'string' },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should not report an error when responses schema uses additionalProperties with $ref to components.schemas', async () => {
    const specFile = {
      openapi: '3.0.0',
      paths: {
        '/users': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/UserCreate',
                  },
                },
              },
            },
            responses: {
              '201': {
                description: 'Created',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      additionalProperties: {
                        $ref: '#/components/schemas/UserMetadata',
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
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
            },
          },
          UserCreate: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
            },
            required: ['name', 'email'],
          },
          UserMetadata: {
            type: 'object',
            properties: {
              key: { type: 'string' },
              value: { type: 'string' },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should report an error when request body schema uses additionalProperties with inline schema', async () => {
    const specFile = {
      openapi: '3.0.0',
      paths: {
        '/users': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    additionalProperties: {
                      type: 'object',
                      properties: {
                        key: { type: 'string' },
                        value: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
            responses: {
              '201': {
                description: 'Created',
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
      'paths./users.post.requestBody.content.application/json.schema',
    )
    expect(results[0].message).toBe(
      'Тело запроса и ответа должны быть вынесены в блок components как schema',
    )
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should report an error when responses schema uses additionalProperties with inline schema', async () => {
    const specFile = {
      openapi: '3.0.0',
      paths: {
        '/users': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/UserCreate',
                  },
                },
              },
            },
            responses: {
              '201': {
                description: 'Created',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      additionalProperties: {
                        type: 'object',
                        properties: {
                          key: { type: 'string' },
                          value: { type: 'string' },
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
        schemas: {
          UserCreate: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
            },
            required: ['name', 'email'],
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].path.join('.')).toBe(
      'paths./users.post.responses.201.content.application/json.schema',
    )
    expect(results[0].message).toBe(
      'Тело запроса и ответа должны быть вынесены в блок components как schema',
    )
    expect(results[0].severity).toBe(Severity.error)
  })
})
