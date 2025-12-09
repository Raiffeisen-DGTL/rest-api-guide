import { setupSpectral, retrieveDocument } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

let linter: Spectral

describe('oas3-api-servers rule tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/openapi/oas3-api-servers.yaml'
    linter = await setupSpectral(rulesFile)
  })

  test('should not report an error when servers are properly defined', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'https://api.example.com/v1',
          description: 'Production server',
        },
      ],
      paths: {
        '/users': {
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
    expect(results.length).toBe(0)
  })

  test('should report an error when servers are missing', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      paths: {
        '/users': {
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
    expect(results[0].message).toBe('Servers должны быть заполнены')
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should report an error when servers array is empty', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      servers: [],
      paths: {
        '/users': {
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
    expect(results[0].message).toBe('Servers должны быть заполнены')
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should not report an error when servers array has multiple entries', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'https://api.example.com/v1',
          description: 'Production server',
        },
        {
          url: 'https://api-staging.example.com/v1',
          description: 'Staging server',
        },
      ],
      paths: {
        '/users': {
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
    expect(results.length).toBe(0)
  })

  test('should report an error when servers is not an array', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      servers: 'not-an-array',
      paths: {
        '/users': {
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
    expect(results[0].message).toBe('Servers должны быть заполнены')
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should not report an error when external servers are properly defined', async () => {
    const specFile = './tests/openapi/testData/oas3ApiServers/spec-with-external-servers-valid.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(0)
  })

  test('should not report an error when external servers array has multiple entries', async () => {
    const specFile =
      './tests/openapi/testData/oas3ApiServers/spec-with-external-servers-multiple.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(0)
  })

  test('should not report an error when external servers are non-empty', async () => {
    const specFile =
      './tests/openapi/testData/oas3ApiServers/spec-with-external-servers-non-empty.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(0)
  })

  test('should report an error when external reference is broken', async () => {
    const specFile =
      './tests/openapi/testData/oas3ApiServers/spec-with-external-servers-broken-ref.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    // When an external reference is broken, Spectral reports a resolution error
    // This is different from the "Servers должны быть заполнены" error
    expect(results.length).toBeGreaterThan(0)
  })

  test('should report an error when servers are missing even with external references', async () => {
    const specFile =
      './tests/openapi/testData/oas3ApiServers/spec-with-external-servers-missing.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(1)
    expect(results[0].message).toBe('Servers должны быть заполнены')
    expect(results[0].severity).toBe(Severity.error)
  })
})
