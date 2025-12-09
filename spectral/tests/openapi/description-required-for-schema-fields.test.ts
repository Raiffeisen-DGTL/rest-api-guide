import { setupSpectral, retrieveDocument } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

let linter: Spectral

describe('Description Required For Schema Fields rule tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/openapi/description-required-for-schema-fields.yaml'
    linter = await setupSpectral(rulesFile)
  })

  test('should not report an error when schema properties have descriptions', async () => {
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
              id: {
                type: 'integer',
                description: 'User identifier',
              },
              name: {
                type: 'string',
                description: 'User name',
              },
            },
          },
        },
      },
    }

    const result = await linter.run(specFile)
    expect(result.length).toBe(0)
  })

  test('should report an error when schema properties do not have descriptions', async () => {
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
              id: {
                type: 'integer',
              },
              name: {
                type: 'string',
                description: 'User name',
              },
            },
          },
        },
      },
    }

    const result = await linter.run(specFile)
    expect(result.length).toBe(1)
    expect(result[0].path.join('.')).toBe('components.schemas.User.properties.id')
    expect(result[0].message).toBe('У каждого поля в схеме должен быть description')
    expect(result[0].severity).toBe(Severity.error)
  })

  test('should report errors for multiple schema properties without descriptions', async () => {
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
              id: {
                type: 'integer',
              },
              name: {
                type: 'string',
              },
              email: {
                type: 'string',
                description: 'User email',
              },
            },
          },
        },
      },
    }

    const result = await linter.run(specFile)
    expect(result.length).toBe(2)
  })

  test('should not report an error when enum values have descriptions', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.1',
      },
      components: {
        schemas: {
          Status: {
            type: 'string',
            description: 'Status enum',
            enum: ['active', 'inactive'],
          },
        },
      },
    }

    // The rule checks for description field in enum[*], which are the literal values
    // Since 'active' and 'inactive' are strings, not objects, they don't have description fields
    // So this test is checking that we don't误interpret the rule
    const result = await linter.run(specFile)
    expect(result.length).toBe(0)
  })

  test('should report an error when enum values do not have descriptions', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.1',
      },
      components: {
        schemas: {
          Status: {
            type: 'string',
            description: 'Status enum',
            enum: [
              {
                const: 'active',
              },
              {
                const: 'inactive',
                description: 'Inactive status',
              },
            ],
          },
        },
      },
    }

    const result = await linter.run(specFile)
    expect(result.length).toBe(1)
  })

  test('should report errors for multiple enum values without descriptions', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.1',
      },
      components: {
        schemas: {
          Status: {
            type: 'string',
            description: 'Status enum',
            enum: [
              {
                const: 'active',
              },
              {
                const: 'inactive',
              },
              {
                const: 'pending',
                description: 'Pending status',
              },
            ],
          },
        },
      },
    }

    const result = await linter.run(specFile)
    expect(result.length).toBe(2)
  })

  test('should not report an error for nested schema properties with descriptions', async () => {
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
              id: {
                type: 'integer',
                description: 'User identifier',
              },
              address: {
                type: 'object',
                description: 'User address',
                properties: {
                  street: {
                    type: 'string',
                    description: 'Street name',
                  },
                  city: {
                    type: 'string',
                    description: 'City name',
                  },
                },
              },
            },
          },
        },
      },
    }

    const result = await linter.run(specFile)
    expect(result.length).toBe(0)
  })

  test('should report an error for nested schema properties without descriptions', async () => {
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
              id: {
                type: 'integer',
                description: 'User identifier',
              },
              address: {
                type: 'object',
                description: 'User address',
                properties: {
                  street: {
                    type: 'string',
                  },
                  city: {
                    type: 'string',
                    description: 'City name',
                  },
                },
              },
            },
          },
        },
      },
    }

    const result = await linter.run(specFile)
    expect(result.length).toBe(1)
  })

  test('should report an error when schema property has empty description', async () => {
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
              id: {
                type: 'integer',
                description: '',
              },
              name: {
                type: 'string',
                description: 'User name',
              },
            },
          },
        },
      },
    }

    const result = await linter.run(specFile)
    expect(result.length).toBe(1)
  })

  test('should report an error when schema property has null description', async () => {
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
              id: {
                type: 'integer',
                description: null,
              },
              name: {
                type: 'string',
                description: 'User name',
              },
            },
          },
        },
      },
    }

    const result = await linter.run(specFile)
    expect(result.length).toBe(1)
  })

  test('should report an error when schema properties are referenced through $ref and do not have descriptions', async () => {
    const specFile =
      './tests/openapi/testData/description-required-for-schema-fields-spec-with-ref.yaml'
    const spec = retrieveDocument(specFile)
    const result = await linter.run(spec)
    expect(result.length).toBe(1)
    expect(result[0].code).toBe('description-required-for-schema-fields')
    expect(result[0].message).toBe('У каждого поля в схеме должен быть description')
    expect(result[0].severity).toBe(Severity.error)
  })

  test('should not report an error when schema properties are referenced through $ref and have descriptions', async () => {
    const specFile =
      './tests/openapi/testData/description-required-for-schema-fields-spec-with-ref-valid.yaml'
    const spec = retrieveDocument(specFile)
    const result = await linter.run(spec)
    expect(result.length).toBe(0)
  })
})
