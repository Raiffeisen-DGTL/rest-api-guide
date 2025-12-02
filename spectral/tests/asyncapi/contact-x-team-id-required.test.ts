import { setupSpectral, retrieveDocument } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

describe('Tests for contact-x-team-id-required.yaml ruleset', () => {
  let linter: Spectral
  beforeAll(async () => {
    const rulesFile = './rules/asyncapi/required/contact-x-team-id-required.yaml'
    linter = await setupSpectral(rulesFile)
  })

  test('should not report an error when info.contact x-team-id is present', async () => {
    const specFile = {
      asyncapi: '2.0.0',
      info: {
        contact: {
          name: 'Test Team',
          'x-team-id': 198,
        },
        title: 'Test Spec',
        version: '0.0.1',
      },
      channels: {},
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should not report an error when info is in external file and contact.x-team-id is present', async () => {
    const specFile = './tests/asyncapi/testData/spec-with-info-ref-x-team-id-valid.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(0)
  })

  test('should report an error when info.contact x-team-id field is missing', async () => {
    const specFile = {
      asyncapi: '2.0.0',
      info: {
        contact: {
          name: 'Test Team',
        },
        title: 'Test Spec',
        version: '0.0.1',
      },
      channels: {},
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].code).toBe('contact-x-team-id-required')
    expect(results[0].severity).toBe(Severity.error)
    expect(results[0].path.join('.')).toBe('info.contact')
    expect(results[0].message).toBe('Отсутствует поле info.contact.x-team-id')
  })

  test('should report an error when info is in external file but contact.x-team-id is missing', async () => {
    const specFile = './tests/asyncapi/testData/spec-with-info-ref-invalid.yaml'
    const spec = retrieveDocument(specFile)
    await linter.run(spec).then((results) => {
      expect(results.length).toBe(1)
      expect(results[0].path.join('.')).toBe('info')
      expect(results[0].message).toBe('Отсутствует поле info.contact.x-team-id')
    })
  })

  test('should report an error when info.contact is missing', async () => {
    const specFile = {
      asyncapi: '2.0.0',
      info: {
        title: 'Test Spec',
        version: '0.0.1',
      },
      channels: {},
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].code).toBe('contact-x-team-id-required')
    expect(results[0].severity).toBe(Severity.error)
    expect(results[0].path.join('.')).toBe('info')
    expect(results[0].message).toBe('Отсутствует поле info.contact.x-team-id')
  })
})
