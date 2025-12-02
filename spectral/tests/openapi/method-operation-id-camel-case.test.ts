import { setupSpectral, retrieveDocument } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

let linter: Spectral

describe('Method OperationId Camel Case rule tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/openapi/base/method-operation-id-camel-case.yaml'
    linter = await setupSpectral(rulesFile)
  })
  test('should not report an error when operationId is in camelCase', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/v1/api/test': {
          get: {
            operationId: 'getTest',
            summary: 'Test endpoint',
            responses: {
              '200': {
                description: 'OK',
              },
            },
          },
          post: {
            operationId: 'createUser',
            summary: 'Create user',
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
    expect(results.length).toBe(0)
  })
  test('should report an error when operationId is not in camelCase', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/v1/api/test': {
          get: {
            operationId: 'get_test',
            summary: 'Test endpoint',
            responses: {
              '200': {
                description: 'OK',
              },
            },
          },
          post: {
            operationId: 'create_user',
            summary: 'Create user',
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
    expect(results[0].path.join('.')).toBe('paths./v1/api/test.get.operationId')
    expect(results[1].path.join('.')).toBe('paths./v1/api/test.post.operationId')
    expect(results[0].message).toBe('OperationId должны быть в camelCase формате')
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should not report an error when operationId is in camelCase through $ref', async () => {
    const specFile =
      './tests/openapi/testData/method-operation-id-camel-case-spec-with-ref-valid.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(0)
  })

  test('should report an error when operationId is not in camelCase through $ref', async () => {
    const specFile =
      './tests/openapi/testData/method-operation-id-camel-case-spec-with-ref-invalid.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(1)
    expect(results[0].severity).toBe(Severity.error)
  })
})
