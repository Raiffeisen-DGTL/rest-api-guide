import { retrieveDocument, setupSpectral } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

let linter: Spectral

describe('OAS3 valid media example rule tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/openapi/oas3-valid-media-example.yaml'
    linter = await setupSpectral(rulesFile)
  })
  test('should not report an error when examples match the schema', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
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
                      type: 'object',
                      properties: {
                        id: {
                          type: 'integer',
                        },
                        name: {
                          type: 'string',
                        },
                      },
                    },
                    example: {
                      id: 1,
                      name: 'John Doe',
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
  test('should not report an error when examples dont provide ', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
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
                      type: 'object',
                      properties: {
                        id: {
                          type: 'integer',
                        },
                        name: {
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
  test('should report an error when example does not match the schema', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
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
                      type: 'object',
                      properties: {
                        id: {
                          type: 'integer',
                        },
                        name: {
                          type: 'string',
                        },
                      },
                    },
                    example: {
                      id: 'not-a-number',
                      name: 'John Doe',
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
      'paths./users.get.responses.200.content.application/json.example.id',
    )
    expect(results[0].message).toBe('Examples должны соответствовать объявленной схеме')
    expect(results[0].severity).toBe(Severity.error)
  })
  test('should not report an error when external schema is used with valid example', async () => {
    const specFile =
      './tests/openapi/testData/oas3ValidMediaExample/spec-with-external-valid-example.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(0)
  })
  test('should report an error when external schema is used with invalid example', async () => {
    const specFile =
      './tests/openapi/testData/oas3ValidMediaExample/spec-with-external-invalid-example.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(1)
    expect(results[0].message).toBe('Examples должны соответствовать объявленной схеме')
    expect(results[0].severity).toBe(Severity.error)
  })
})
