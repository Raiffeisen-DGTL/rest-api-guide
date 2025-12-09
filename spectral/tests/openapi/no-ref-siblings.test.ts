import { retrieveDocument, setupSpectral } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

let linter: Spectral

describe('No Ref Siblings rule tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/openapi/no-ref-siblings.yaml'
    linter = await setupSpectral(rulesFile)
  })
  test('should not report an error when there are no $ref siblings', async () => {
    const specFile = './tests/openapi/testData/noRefSiblings/no-ref-siblings-spec-valid.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(0)
  })
  test('should report an error when there are $ref siblings', async () => {
    const specFile = './tests/openapi/testData/noRefSiblings/no-ref-siblings-spec-error.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(1)
    expect(results[0].path.join('.')).toBe(
      'paths./v1/api/test.get.responses.200.content.application/json.schema.description',
    )
    expect(results[0].message).toBe('Рядом с $ref не должно быть property')
    expect(results[0].severity).toBe(Severity.error)
  })
  test('should not report an error when there are no $ref siblings with external references', async () => {
    const specFile =
      './tests/openapi/testData/noRefSiblings/no-ref-siblings-spec-external-valid.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(0)
  })
  test('should report an error when there are $ref siblings with external references', async () => {
    const specFile =
      './tests/openapi/testData/noRefSiblings/no-ref-siblings-spec-external-error.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(1)
    expect(results[0].path.join('.')).toBe(
      'paths./users.get.responses.200.content.application/json.schema',
    )
    expect(results[0].message).toBe('Рядом с $ref не должно быть property')
    expect(results[0].severity).toBe(Severity.error)
  })
})
