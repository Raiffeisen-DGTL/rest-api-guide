import { setupSpectral } from './utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from './utils/severity'

let linter: Spectral

beforeAll(async () => {
  const rulesFile = './rules/base/typed-enum.yaml'
  linter = await setupSpectral(rulesFile)
})

describe('typed-enum rule', () => {
  test('should report an error when ENUM items do not match the specified type', async () => {
    const specFile = {
      openapi: '3.0.0',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      components: {
        schemas: {
          TestModel: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                enum: ['active', 'inactive', 1],
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].path.join('.')).toBe('components.schemas.TestModel.properties.status.enum.2')
    expect(results[0].message).toBe('Каждый элемент Enum должен соответствовать указанному типу')
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should not report an error when ENUM items match the specified type', async () => {
    const specFile = {
      openapi: '3.0.0',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      components: {
        schemas: {
          TestModel: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                enum: ['active', 'inactive', 'pending'],
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })
})
