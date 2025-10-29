import { setupSpectral } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

describe('Tests for supported-schema-version.yaml ruleset', () => {
  let linter: Spectral
  beforeAll(async () => {
    const rulesFile = './rules/asyncapi/required/supported-schema-version.yaml'
    linter = await setupSpectral(rulesFile)
  })

  test('should not report an error for valid AsyncAPI version 2.x.x', async () => {
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

  test('should not report an error for valid AsyncAPI version 3.x.x', async () => {
    const specFile = {
      asyncapi: '3.0.0',
      info: {
        title: 'Test Spec',
        version: '0.0.1',
      },
      channels: {},
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should report an error when asyncapi field is missing', async () => {
    const specFile = {
      info: {
        title: 'Test Spec',
        version: '0.0.1',
      },
      channels: {},
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].code).toBe('supported-schema-version')
    expect(results[0].severity).toBe(Severity.error)
    expect(results[0].message).toBe('Схема документа не равна 2+')
  })

  test('should report an error for unsupported AsyncAPI version 1.x.x', async () => {
    const specFile = {
      asyncapi: '1.0.0',
      info: {
        title: 'Test Spec',
        version: '0.0.1',
      },
      channels: {},
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].code).toBe('supported-schema-version')
    expect(results[0].severity).toBe(Severity.error)
    expect(results[0].message).toBe('Схема документа не равна 2+')
  })

  test('should report an error for invalid version format', async () => {
    const specFile = {
      asyncapi: '2.0',
      info: {
        title: 'Test Spec',
        version: '0.0.1',
      },
      channels: {},
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].code).toBe('supported-schema-version')
    expect(results[0].severity).toBe(Severity.error)
    expect(results[0].message).toBe('Схема документа не равна 2+')
  })

  test('should report an error for another invalid version format', async () => {
    const specFile = {
      asyncapi: '2',
      info: {
        title: 'Test Spec',
        version: '0.0.1',
      },
      channels: {},
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].code).toBe('supported-schema-version')
    expect(results[0].severity).toBe(Severity.error)
    expect(results[0].message).toBe('Схема документа не равна 2+')
  })
})
