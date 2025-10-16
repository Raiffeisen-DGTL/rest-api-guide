import { setupSpectral } from './utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from './utils/severity'

let linter: Spectral

describe('Operation OperationId Unique Rule Tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/base/operation-operationId-unique.yaml'
    linter = await setupSpectral(rulesFile)
  })

  test('should not report an error when operationIds are unique', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/v1/users': {
          get: {
            operationId: 'getUsers',
            summary: 'Get users',
          },
        },
        '/v1/posts': {
          get: {
            operationId: 'getPosts',
            summary: 'Get posts',
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should report an error when operationIds are not unique', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/v1/users': {
          get: {
            operationId: 'getUsers',
            summary: 'Get users',
          },
        },
        '/v1/posts': {
          get: {
            operationId: 'getUsers',
            summary: 'Get posts',
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].path.join('.')).toBe('paths./v1/posts.get.operationId')
    expect(results[0].message).toBe('OperationId должен быть уникальным')
    expect(results[0].severity).toBe(Severity.error)
  })
})
