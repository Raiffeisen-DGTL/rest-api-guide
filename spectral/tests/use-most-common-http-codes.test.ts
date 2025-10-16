import { setupSpectral } from './utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from './utils/severity'

let linter: Spectral

beforeAll(async () => {
  const rulesFile = './rules/base/use-most-common-http-codes.yaml'
  linter = await setupSpectral(rulesFile)
})

describe('use-most-common-http-codes', () => {
  test('should not report an error for allowed HTTP status codes', async () => {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      paths: {
        '/users': {
          get: {
            responses: {
              '200': {
                description: 'Successful response',
              },
              '404': {
                description: 'Not found',
              },
              '500': {
                description: 'Internal server error',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(spec)
    expect(results).toHaveLength(0)
  })

  test('should report an error for disallowed HTTP status codes', async () => {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      paths: {
        '/users': {
          get: {
            responses: {
              '205': {
                description: 'Reset content',
              },
              '301': {
                description: 'Moved permanently',
              },
              '418': {
                description: "I'm a teapot",
              },
            },
          },
        },
      },
    }
    const results = await linter.run(spec)
    expect(results).toHaveLength(3)
    expect(results[0].message).toBe(
      'Используйте только наиболее распространенные коды состояния HTTP',
    )
    expect(results[0].path.join('.')).toBe('paths./users.get.responses.205')
    expect(results[0].severity).toEqual(Severity.error)
    expect(results[1].message).toBe(
      'Используйте только наиболее распространенные коды состояния HTTP',
    )
    expect(results[1].path.join('.')).toBe('paths./users.get.responses.301')
    expect(results[2].message).toBe(
      'Используйте только наиболее распространенные коды состояния HTTP',
    )
    expect(results[2].path.join('.')).toBe('paths./users.get.responses.418')
  })

  test('should report errors for multiple disallowed codes in different paths', async () => {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      paths: {
        '/users': {
          get: {
            responses: {
              '207': {
                description: 'Multi-status',
              },
            },
          },
        },
        '/orders': {
          post: {
            responses: {
              '302': {
                description: 'Found',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(spec)
    expect(results).toHaveLength(2)
    expect(results[0].message).toBe(
      'Используйте только наиболее распространенные коды состояния HTTP',
    )
    expect(results[0].path.join('.')).toBe('paths./users.get.responses.207')
    expect(results[0].severity).toEqual(Severity.error)
    expect(results[1].message).toBe(
      'Используйте только наиболее распространенные коды состояния HTTP',
    )
    expect(results[1].path.join('.')).toBe('paths./orders.post.responses.302')
    expect(results[1].severity).toEqual(Severity.error)
  })
})
