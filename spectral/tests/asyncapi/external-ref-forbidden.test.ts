import { retrieveDocument, setupSpectral } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

describe('Tests for external-ref-forbidden.yaml ruleset', () => {
  let linter: Spectral

  beforeAll(async () => {
    const rulesFile = './rules/asyncapi/required/external-ref-forbidden.yaml'
    linter = await setupSpectral(rulesFile)
  })

  test('should report an error if spec contains external refs (YAML file)', async () => {
    const specFile = './tests/asyncapi/testData/external-ref-forbidden-spec-error.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(1)
    expect(results[0].code).toBe('external-ref-forbidden')
    expect(results[0].severity).toBe(Severity.error)
    expect(results[0].message).toBe(
      'Найдена ссылка на внешний компонент /external-ref-forbidden-spec-error-additional.yaml#/components/schemas/TheGoodModel',
    )
  })

  test('should not report an error when all refs are internal (YAML file)', async () => {
    const specFile = './tests/asyncapi/testData/external-ref-forbidden-spec-valid.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(0)
  })
})
