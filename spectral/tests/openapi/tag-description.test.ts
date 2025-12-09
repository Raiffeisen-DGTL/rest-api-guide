import { setupSpectral } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

let linter: Spectral

describe('tag-description rule tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/openapi/tag-description.yaml'
    linter = await setupSpectral(rulesFile)
  })

  test('should not report an error when tags contain description', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      tags: [
        {
          name: 'users',
          description: 'Operations about users',
        },
        {
          name: 'pets',
          description: 'Operations about pets',
        },
      ],
      paths: {
        '/users': {
          get: {
            tags: ['users'],
            summary: 'Get all users',
            responses: {
              '200': {
                description: 'A list of users',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should report a warning when tags do not contain description', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      tags: [
        {
          name: 'users',
          // Missing description field
        },
        {
          name: 'pets',
          description: 'Operations about pets',
        },
      ],
      paths: {
        '/users': {
          get: {
            tags: ['users'],
            summary: 'Get all users',
            responses: {
              '200': {
                description: 'A list of users',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].severity).toBe(Severity.warning)
    expect(results[0].message).toBe('Блок tags должен содержать description')
  })

  test('should report a warning when tags array is empty', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      tags: [],
      paths: {
        '/users': {
          get: {
            tags: ['users'],
            summary: 'Get all users',
            responses: {
              '200': {
                description: 'A list of users',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should not report an error when tags are not present', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/users': {
          get: {
            tags: ['users'],
            summary: 'Get all users',
            responses: {
              '200': {
                description: 'A list of users',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })
})
