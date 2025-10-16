import { retrieveDocument, setupSpectral } from './utils/utils'
import { Spectral } from '@stoplight/spectral-core'

let linter: Spectral

beforeAll(async () => {
  const rulesFile = './rules/required/external-ref-forbidden.yaml'
  linter = await setupSpectral(rulesFile)
})

test('should report an error if spec contains external refs', async () => {
  const specFile = './tests/testData/external-ref-forbidden-spec-error.yaml'
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
  const specFile = './tests/testData/external-ref-forbidden-spec-valid.yaml'
  const spec = retrieveDocument(specFile)
  const results = await linter.run(spec)
  expect(results.length).toBe(0)
})
