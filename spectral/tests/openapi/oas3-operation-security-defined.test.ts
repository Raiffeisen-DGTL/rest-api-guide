import { setupSpectral, retrieveDocument } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

describe('Tests for oas3-operation-security-defined.yaml ruleset', () => {
  let linter: Spectral

  beforeAll(async () => {
    const rulesFile = './rules/openapi/oas3-operation-security-defined.yaml'
    linter = await setupSpectral(rulesFile)
  })

  test('should not report an error when operation security is properly defined', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.1',
      },
      components: {
        securitySchemes: {
          api_key: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key',
          },
        },
      },
      paths: {
        '/test': {
          get: {
            security: [
              {
                api_key: [],
              },
            ],
            responses: {
              200: {
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

  test('should report an error when operation security is not defined in components', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.1',
      },
      components: {
        securitySchemes: {
          api_key: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key',
          },
        },
      },
      paths: {
        '/test': {
          get: {
            security: [
              {
                invalid_security: [],
              },
            ],
            responses: {
              200: {
                description: 'OK',
              },
            },
          },
        },
      },
    }

    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].path.join('.')).toBe('paths./test.get.security.0.invalid_security')
    expect(results[0].message).toBe(
      'Операция "security" должна быть определена в объекте "components.securitySchemes"',
    )
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should not report an error when operation not contains security', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.1',
      },
      paths: {
        '/test': {
          get: {
            responses: {
              200: {
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

  test('should not report an error when external reference contains valid security schemes', async () => {
    const specFile =
      './tests/openapi/testData/oas3OperationSecurityDefined/spec-with-external-security-schemes-ref.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(0)
  })

  test('should report an error when external reference contains undefined security scheme', async () => {
    const specFile =
      './tests/openapi/testData/oas3OperationSecurityDefined/spec-with-external-security-schemes-ref-invalid.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(1)
    expect(results[0].message).toBe(
      'Операция "security" должна быть определена в объекте "components.securitySchemes"',
    )
    expect(results[0].severity).toBe(Severity.error)
  })
})
