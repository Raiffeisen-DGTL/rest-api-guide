import { setupSpectral } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

let linter: Spectral

describe('OpenAPI Tags Rule Tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/openapi/base/openapi-tags.yaml'
    linter = await setupSpectral(rulesFile)
  })
  test('should not report an error when tags array has at least one item', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      tags: [
        {
          name: 'test',
          description: 'Test tag',
        },
      ],
      paths: {
        '/v1/api/test': {
          get: {
            summary: 'Test operation',
            operationId: 'getTest',
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
  test('should not report an error when tags field is not present (rule checks root level)', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/v1/api/test': {
          get: {
            summary: 'Test operation',
            operationId: 'getTest',
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
  test('should report an error when tags array is empty', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      tags: [],
      paths: {
        '/v1/api/test': {
          get: {
            summary: 'Test operation',
            operationId: 'getTest',
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
    expect(results[0].message).toBe('Массив tags не должен быть пустым')
    expect(results[0].severity).toBe(Severity.error)
  })
})
