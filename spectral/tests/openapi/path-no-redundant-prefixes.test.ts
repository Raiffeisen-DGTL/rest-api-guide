import { setupSpectral } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

let linter: Spectral

describe('Path No Redundant Prefixes Rule Tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/openapi/base/path-no-redundant-prefixes.yaml'
    linter = await setupSpectral(rulesFile)
  })
  test('should not report an error for valid paths without redundant prefixes', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/users': {
          get: {
            summary: 'Get users',
          },
          '/v1/users': {
            get: {
              summary: 'Get users v1',
            },
          },
          '/v1/users/{id}': {
            get: {
              summary: 'Get users v1',
            },
          },
          '/v1/{id}/users': {
            get: {
              summary: 'Get users v1',
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })
  test('should report an error for paths with redundant prefixes', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/api/users': {
          get: {
            summary: 'Get users',
          },
        },
        '/openapi/users': {
          get: {
            summary: 'Get users',
          },
        },
        '/v1/users': {
          get: {
            summary: 'Get users v1',
          },
        },
        '/http/users': {
          get: {
            summary: 'Get users',
          },
        },
        '/service/users': {
          get: {
            summary: 'Get users',
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(4)
    expect(results[0].severity).toBe(Severity.error)
    expect(results[0].path.join('.')).toBe('paths./api/users')
    expect(results[0].message).toBe(
      'В paths запрещено использовать сегменты api, openapi, http, service',
    )
  })
})
