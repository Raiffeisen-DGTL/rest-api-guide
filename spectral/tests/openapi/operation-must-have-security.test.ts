import { setupSpectral, retrieveDocument } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

let linter: Spectral

describe('Operation Must Have Security rule tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/openapi/operation-must-have-security.yaml'
    linter = await setupSpectral(rulesFile)
  })

  test('should not report an error when operation has security defined', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.1',
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
              '200': {
                description: 'Success',
              },
            },
          },
        },
      },
    }

    const result = await linter.run(specFile)
    expect(result.length).toBe(0)
  })

  test('should not report an error when operation has security defined globally', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.1',
      },
      security: [
        {
          api_key: [],
        },
      ],
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                description: 'Success',
              },
            },
          },
        },
      },
    }

    const result = await linter.run(specFile)
    expect(result.length).toBe(0)
  })

  test('should report an error when operation does not have security defined', async () => {
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
              '200': {
                description: 'Success',
              },
            },
          },
        },
      },
    }

    const result = await linter.run(specFile)
    expect(result.length).toBe(1)
    expect(result[0].message).toBe(
      'Для AI Ready желательно, чтобы все операции содержали security scheme',
    )
    expect(result[0].severity).toBe(Severity.info)
  })

  test('should report an error when operation has empty security array', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.1',
      },
      paths: {
        '/test': {
          get: {
            security: [],
            responses: {
              '200': {
                description: 'Success',
              },
            },
          },
        },
      },
    }

    const result = await linter.run(specFile)
    expect(result.length).toBe(1)
    expect(result[0].message).toBe(
      'Для AI Ready желательно, чтобы все операции содержали security scheme',
    )
    expect(result[0].severity).toBe(Severity.info)
  })

  test('should not report an error for operations with security defined in multiple methods', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.1',
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
              '200': {
                description: 'Success',
              },
            },
          },
          post: {
            security: [
              {
                oauth2: ['read'],
              },
            ],
            responses: {
              '201': {
                description: 'Created',
              },
            },
          },
        },
      },
    }
    const result = await linter.run(specFile)
    expect(result.length).toBe(0)
  })

  test('should report errors for multiple operations without security', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.1',
      },
      paths: {
        '/test1': {
          get: {
            responses: {
              '200': {
                description: 'Success',
              },
            },
          },
        },
        '/test2': {
          post: {
            responses: {
              '201': {
                description: 'Created',
              },
            },
          },
        },
      },
    }

    const result = await linter.run(specFile)
    expect(result.length).toBe(2)
  })

  test('should report an error when operation is referenced through $ref and does not have security', async () => {
    const specFile = './tests/openapi/testData/operation-must-have-security-spec-with-ref.yaml'
    const spec = retrieveDocument(specFile)
    const result = await linter.run(spec)
    expect(result.length).toBe(1)
    expect(result[0].message).toBe(
      'Для AI Ready желательно, чтобы все операции содержали security scheme',
    )
  })

  test('should not report an error when operation is referenced through $ref and has security', async () => {
    const specFile =
      './tests/openapi/testData/operation-must-have-security-spec-with-ref-valid.yaml'
    const spec = retrieveDocument(specFile)
    const result = await linter.run(spec)
    expect(result.length).toBe(0)
  })
})
