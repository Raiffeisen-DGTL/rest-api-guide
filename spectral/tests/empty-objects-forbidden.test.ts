import { setupSpectral } from './utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from './utils/severity'

let linter: Spectral

describe('Empty objects forbidden rule tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/base/empty-objects-forbidden.yaml'
    linter = await setupSpectral(rulesFile)
  })
  test('should not report an error when spec does not have empty objects', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
        contact: {
          name: 'Test Contact',
        },
      },
      components: {
        schemas: {
          TheGoodModel: {
            type: 'object',
            properties: {
              emptyObject: {
                id: 'EmptyObject',
                type: 'object',
              },
              number_of_connectors: {
                type: 'integer',
                description: 'The number of extension points.',
              },
            },
          },
        },
      },
      paths: {
        '/v1/test/test': {
          post: {
            operationId: 'testId',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['testId'],
                    properties: {
                      testId: {
                        type: 'string',
                        name: 'testId',
                      },
                    },
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'Test response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        testId: {
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
  test('should report an error when spec has empty objects', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
        contact: {},
      },
      components: {
        schemas: {
          TheGoodModel: {
            type: 'object',
            properties: {
              emptyObject: {},
              number_of_connectors: {
                type: 'integer',
                description: 'The number of extension points.',
              },
            },
          },
        },
      },
      paths: {
        '/v1/test/test': {
          post: {
            operationId: 'testId',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['testId'],
                    properties: {
                      testId: {},
                    },
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'Test response',
                content: {
                  'application/json': {},
                },
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(4)
    expect(results[1].path.join('.')).toBe('components.schemas.TheGoodModel.properties.emptyObject')
    expect(results[0].path.join('.')).toBe('info.contact')
    expect(results[2].path.join('.')).toBe(
      'paths./v1/test/test.post.requestBody.content.application/json.schema.properties.testId',
    )
    expect(results[3].path.join('.')).toBe(
      'paths./v1/test/test.post.responses.200.content.application/json',
    )
    expect(results[0].message).toBe('Запрещены пустые объекты')
    expect(results[0].severity).toBe(Severity.error)
  })
})
