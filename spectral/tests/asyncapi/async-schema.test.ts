import { setupSpectral } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

describe('Tests for async-schema.yaml ruleset', () => {
  let linter: Spectral
  beforeAll(async () => {
    const rulesFile = './rules/asyncapi/required/async-schema.yaml'
    linter = await setupSpectral(rulesFile)
  })

  test('should report an error for invalid AsyncAPI schema', async () => {
    const specFile = {
      asyncapi: '2.0.0',
      info: {
        title: 'Test Spec',
        version: '0.0.1',
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].severity).toBe(Severity.error)
    expect(results[0].message).toMatch('Object must have required property \"channels\"')
  })

  test('should not report an error for valid AsyncAPI schema', async () => {
    const specFile = {
      asyncapi: '2.0.0',
      info: {
        title: 'Test Spec',
        version: '0.0.1',
      },
      channels: {},
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })
})
