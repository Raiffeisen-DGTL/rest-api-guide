import { setupSpectral } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

describe('Operation Success Response Rule Tests', () => {
  let linter: Spectral

  beforeAll(async () => {
    const rulesFile = './rules/openapi/base/operation-success-response.yaml'
    linter = await setupSpectral(rulesFile)
  })
  test('should not report an error when operation has 2хх successful response', async () => {
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
            responses: {
              '200': {
                description: 'Successful response',
              },
              '201': {
                description: 'Created',
              },
              '204': {
                description: 'No content',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })
  test('should not report an error when operation has 3хх successful response', async () => {
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
            responses: {
              '301': {
                description: 'Successful response',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })
  test('should report an error when operation has no successful response', async () => {
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
            responses: {
              '400': {
                description: 'Bad request',
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
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].path.join('.')).toBe('paths./v1/users.get.responses')
    expect(results[0].message).toBe('Метод должен иметь 2хх либо 3хх ответ')
    expect(results[0].severity).toBe(Severity.error)
  })
})
