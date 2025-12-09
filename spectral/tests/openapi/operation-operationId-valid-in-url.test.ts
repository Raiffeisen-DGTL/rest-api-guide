import { setupSpectral, retrieveDocument } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

let linter: Spectral

describe('Operation OperationId Valid in URL Rule Tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/openapi/operation-operationId-valid-in-url.yaml'
    linter = await setupSpectral(rulesFile)
  })
  test('should not report an error when operationId contains valid characters', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/v1/api/test': {
          get: {
            operationId: 'getTestOperation',
            summary: 'Test operation',
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
  test('should not report an error when operationId contains valid special characters', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/v1/api/test': {
          get: {
            operationId: 'get_Test-Operation.123',
            summary: 'Test operation',
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
  test('should report a warning when operationId contains invalid characters', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/v1/api/test': {
          get: {
            operationId: 'getTest Operation',
            summary: 'Test operation',
            responses: {
              '200': {
                description: 'OK',
              },
            },
          },
        },
        '/v2/api/test': {
          get: {
            operationId: 'getTest|Operation',
            summary: 'Test operation',
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
    expect(results.length).toBe(2)
    expect(results[0].path.join('.')).toBe('paths./v1/api/test.get.operationId')
    expect(results[1].path.join('.')).toBe('paths./v2/api/test.get.operationId')
    expect(results[0].message).toBe('OperationId не должен содержать запрещенных символов')
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should not report an error when operationId contains valid characters in externally referenced path', async () => {
    const specFile =
      './tests/openapi/testData/operationOperationIdValidInUrl/spec-with-external-path-ref-valid.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(0)
  })

  test('should report an error when operationId contains invalid characters in externally referenced path', async () => {
    const specFile =
      './tests/openapi/testData/operationOperationIdValidInUrl/spec-with-external-path-ref-invalid.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(1)
    expect(results[0].path.join('.')).toBe('paths./v1/api/test')
    expect(results[0].message).toBe('OperationId не должен содержать запрещенных символов')
    expect(results[0].severity).toBe(Severity.error)
  })
})
