import { setupSpectral, retrieveDocument } from '../utils/utils'

import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

let linter: Spectral

describe('All-off-types-consistency rule tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/openapi/base/all-off-types-consistency.yaml'
    linter = await setupSpectral(rulesFile)
  })

  test('should report an error when allOf contains nulls', async () => {
    const specFile = './tests/openapi/testData/allOffWithNulls.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(0)
  })

  test('should not report an error when allOf elements have consistent types', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.1',
      },
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/json': {
                    schema: {
                      allOf: [
                        {
                          type: 'object',
                          properties: {
                            name: { type: 'string' },
                          },
                        },
                        {
                          type: 'object',
                          properties: {
                            id: { type: 'integer' },
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
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should report an error when allOf elements have inconsistent types', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.1',
      },
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/json': {
                    schema: {
                      allOf: [
                        {
                          type: 'object',
                          properties: {
                            name: { type: 'string' },
                          },
                        },
                        {
                          type: 'string', // Inconsistent type
                          properties: {
                            id: { type: 'integer' },
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
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].path.join('.')).toBe(
      'paths./test.get.responses.200.content.application/json.schema.allOf',
    )
    expect(results[0].message).toBe('Все элементы allOf должны иметь одинаковый тип')
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should not report an error when allOf has only one element', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.1',
      },
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/json': {
                    schema: {
                      allOf: [
                        {
                          type: 'object',
                          properties: {
                            name: { type: 'string' },
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
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should not report an error when allOf elements have consistent types with refs', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.1',
      },
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
          },
          Id: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
            },
          },
        },
      },
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/json': {
                    schema: {
                      allOf: [
                        { $ref: '#/components/schemas/User' },
                        { $ref: '#/components/schemas/Id' },
                      ],
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
  test('should not report an error when allOf elements have consistent types (with refs)', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.1',
      },
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
          },
          Id: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
            },
          },
        },
      },
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/json': {
                    schema: {
                      allOf: [
                        { $ref: '#/components/schemas/User' },
                        { $ref: '#/components/schemas/Id' },
                      ],
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

  test('should report an error when allOf elements have inconsistent types (with refs)', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.1',
      },
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
          },
          Id: {
            type: 'string', // Inconsistent type
            properties: {
              id: { type: 'integer' },
            },
          },
        },
      },
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/json': {
                    schema: {
                      allOf: [
                        { $ref: '#/components/schemas/User' },
                        { $ref: '#/components/schemas/Id' },
                      ],
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
    expect(results[0].path.join('.')).toBe(
      'paths./test.get.responses.200.content.application/json.schema.allOf',
    )
    expect(results[0].message).toBe('Все элементы allOf должны иметь одинаковый тип')
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should not report an error when allOf has only one element with ref', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.1',
      },
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
          },
        },
      },
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/json': {
                    schema: {
                      allOf: [{ $ref: '#/components/schemas/User' }],
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

  test('should handle mixed direct and referenced schemas correctly', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.1',
      },
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
          },
        },
      },
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/json': {
                    schema: {
                      allOf: [
                        { $ref: '#/components/schemas/User' },
                        {
                          type: 'object',
                          properties: {
                            id: { type: 'integer' },
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
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })
  test('should report error when mixed direct and referenced schemas incorrectly', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.1',
      },
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
          },
        },
      },
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/json': {
                    schema: {
                      allOf: [
                        { $ref: '#/components/schemas/User' },
                        {
                          type: 'string',
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
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].path.join('.')).toBe(
      'paths./test.get.responses.200.content.application/json.schema.allOf',
    )
    expect(results[0].message).toBe('Все элементы allOf должны иметь одинаковый тип')
    expect(results[0].severity).toBe(Severity.error)
  })
})
