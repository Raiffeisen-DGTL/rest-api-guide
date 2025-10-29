import { setupSpectral } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

let linter: Spectral

describe('oas3-api-servers rule tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/openapi/base/oas3-api-servers.yaml'
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
})
