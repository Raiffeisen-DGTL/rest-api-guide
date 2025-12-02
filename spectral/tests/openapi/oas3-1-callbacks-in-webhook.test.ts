import { setupSpectral, retrieveDocument } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

let linter: Spectral

describe('oas3_1_callbacks_in_webhook rule tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/openapi/base/oas3-1-callbacks-in-webhook.yaml'
    linter = await setupSpectral(rulesFile)
  })

  test('should not report an error when webhooks do not contain callbacks', async () => {
    const specFile = {
      openapi: '3.1.0',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      webhooks: {
        myWebhook: {
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
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should report an error when webhooks contain callbacks', async () => {
    const specFile = {
      openapi: '3.1.0',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      webhooks: {
        myWebhook: {
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
              myCallback: {
                'https://example.com/callback': {
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
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].message).toBe('Webhooks не должны включать в себя callbacks')
    expect(results[0].path.join('.')).toBe('webhooks.myWebhook.post.callbacks')
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should not report an error when there are no webhooks', async () => {
    const specFile = {
      openapi: '3.1.0',
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

  test('should report an error when external webhook reference contains callbacks', async () => {
    const specFile =
      './tests/openapi/testData/oas31CallbacksInWebhook/webhook-with-external-ref.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    // The rule correctly detects callbacks in the external webhook reference
    expect(results.length).toBe(1)
    expect(results[0].path.join('.')).toBe('webhooks.myWebhook')
    expect(results[0].message).toBe('Webhooks не должны включать в себя callbacks')
    // Note: The path may vary depending on how Spectral resolves external references
  })

  test('should not report an error when external webhook reference does not contain callbacks', async () => {
    const specFile =
      './tests/openapi/testData/oas31CallbacksInWebhook/webhook-with-external-ref-no-callbacks.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    // Note: This test should pass because there are no callbacks in the main document
    // and Spectral might not resolve the external reference in this rule context.
    expect(results.length).toBe(0)
  })
})
