import { setupSpectral, retrieveDocument } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'

describe('Tests for contact-x-team-id-required.yaml rulesets ', () => {
  let linter: Spectral
  beforeAll(async () => {
    const rulesFile = './rules/openapi/required//contact-x-team-id-required.yaml'
    linter = await setupSpectral(rulesFile)
  })

  test('should not report an error when info.contact x-team-id is present', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        contact: {
          url: 'https://sometestserver.ru/198',
          name: 'Test Team',
          'x-team-id': 198,
        },
        title: 'Test Spec',
        version: '0.0.2',
      },
      servers: [
        {
          description: 'test',
          url: 'https://test.sometestserver.ru/',
        },
        {
          description: 'prod',
          url: 'https://prod.sometestserver.ru/',
        },
      ],
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should not report an error when info is in external file and contact.x-team-id is present', async () => {
    const specFile = './tests/openapi/testData/spec-with-info-ref-id-valid.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(0)
  })

  test('should report an error when info.contact x-team-id field is missing', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        contact: {
          url: 'https://sometestserver.ru/198',
          name: 'Test Team',
        },
        title: 'Test Spec',
        version: '0.0.2',
      },
      servers: [
        {
          description: 'test',
          url: 'https://test.sometestserver.ru/',
        },
        {
          description: 'prod',
          url: 'https://prod.sometestserver.ru/',
        },
      ],
    }
    await linter.run(specFile).then((results) => {
      expect(results.length).toBe(1)
      expect(results[0].path.join('.')).toBe('info.contact')
      expect(results[0].message).toBe('Отсутствует поле info.contact.x-team-id')
    })
  })

  test('should report an error when info is in external file but contact.x-team-id is missing', async () => {
    const specFile = './tests/openapi/testData/spec-with-info-ref-id-invalid.yaml'
    const spec = retrieveDocument(specFile)
    await linter.run(spec).then((results) => {
      expect(results.length).toBe(1)
      expect(results[0].path.join('.')).toBe('info')
      expect(results[0].message).toBe('Отсутствует поле info.contact.x-team-id')
    })
  })

  test('should report an error when info.contact is missing', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      servers: [
        {
          description: 'test',
          url: 'https://test.sometestserver.ru/',
        },
        {
          description: 'prod',
          url: 'https://prod.sometestserver.ru/',
        },
      ],
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].path.join('.')).toBe('info')
    expect(results[0].message).toBe('Отсутствует поле info.contact.x-team-id')
  })
})
