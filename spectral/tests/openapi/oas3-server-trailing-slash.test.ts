import { setupSpectral } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'

let linter: Spectral

describe('oas3-server-trailing-slash rule tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/openapi/base/oas3-server-trailing-slash.yaml'
    linter = await setupSpectral(rulesFile)
  })

  test('should not report an error when servers do not end with slash', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      servers: [
        {
          url: 'https://api.example.com',
          description: 'Production server',
        },
      ],
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should report an error when servers end with slash', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      servers: [
        {
          url: 'https://api.example.com/',
          description: 'Production server',
        },
        {
          url: 'https://api.example.com/',
          description: 'Test server',
        },
      ],
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(2)
    expect(results[0].severity).toBe(2)
    expect(results[0].message).toBe('Servers не должны заканчиваться на символ /')
  })
})
