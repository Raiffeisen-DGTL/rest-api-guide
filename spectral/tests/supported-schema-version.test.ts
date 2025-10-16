import { setupSpectral } from './utils/utils'
import { Spectral } from '@stoplight/spectral-core'

let linter: Spectral

beforeAll(async () => {
  const rulesFile = './rules/required/supported-schema-version.yaml'
  linter = await setupSpectral(rulesFile)
})

test('should report an error if spec not supported version', async () => {
  const testSpec = {
    openapi: '2.0.3',
    info: {
      contact: {
        url: 'https://sometestserver.ru/198',
      },
      title: 'Test Spec',
      description: 'Test specification for Jest autotests',
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
  const results = await linter.run(testSpec)
  expect(results.length).toBe(1)
  expect(results[0].path.join('.')).toBe('openapi')
  expect(results[0].message).toBe('Схема документа не равна 3+')
})

test('should report an error if spec does`t have openapi property', async () => {
  const testSpec = {
    info: {
      contact: {
        url: 'https://sometestserver.ru/198',
      },
      title: 'Test Spec',
      description: 'Test specification for Jest autotests',
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
  const results = await linter.run(testSpec)
  expect(results.length).toBe(1)
  expect(results[0].path.join('.')).toBe('')
  expect(results[0].message).toBe('Схема документа не равна 3+')
})

test('should not report an error when all spec supported version', async () => {
  const testSpec = {
    openapi: '3.0.3',
    info: {
      contact: {
        url: 'https://sometestserver.ru/198',
      },
      title: 'Test Spec',
      description: 'Test specification for Jest autotests',
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
  const results = await linter.run(testSpec)
  expect(results.length).toBe(0)
})
