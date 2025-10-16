import { setupSpectral } from './utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from './utils/severity'

let linter: Spectral

describe('Not Use Redirection Codes rule tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/base/not-use-redirection-codes.yaml'
    linter = await setupSpectral(rulesFile)
  })
  test('should not report an error when response codes are not redirection codes', async () => {
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
              '404': {
                description: 'Not Found',
              },
              '304': {
                description: 'Not Modified',
              },
              '500': {
                description: 'Internal server error',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })
  test('should report an error when response codes are redirection codes', async () => {
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
              '301': {
                description: 'Moved Permanently',
              },
              '302': {
                description: 'Found',
              },
              '303': {
                description: 'See Other',
              },
              '307': {
                description: 'Temporary Redirect',
              },
              '308': {
                description: 'Permanent Redirect',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(5)
    expect(results[0].path.join('.')).toBe('paths./test.get.responses.301')
    expect(results[0].message).toBe('Не используйте коды перенаправления в responses')
    expect(results[0].severity).toBe(Severity.error)
  })
  test('should report an error when response codes are redirection codes in webhooks', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      webhooks: {
        testWebhook: {
          post: {
            responses: {
              '301': {
                description: 'Moved Permanently',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].severity).toBe(Severity.error)
  })
})
