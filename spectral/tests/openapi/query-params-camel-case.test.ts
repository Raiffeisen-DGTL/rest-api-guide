import { retrieveDocument, setupSpectral } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

let linter: Spectral

describe('Query Params Camel Case rule tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/openapi/base/query-params-camel-case.yaml'
    linter = await setupSpectral(rulesFile)
  })
  test('should not report an error when query params are in camelCase', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/test': {
          get: {
            parameters: [
              {
                name: 'userId',
                in: 'query',
                schema: {
                  type: 'string',
                },
              },
              {
                name: 'firstName',
                in: 'query',
                schema: {
                  type: 'string',
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
  test('should report an error when query params are not in camelCase', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/test': {
          get: {
            parameters: [
              {
                name: 'user_id',
                in: 'query',
                schema: {
                  type: 'string',
                },
              },
              {
                name: 'userId',
                in: 'query',
                schema: {
                  type: 'string',
                },
              },
              {
                name: 'first_name',
                in: 'query',
                schema: {
                  type: 'string',
                },
              },
            ],
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(2)
    expect(results[0].severity).toBe(Severity.error)
    expect(results[0].path.join('.')).toBe('paths./test.get.parameters.0.name')
    expect(results[0].message).toBe('Params должны быть в camelCase формате')
  })
  test('should not report an error when query params are in camelCase in components', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      components: {
        parameters: {
          UserIdParam: {
            name: 'userId',
            in: 'query',
            schema: {
              type: 'string',
            },
          },
        },
      },
      paths: {
        '/test': {
          get: {
            parameters: [
              {
                $ref: '#/components/parameters/UserIdParam',
              },
            ],
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })
  test('should report an error when query params are not in camelCase in components', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      components: {
        parameters: {
          UserIdParam: {
            name: 'user_id',
            in: 'query',
            schema: {
              type: 'string',
            },
          },
        },
      },
      paths: {
        '/test': {
          get: {
            parameters: [
              {
                $ref: '#/components/parameters/UserIdParam',
              },
            ],
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should report an error when query params are not in camelCase in referenced file', async () => {
    const specFile = './tests/openapi/testData/queryParams/ref-query-params-spec.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(1)
    expect(results[0].severity).toBe(Severity.error)
    expect(results[0].path.join('.')).toBe('paths./test-ref')
    expect(results[0].message).toBe('Params должны быть в camelCase формате')
  })

  test('should not report an error when query params are in camelCase in external referenced file', async () => {
    const specFile =
      './tests/openapi/testData/queryParams/query-params-camel-case-spec-external-valid.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(0)
  })

  test('should report an error when query params are not in camelCase in external referenced file', async () => {
    const specFile =
      './tests/openapi/testData/queryParams/query-params-camel-case-spec-external-invalid.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(1)
    expect(results[0].severity).toBe(Severity.error)
    expect(results[0].message).toBe('Params должны быть в camelCase формате')
  })
})
