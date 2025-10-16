import { setupSpectral } from './utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from './utils/severity'

let linter: Spectral

beforeAll(async () => {
  const rulesFile = './rules/base/no-eval-in-markdown.yaml'
  linter = await setupSpectral(rulesFile)
})

test("should not report an error when spec don't have eval", async () => {
  const specFile = {
    openapi: '3.0.3',
    info: {
      title: 'Test Spec',
      description: 'Test Spec',
      version: '0.0.2',
    },
  }
  const results = await linter.run(specFile)
  expect(results.length).toBe(0)
})

test('should report an error when spec have eval', async () => {
  const specFile = {
    openapi: '3.0.3',
    info: {
      contact: {
        url: 'https://sometestserver.ru/198',
      },
      title: 'some title with eval("alert(\\"You are Hacked\\");")',
      version: '0.0.2',
    },
    servers: [
      {
        description: 'some description with eval("alert(\\"You are Hacked\\");")',
        url: 'https://test.sometestserver.ru/',
      },
      {
        description: 'some description with eval("alert(\\"You are Hacked\\");")',
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
              description: 'some description with eval("alert(\\"You are Hacked\\");")',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/TheGoodModel',
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        TheGoodModel: {
          type: 'object',
          properties: {
            number_of_connectors: {
              type: 'integer',
              description: 'The number of eval("alert(\\"You are Hacked\\");") extension points.',
              enum: [1, 2, 4, 5],
            },
          },
        },
      },
    },
  }
  const results = await linter.run(specFile)
  expect(results.length).toBe(5)
  expect(results[0].path.join('.')).toBe('info.title')
  expect(results[0].severity).toBe(Severity.error)
  expect(results[1].path.join('.')).toBe('servers.0.description')
  expect(results[2].path.join('.')).toBe('servers.1.description')
  expect(results[3].path.join('.')).toBe('paths./v1/api/test.get.responses.200.description')
  expect(results[4].path.join('.')).toBe(
    'components.schemas.TheGoodModel.properties.number_of_connectors.description',
  )
  expect(results[0].message).toBe('Блок description и title не должен содержать eval()')
})
