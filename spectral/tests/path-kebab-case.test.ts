import { setupSpectral } from './utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from './utils/severity'

let linter: Spectral

describe('Path Kebab Case rule tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/base/path-kebab-case.yaml'
    linter = await setupSpectral(rulesFile)
  })

  test('should not report an error when path is in kebab-case', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/v1/api/test': {
          get: {
            operationId: 'getTest',
            summary: 'Test endpoint',
            responses: {
              '200': {
                description: 'OK',
              },
            },
          },
        },
        '/v1/api/test-user': {
          get: {
            operationId: 'getTest',
            summary: 'Test endpoint',
            responses: {
              '200': {
                description: 'OK',
              },
            },
          },
        },
        '/v1/api/test/{id}': {
          get: {
            operationId: 'getTest',
            summary: 'Test endpoint',
            responses: {
              '200': {
                description: 'OK',
              },
            },
          },
        },
        '/v1/api/{id}/test': {
          get: {
            operationId: 'getTest',
            summary: 'Test endpoint',
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

  test('should report an error when path is not in kebab-case', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/v1/api/testEndpoint': {
          get: {
            operationId: 'getTest',
            summary: 'Test endpoint',
            responses: {
              '200': {
                description: 'OK',
              },
            },
          },
        },
        '/v1/api/test-endpoint': {
          get: {
            operationId: 'getTest',
            summary: 'Test endpoint',
            responses: {
              '200': {
                description: 'OK',
              },
            },
          },
        },
        '/v1/api/AnotherTestEndpoint': {
          get: {
            operationId: 'getTest',
            summary: 'Test endpoint',
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
    expect(results.length).toBe(2)
    expect(results[0].severity).toBe(Severity.error)
    expect(results[0].path.join('.')).toBe('paths./v1/api/testEndpoint')
    expect(results[1].path.join('.')).toBe('paths./v1/api/AnotherTestEndpoint')
    expect(results[0].message).toBe('Path должны быть в kebabCase формате')
  })
})
