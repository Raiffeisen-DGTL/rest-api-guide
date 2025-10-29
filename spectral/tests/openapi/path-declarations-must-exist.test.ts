import { setupSpectral } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'

let linter: Spectral

beforeAll(async () => {
  const rulesFile = './rules/openapi/base/path-declarations-must-exist.yaml'
  linter = await setupSpectral(rulesFile)
})

test('should report an error when path contains empty declaration "{}"', async () => {
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
      '/v1/api/{id}': {
        get: {
          tags: ['testing endpoint'],
          summary: 'Для тестирования правил',
          operationId: 'getById',
          responses: {
            '200': {
              description: 'OK',
            },
          },
        },
      },
      '/v1/api/{}': {
        get: {
          tags: ['testing endpoint'],
          summary: 'Для тестирования правил',
          operationId: 'getByEmpty',
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
  expect(results[0].path.join('.')).toBe('paths./v1/api/{}')
  expect(results[0].message).toBe(
    'Параметры пути не должны записываться пустыми элементами, например "/given/{}"',
  )
})

test('should not report an error when path does not contain empty declaration', async () => {
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
      '/v1/api/{id}': {
        get: {
          tags: ['testing endpoint'],
          summary: 'Для тестирования правил',
          operationId: 'getById',
          responses: {
            '200': {
              description: 'OK',
            },
          },
        },
      },
      '/v1/api/{userId}': {
        get: {
          tags: ['testing endpoint'],
          summary: 'Для тестирования правил',
          operationId: 'getByUserId',
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

test('should report an error when path contains multiple empty declarations', async () => {
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
      '/v1/api/{}': {
        get: {
          tags: ['testing endpoint'],
          summary: 'Для тестирования правил',
          operationId: 'getByEmpty',
          responses: {
            '200': {
              description: 'OK',
            },
          },
        },
      },
      '/v1/api/{}/test': {
        get: {
          tags: ['testing endpoint'],
          summary: 'Для тестирования правил',
          operationId: 'getByEmptyAndTest',
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
  expect(results.length).toBe(2)
  expect(results[0].path.join('.')).toBe('paths./v1/api/{}')
  expect(results[1].path.join('.')).toBe('paths./v1/api/{}/test')
  expect(results[0].message).toBe(
    'Параметры пути не должны записываться пустыми элементами, например "/given/{}"',
  )
})
