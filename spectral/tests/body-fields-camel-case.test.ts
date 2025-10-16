import { setupSpectral } from './utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from './utils/severity'

let linter: Spectral

describe('Body Fields Camel Case rule tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/base/body-fields-camel-case.yaml'
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
    expect(results.length).toBe(2)
    expect(results[0].path.join('.')).toBe('components.schemas.User.properties.user_id')
    expect(results[1].path.join('.')).toBe('components.schemas.User.properties.first_name')
    expect(results[0].message).toBe('Поля в requestBody и responseBody должны быть в camelCase')
    expect(results[0].severity).toBe(Severity.error)
  })
})
