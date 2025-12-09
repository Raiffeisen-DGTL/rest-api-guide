import { retrieveDocument, setupSpectral } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'

let linter: Spectral

describe('Operation Description Rule Tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/openapi/operation-description.yaml'
    linter = await setupSpectral(rulesFile)
  })

  test('should report an error when operation description is missing', async () => {
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
            operationId: 'getTest',
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
    expect(results[0].severity).toBe(1)
    expect(results[0].path.join('.')).toBe('paths./v1/api/test.get')
    expect(results[0].message).toBe(
      'Блок operation.description должен быть заполнен не пустой строкой',
    )
  })

  test('should not report an error when operation description is present', async () => {
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
            operationId: 'getTest',
            description: 'This is a test operation',
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

  test('should report an error when operation description is empty string', async () => {
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
            operationId: 'getTest',
            description: '',
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
    expect(results[0].path.join('.')).toBe('paths./v1/api/test.get.description')
    expect(results[0].message).toBe(
      'Блок operation.description должен быть заполнен не пустой строкой',
    )
  })

  test('should report an error when operation description is missing in externally referenced file', async () => {
    const specFile = './tests/openapi/testData/operationDescription/ref-test-spec.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(1)
    expect(results[0].path.join('.')).toBe('paths./test.get')
    expect(results[0].message).toBe(
      'Блок operation.description должен быть заполнен не пустой строкой',
    )
  })

  test('should report an error when operation description is missing in externally referenced path', async () => {
    const specFile =
      './tests/openapi/testData/operationDescription/spec-with-external-path-ref-missing-description.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(1)
    expect(results[0].path.join('.')).toBe('paths./users')
    expect(results[0].message).toBe(
      'Блок operation.description должен быть заполнен не пустой строкой',
    )
  })

  test('should not report an error when operation description is present in externally referenced path', async () => {
    const specFile =
      './tests/openapi/testData/operationDescription/spec-with-external-path-ref-with-description.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    // The external path file has a description for the operation, so it should not report an error
    expect(results.length).toBe(0)
  })
})
