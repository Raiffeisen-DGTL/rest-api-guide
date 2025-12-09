import { setupSpectral, retrieveDocument } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

let linter: Spectral

describe('Operation Singular Tag Rule Tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/openapi/operation-singular-tag.yaml'
    linter = await setupSpectral(rulesFile)
  })
  test('should not report an error when operation has one tag', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
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
  test('should not report an error when operation has no tags', async () => {
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
  test('should report an error when operation has more than one tag', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/v1/api/test': {
          get: {
            tags: ['test', 'production'],
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
    expect(results[0].message).toBe('Метод должен иметь не более одного тега')
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should not report an error when operation has one tag in externally referenced path', async () => {
    const specFile =
      './tests/openapi/testData/operationSingularTag/spec-with-external-path-ref-single.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(0)
  })

  test('should report an error when operation has more than one tag in externally referenced path', async () => {
    const specFile =
      './tests/openapi/testData/operationSingularTag/spec-with-external-path-ref-multiple.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(1)
    expect(results[0].message).toBe('Метод должен иметь не более одного тега')
    expect(results[0].severity).toBe(Severity.error)
  })
})
