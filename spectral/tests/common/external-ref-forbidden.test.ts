import { retrieveDocument, setupSpectral } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

let linter: Spectral
describe('Tests for openapi external-ref-forbidden.yaml ruleset', () => {
  beforeAll(async () => {
    const rulesFile = './rules/common/external-ref-forbidden.yaml'
    linter = await setupSpectral(rulesFile)
  })

  test('should report an error when spec contains external refs in referenced file', async () => {
    const specFile = './tests/common/testData/openapi/ref-test-spec.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(1)
    expect(results[0].path.join('.')).toBe(
      'paths./test.get.responses.200.content.application/json.schema.$ref',
    )
    expect(results[0].message).toBe(
      'Найдена ссылка на внешний компонент ./ref.yaml#/components/schemas/TestModel',
    )
  })

  test('should report an error if spec contains external refs', async () => {
    const specFile = './tests/common/testData/openapi/external-ref-forbidden-spec-error.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(1)
    expect(results[0].path.join('.')).toBe(
      'paths./v1/api/test.get.responses.200.content.application/json.schema.$ref',
    )
    expect(results[0].message).toBe(
      'Найдена ссылка на внешний компонент /external-ref-forbidden-spec-error-additional.yaml#/components/schemas/TheGoodModel',
    )
  })

  test('should not report an error when all refs are internal', async () => {
    const specFile = './tests/common/testData/openapi/external-ref-forbidden-spec-valid.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(0)
  })
})

describe('Tests for asyncapi external-ref-forbidden.yaml ruleset', () => {
  beforeAll(async () => {
    const rulesFile = './rules/common/external-ref-forbidden.yaml'
    linter = await setupSpectral(rulesFile)
  })

  test('should report an error if spec contains external refs (YAML file)', async () => {
    const specFile = './tests/common/testData/asyncapi/external-ref-forbidden-spec-error.yaml'
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
    const specFile = './tests/common/testData/asyncapi/external-ref-forbidden-spec-valid.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(0)
  })

  test('should not report an error for internal references to blocks like servers or channels', async () => {
    const specFile =
      './tests/common/testData/asyncapi/external-ref-forbidden-spec-internal-blocks.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(0)
  })

  test('should not report an error for internal references to servers block', async () => {
    const specFile = './tests/common/testData/asyncapi/external-ref-forbidden-spec-servers-ref.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(0)
  })
})
