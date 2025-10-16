import { retrieveDocument, setupSpectral } from './utils/utils'
import { Spectral } from '@stoplight/spectral-core'

let linter: Spectral

beforeAll(async () => {
  const rulesFile = './rules/base/duplicated-entry-in-enum.yaml'
  linter = await setupSpectral(rulesFile)
})

test('should report an error when ENUM have duplicate entry', async () => {
  const specFile = './tests/testData/duplicated-entry-in-enum-spec-error.yaml'
  const spec = retrieveDocument(specFile)
  const results = await linter.run(spec)
  expect(results.length).toBe(1)
  expect(results[0].path.join('.')).toBe(
    'components.schemas.TheGoodModel.properties.number_of_connectors.enum',
  )
  expect(results[0].message).toBe("Duplicate entry '1,2,4,2' in enum.")
})

test("should not report an error when ENUM don't have duplicate entry", async () => {
  const specFile = './tests/testData/duplicated-entry-in-enum-spec-valid.yaml'
  const spec = retrieveDocument(specFile)
  const results = await linter.run(spec)
  expect(results.length).toBe(0)
})
