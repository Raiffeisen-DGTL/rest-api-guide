import { setupSpectral } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

let linter: Spectral

describe('oas3-server-variables rule tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/openapi/base/oas3-server-variables.yaml'
    linter = await setupSpectral(rulesFile)
  })
  test('should not report an error when servers have valid variables', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      servers: [
        {
          url: 'https://api.{region}.example.com/{version}',
          description: 'Production server',
          variables: {
            version: {
              default: 'v1',
              description: 'API version',
            },
            region: {
              default: 'us-east',
              enum: ['us-west', 'us-east'],
            },
          },
        },
      ],
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })
  test('should not report an error when servers have valid resultant url', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      servers: [
        {
          url: 'https://api.example.com:{port}/v1',
          description: 'Production server',
          variables: {
            port: {
              default: '8080',
            },
          },
        },
      ],
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })
  test('should report an error when servers have variables missing in variables', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      servers: [
        {
          url: 'https://api.example.com/{region}',
          description: 'Production server',
          variables: {
            version: {
              default: 'v1',
              description: 'API version',
            },
          },
        },
      ],
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(2)
    expect(results[0].severity).toBe(Severity.error)
    expect(results[0].path.join('.')).toBe('servers.0.variables')
    expect(results[0].message).toBe(
      'Переменные из servers должны быть определены в variables и не должно быть неиспользуемые переменных',
    )
    expect(results[1].path.join('.')).toBe('servers.0.variables.version')
  })
  test('should report an error when servers have variables wrong default value', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      servers: [
        {
          url: 'https://api.example.com/{region}',
          description: 'Production server',
          variables: {
            region: {
              default: 'us-south',
              enum: ['us-west', 'us-east'],
            },
          },
        },
      ],
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].severity).toBe(Severity.error)
    expect(results[0].path.join('.')).toBe('servers.0.variables.region.default')
  })
  test('should report an error when servers have invalid resultant url', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      servers: [
        {
          url: 'https://api.example.com:{port}/v1',
          description: 'Production server',
          variables: {
            port: {
              default: '8o80',
            },
          },
        },
      ],
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].severity).toBe(Severity.error)
    expect(results[0].path.join('.')).toBe('servers.0.variables')
  })
})
