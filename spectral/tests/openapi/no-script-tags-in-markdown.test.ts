import { retrieveDocument, setupSpectral } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'

let linter: Spectral

beforeAll(async () => {
  const rulesFile = './rules/openapi/base/no-script-tags-in-markdown.yaml'
  linter = await setupSpectral(rulesFile)
})

test("should not report an error when spec don't have script", async () => {
  const specFile = './tests/openapi/testData/no-script-tags-in-markdown-spec-valid.yaml'
  const spec = retrieveDocument(specFile)
  const results = await linter.run(spec)
  expect(results.length).toBe(0)
})

test('should report an error when spec have script', async () => {
  const specFile = './tests/openapi/testData/no-script-tags-in-markdown-spec-error.yaml'
  const spec = retrieveDocument(specFile)
  const results = await linter.run(spec)
  expect(results.length).toBe(5)
  expect(results[0].path.join('.')).toBe('info.title')
  expect(results[1].path.join('.')).toBe('servers.0.description')
  expect(results[2].path.join('.')).toBe('servers.1.description')
  expect(results[3].path.join('.')).toBe('paths./v1/api/test.get.responses.200.description')
  expect(results[4].path.join('.')).toBe(
    'components.schemas.TheGoodModel.properties.number_of_connectors.description',
  )
  expect(results[0].message).toBe('Блок description и title не должен содержать <script>')
})
