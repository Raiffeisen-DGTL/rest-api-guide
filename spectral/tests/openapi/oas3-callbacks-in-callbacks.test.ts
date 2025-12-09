import { setupSpectral, retrieveDocument } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'

let linter: Spectral

describe('oas3_callbacks_in_callbacks rule tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/openapi/oas3-callbacks-in-callbacks.yaml'
    linter = await setupSpectral(rulesFile)
  })

  test('should not report an error when callbacks are not nested', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/test': {
          post: {
            callbacks: {
              myCallback: {
                'https://example.com/callback': {
                  post: {
                    requestBody: {
                      content: {
                        'application/json': {
                          schema: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                            },
                          },
                        },
                      },
                    },
                    responses: {
                      '200': {
                        description: 'OK',
                      },
                    },
                  },
                },
              },
            },
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

  test('should report an error when callbacks are nested', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/test': {
          post: {
            callbacks: {
              myCallback: {
                'https://example.com/callback': {
                  post: {
                    requestBody: {
                      content: {
                        'application/json': {
                          schema: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                            },
                          },
                        },
                      },
                    },
                    responses: {
                      '200': {
                        description: 'OK',
                      },
                    },
                    callbacks: {
                      nestedCallback: {
                        'https://example.com/nested': {
                          post: {
                            responses: {
                              '200': {
                                description: 'OK',
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
    expect(results[0].message).toBe('Callbacks не должны включать в себя callbacks')
    expect(results[0].path.join('.')).toBe(
      'paths./test.post.callbacks.myCallback.https://example.com/callback.post.callbacks',
    )
  })

  test('should not report an error when there are no callbacks', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/test': {
          get: {
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

  test('should report an error when external reference contains nested callbacks', async () => {
    const specFile =
      './tests/openapi/testData/oas3CallbacksInCallbacks/spec-with-external-ref-nested-callbacks.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(1)
    expect(results[0].message).toBe('Callbacks не должны включать в себя callbacks')
  })

  test('should not report an error when external reference does not contain nested callbacks', async () => {
    const specFile =
      './tests/openapi/testData/oas3CallbacksInCallbacks/spec-with-external-ref-no-nested-callbacks.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(0)
  })
})
