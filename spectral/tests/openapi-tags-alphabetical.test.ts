import { setupSpectral } from './utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from './utils/severity'

let linter: Spectral

describe('OpenAPI Tags Rule Tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/base/openapi-tags-alphabetical.yaml'
    linter = await setupSpectral(rulesFile)
  })
  test('should not report an error when tags in alphabetical', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      tags: [
        {
          name: 'A',
          description: 'Test tag',
        },
        {
          name: 'B',
          description: 'Test tag',
        },
        {
          name: 'C',
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
  test('should not report an error when tags field is not present', async () => {
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
  test('should report an error when tags not in alphabetical', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      tags: [
        {
          name: 'C',
          description: 'Test tag',
        },
        {
          name: 'B',
          description: 'Test tag',
        },
        {
          name: 'A',
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
    expect(results.length).toBe(1)
    expect(results[0].message).toBe('Tags должны быть в алфавитном порядке')
    expect(results[0].path.join('.')).toBe('tags')
    expect(results[0].severity).toBe(Severity.info)
  })
})
