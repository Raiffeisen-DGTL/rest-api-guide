import { setupSpectral, retrieveDocument } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

let linter: Spectral

describe('Path-params rule tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/openapi/base/path-params.yaml'
    linter = await setupSpectral(rulesFile)
  })

  test('should not report an error when path parameters are properly defined and used', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/users/{id}': {
          get: {
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: {
                  type: 'string',
                },
              },
            ],
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
  test('should report an error when path parameters are not defined', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/users/{id}': {
          get: {
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
    expect(results[0].path.join('.')).toBe('paths./users/{id}.get')
    expect(results[0].message).toBe('Параметры пути должны быть описаны и использованы')
    expect(results[0].severity).toBe(Severity.error)
  })
  test('should not report an error when path parameters are properly defined and used in multiple operations', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/users/{id}': {
          get: {
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: {
                  type: 'string',
                },
              },
            ],
            responses: {
              '200': {
                description: 'OK',
              },
            },
          },
          put: {
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: {
                  type: 'string',
                },
              },
            ],
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

  test('should report an error when path parameters are not defined in referenced file', async () => {
    const specFile = './tests/openapi/testData/path-params/ref-with-invalid-path-params.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(1)
    expect(results[0].path.join('.')).toBe('paths./users/{id}.get')
    expect(results[0].message).toBe('Параметры пути должны быть описаны и использованы')
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should not report an error when path parameters are properly defined in external referenced file', async () => {
    const specFile = './tests/openapi/testData/path-params/path-params-external-valid.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(0)
  })

  test('should report an error when path parameters are not defined in external referenced file', async () => {
    const specFile = './tests/openapi/testData/path-params/path-params-external-invalid.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(1)
    expect(results[0].path.join('.')).toBe('paths./users/{id}')
    expect(results[0].message).toBe('Параметры пути должны быть описаны и использованы')
    expect(results[0].severity).toBe(Severity.error)
  })
})
