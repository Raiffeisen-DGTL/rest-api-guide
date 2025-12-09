import { setupSpectral } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

let linter: Spectral

describe('OpenAPI Tags Uniqueness Rule Tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/openapi/openapi-tags-uniqueness.yaml'
    linter = await setupSpectral(rulesFile)
  })

  test('should not report an error when tags are unique', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      tags: [
        {
          name: 'tag1',
          description: 'First tag',
        },
        {
          name: 'tag2',
          description: 'Second tag',
        },
      ],
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should report an error when tags are not unique', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      tags: [
        {
          name: 'tag1',
          description: 'First tag',
        },
        {
          name: 'tag1',
          description: 'Duplicate tag',
        },
      ],
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].path.join('.')).toBe('tags.1.name')
    expect(results[0].message).toBe('Названия тегов должны быть уникальными')
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should report an error when tags are not unique with multiple duplicates', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      tags: [
        {
          name: 'tag1',
          description: 'First tag',
        },
        {
          name: 'tag2',
          description: 'Second tag',
        },
        {
          name: 'tag1',
          description: 'Duplicate tag',
        },
        {
          name: 'tag2',
          description: 'Another duplicate',
        },
      ],
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(2)
    expect(results[0].message).toBe('Названия тегов должны быть уникальными')
    expect(results[0].severity).toBe(Severity.error)
  })
})
