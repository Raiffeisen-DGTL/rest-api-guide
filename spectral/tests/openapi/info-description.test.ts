import { setupSpectral, retrieveDocument } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'

let linter: Spectral

beforeAll(async () => {
  const rulesFile = './rules/openapi/info-description.yaml'
  linter = await setupSpectral(rulesFile)
})

test('should report an error when info.description is missing', async () => {
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
  }
  const results = await linter.run(specFile)
  expect(results.length).toBe(1)
  expect(results[0].path.join('.')).toBe('info')
  expect(results[0].message).toBe('Блок info должен содержать раздел description')
})

test('should not report an error when info.description is present', async () => {
  const specFile = {
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
  const results = await linter.run(specFile)
  expect(results.length).toBe(0)
})

test('should report an error when info.description is missing in referenced file', async () => {
  const specFile = './tests/openapi/testData/ref-test-spec.yaml'
  const spec = retrieveDocument(specFile)
  const results = await linter.run(spec)
  // The ref-test-spec.yaml doesn't contain info.description, so we expect 1 error
  expect(results.length).toBe(1)
  expect(results[0].path.join('.')).toBe('info')
  expect(results[0].message).toBe('Блок info должен содержать раздел description')
})
