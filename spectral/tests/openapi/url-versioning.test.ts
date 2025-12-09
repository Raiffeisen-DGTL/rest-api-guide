import { setupSpectral } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

let linter: Spectral

describe('url-versioning rule tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/openapi/url-versioning.yaml'
    linter = await setupSpectral(rulesFile)
  })

  test('should not report an error when paths have correct versioning', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/v1/users': {
          get: {
            responses: {
              '200': {
                description: 'OK',
              },
            },
          },
        },
        '/v256/products': {
          post: {
            responses: {
              '201': {
                description: 'Created',
              },
            },
          },
        },
        '/beta/features': {
          get: {
            responses: {
              '200': {
                description: 'OK',
              },
            },
          },
        },
        '/v10/data': {
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

  test('should report an error when paths do not have versioning', async () => {
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
              },
            },
          },
        },
        '/products/list': {
          post: {
            responses: {
              '201': {
                description: 'Created',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(2)
    expect(results[0].message).toBe(
      'Версия должна быть указана в пути запроса, в начале метода, в формате /beta, /v1, /v2 и т.д.',
    )
    expect(results[0].path.join('.')).toBe('paths./users')
    expect(results[0].severity).toBe(Severity.error)
    expect(results[1].severity).toBe(Severity.error)
  })

  test('should report an error when paths have incorrect versioning format', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/version1/users': {
          get: {
            responses: {
              '200': {
                description: 'OK',
              },
            },
          },
        },
        '/V1/products': {
          post: {
            responses: {
              '201': {
                description: 'Created',
              },
            },
          },
        },
        '/api/v1/data': {
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
    expect(results.length).toBe(3)
    expect(results[0].message).toBe(
      'Версия должна быть указана в пути запроса, в начале метода, в формате /beta, /v1, /v2 и т.д.',
    )
    expect(results[0].path.join('.')).toBe('paths./version1/users')
    expect(results[0].severity).toBe(Severity.error)
    expect(results[1].severity).toBe(Severity.error)
    expect(results[2].severity).toBe(Severity.error)
  })
})
