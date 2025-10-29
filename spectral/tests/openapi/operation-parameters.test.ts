import { setupSpectral } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

describe('Operation Parameters Rule Tests', () => {
  let linter: Spectral

  beforeAll(async () => {
    const rulesFile = './rules/openapi/base/operation-parameters.yaml'
    linter = await setupSpectral(rulesFile)
  })
  test('should not report an error when parameters are unique', async () => {
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
            parameters: [
              {
                name: 'userId',
                in: 'path',
                required: true,
                schema: {
                  type: 'string',
                },
              },
              {
                name: 'limit',
                in: 'query',
                required: false,
                schema: {
                  type: 'integer',
                },
              },
            ],
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })
  test('should report an error when parameters are not unique', async () => {
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
            parameters: [
              {
                name: 'userId',
                in: 'path',
                required: true,
                schema: {
                  type: 'string',
                },
              },
              {
                name: 'userId',
                in: 'path',
                required: false,
                schema: {
                  type: 'integer',
                },
              },
            ],
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].path.join('.')).toBe('paths./v1/users.get.parameters.1')
    expect(results[0].message).toBe('Параметры в методах должны быть уникальными')
    expect(results[0].severity).toBe(Severity.error)
  })
})
