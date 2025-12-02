import { setupSpectral, retrieveDocument } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

let linter: Spectral

describe('Operation Tag Defined Rule Tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/openapi/base/operation-tag-defined.yaml'
    linter = await setupSpectral(rulesFile)
  })

  test('should not report an error when operation tag define in global tags', async () => {
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
            tags: ['test'],
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

  test('should report an error when operation tag not define in global tags', async () => {
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
            tags: ['test1'],
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
    expect(results[0].path.join('.')).toBe('paths./v1/api/test.get.tags.0')
    expect(results[0].message).toBe('Tags методов должны быть определены в глобальном списке tags')
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should not report an error when operation tag is defined in global tags in externally referenced path', async () => {
    const specFile =
      './tests/openapi/testData/operationTagDefined/spec-with-external-path-ref-valid.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(0)
  })

  test('should report an error when operation tag is not defined in global tags in externally referenced path', async () => {
    const specFile =
      './tests/openapi/testData/operationTagDefined/spec-with-external-path-ref-invalid.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(1)
    expect(results[0].path.join('.')).toBe('paths./v1/api/test')
    expect(results[0].message).toBe('Tags методов должны быть определены в глобальном списке tags')
    expect(results[0].severity).toBe(Severity.error)
  })
})
