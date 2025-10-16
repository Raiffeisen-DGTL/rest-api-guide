import { setupSpectral } from './utils/utils'
import { Spectral } from '@stoplight/spectral-core'

let linter: Spectral

beforeAll(async () => {
  const rulesFile = './rules/base/operation-operationId.yaml'
  linter = await setupSpectral(rulesFile)
})

test('should report an error when operationId is missing', async () => {
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
  expect(results.length).toBe(1)
  expect(results[0].severity).toBe(0)
  expect(results[0].path.join('.')).toBe('paths./v1/api/test.get')
  expect(results[0].message).toBe('Каждый path должен иметь operationId')
})

test('should not report an error when operationId is present', async () => {
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
  expect(results.length).toBe(0)
})

test('should report an error when operationId is empty string', async () => {
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
          operationId: '',
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
  expect(results[0].path.join('.')).toBe('paths./v1/api/test.get.operationId')
  expect(results[0].message).toBe('Каждый path должен иметь operationId')
})
