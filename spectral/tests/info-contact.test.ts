import { setupSpectral } from './utils/utils'
import { Spectral } from '@stoplight/spectral-core'

let linter: Spectral

beforeAll(async () => {
  const rulesFile = './rules/base/info-contact.yaml'
  linter = await setupSpectral(rulesFile)
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
  expect(results[0].message).toBe('Блок info должен содержать раздел contact')
})

test('should not report an error when info.contact is present', async () => {
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
  expect(results.length).toBe(0)
})
