import { setupSpectral, retrieveDocument } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

let linter: Spectral
describe('Operation Must Have Tag rule tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/openapi/operation-must-have-tag.yaml'
    linter = await setupSpectral(rulesFile)
  })

  test('should report an error when tag is missing', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        contact: {
          url: 'https://sometestserver.ru/198',
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
      paths: {
        '/v1/api/test': {
          get: {
            summary: 'Для тестирования правил',
            responses: {
              '200': {
                description: 'OK',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].severity).toBe(Severity.warning)
    expect(results[0].path.join('.')).toBe('paths./v1/api/test.get')
    expect(results[0].message).toBe('Каждая операция (endpoint) должна быть снабжена тегом')
  })

  test('should not report an error when tag is present', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        contact: {
          url: 'https://sometestserver.ru/198',
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
      paths: {
        '/v1/api/test': {
          get: {
            tags: ['testing endpoint'],
            summary: 'Для тестирования правил',
            responses: {
              '200': {
                description: 'OK',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should report an error when tag is empty array', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        contact: {
          url: 'https://sometestserver.ru/198',
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
      paths: {
        '/v1/api/test': {
          get: {
            tags: [],
            summary: 'Для тестирования правил',
            responses: {
              '200': {
                description: 'OK',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].path.join('.')).toBe('paths./v1/api/test.get.tags')
    expect(results[0].severity).toBe(Severity.warning)
    expect(results[0].message).toBe('Каждая операция (endpoint) должна быть снабжена тегом')
  })

  test('should report errors for both get and post operations on the same path when tags are missing', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        contact: {
          url: 'https://sometestserver.ru/198',
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
      paths: {
        '/v1/api/test': {
          get: {
            summary: 'Get test resource',
            responses: {
              '200': {
                description: 'OK',
              },
            },
          },
          post: {
            summary: 'Create test resource',
            responses: {
              '201': {
                description: 'Created',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(2)
    expect(results[0].message).toBe('Каждая операция (endpoint) должна быть снабжена тегом')
    expect(results[0].severity).toBe(Severity.warning)
  })

  test('should report an error when operation is referenced through $ref and does not have tags', async () => {
    const specFile = './tests/openapi/testData/operation-must-have-tag-spec-with-ref.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(1)
    expect(results[0].path.join('.')).toBe('paths./test')
    expect(results[0].message).toBe('Каждая операция (endpoint) должна быть снабжена тегом')
  })

  test('should not report an error when operation is referenced through $ref and has tags', async () => {
    const specFile = './tests/openapi/testData/operation-must-have-tag-spec-with-ref-valid.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(0)
  })
})
