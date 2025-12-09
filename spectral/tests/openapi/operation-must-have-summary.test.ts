import { setupSpectral, retrieveDocument } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

let linter: Spectral

describe('Operation Must Have Summary rule tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/openapi/operation-must-have-summary.yaml'
    linter = await setupSpectral(rulesFile)
  })

  test('should not report an error when operation has summary defined', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.1',
      },
      paths: {
        '/test': {
          get: {
            summary: 'Get test resource',
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

  test('should report an error when operation does not have summary defined', async () => {
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
    expect(result[0].message).toBe('Каждая операция должна содержать поле summary')
    expect(result[0].severity).toBe(Severity.error)
  })

  test('should not report an error for operations with summary defined in multiple methods', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.1',
      },
      paths: {
        '/test': {
          get: {
            summary: 'Get test resource',
            responses: {
              '200': {
                description: 'Success',
              },
            },
          },
          post: {
            summary: 'Create test resource',
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

  test('should report errors for multiple operations without summary', async () => {
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

  test('should report an error when operation has empty summary', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.1',
      },
      paths: {
        '/test': {
          get: {
            summary: '',
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
  })

  test('should report an error when operation has null summary', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.1',
      },
      paths: {
        '/test': {
          get: {
            summary: null,
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
  })

  test('should report an error when operation is referenced through $ref and does not have summary', async () => {
    const specFile = './tests/openapi/testData/operation-must-have-summary-spec-with-ref.yaml'
    const spec = retrieveDocument(specFile)
    const result = await linter.run(spec)
    expect(result.length).toBe(1)
    expect(result[0].code).toBe('operation-must-have-summary')
    expect(result[0].message).toBe('Каждая операция должна содержать поле summary')
    expect(result[0].severity).toBe(Severity.error)
  })

  test('should not report an error when operation is referenced through $ref and has summary', async () => {
    const specFile = './tests/openapi/testData/operation-must-have-summary-spec-with-ref-valid.yaml'
    const spec = retrieveDocument(specFile)
    const result = await linter.run(spec)
    expect(result.length).toBe(0)
  })
})
