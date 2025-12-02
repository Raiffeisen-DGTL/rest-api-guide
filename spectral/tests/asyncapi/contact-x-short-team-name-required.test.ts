import { setupSpectral, retrieveDocument } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

describe('Tests for contact-x-short-team-name-required.yaml ruleset', () => {
  let linter: Spectral
  beforeAll(async () => {
    const rulesFile = './rules/asyncapi/required/contact-x-short-team-name-required.yaml'
    linter = await setupSpectral(rulesFile)
  })

  test('should not report an error when info.contact x-short-team-name is present', async () => {
    const specFile = {
      asyncapi: '2.0.0',
      info: {
        contact: {
          name: 'Test Team',
          'x-short-team-name': 'TT',
        },
        title: 'Test Spec',
        version: '0.0.1',
      },
      channels: {},
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should not report an error when info is in external file and contact.x-short-team-name is present', async () => {
    const specFile = './tests/asyncapi/testData/spec-with-info-ref-valid.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(0)
  })

  test('should report an error when info.contact x-short-team-name field is missing', async () => {
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
    expect(results[0].code).toBe('contact-x-short-team-name-required')
    expect(results[0].severity).toBe(Severity.error)
    expect(results[0].path.join('.')).toBe('info.contact')
    expect(results[0].message).toBe('Отсутствует поле info.contact.x-short-team-name')
  })

  test('should report an error when info is in external file but contact.x-short-team-name is missing', async () => {
    const specFile = './tests/asyncapi/testData/spec-with-info-ref-invalid.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(1)
    expect(results[0].code).toBe('contact-x-short-team-name-required')
    expect(results[0].severity).toBe(Severity.error)
    expect(results[0].path.join('.')).toBe('info')
    expect(results[0].message).toBe('Отсутствует поле info.contact.x-short-team-name')
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
    expect(results[0].code).toBe('contact-x-short-team-name-required')
    expect(results[0].severity).toBe(Severity.error)
    expect(results[0].path.join('.')).toBe('info')
    expect(results[0].message).toBe('Отсутствует поле info.contact.x-short-team-name')
  })

  test('should report an error when info is in external file but contact is missing', async () => {
    const specFile = './tests/asyncapi/testData/spec-with-info-ref-without-contact.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(1)
    expect(results[0].code).toBe('contact-x-short-team-name-required')
    expect(results[0].severity).toBe(Severity.error)
    expect(results[0].path.join('.')).toBe('info')
    expect(results[0].message).toBe('Отсутствует поле info.contact.x-short-team-name')
  })
})
