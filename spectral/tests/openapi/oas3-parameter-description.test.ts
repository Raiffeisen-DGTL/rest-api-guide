import { setupSpectral } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

let linter: Spectral

describe('oas3-parameter-description rule tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/openapi/base/oas3-parameter-description.yaml'
    linter = await setupSpectral(rulesFile)
  })

  test('should not report an error when path parameters have description', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/users/{id}': {
          get: {
            summary: 'Get user by ID',
            parameters: [
              {
                name: 'id',
                in: 'path',
                description: 'User ID',
                required: true,
                schema: {
                  type: 'integer',
                },
              },
            ],
            responses: {
              '200': {
                description: 'User object',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should report a warning when path parameters do not have description', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/users/{id}': {
          get: {
            summary: 'Get user by ID',
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: {
                  type: 'integer',
                },
                // Missing description field
              },
            ],
            responses: {
              '200': {
                description: 'User object',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].severity).toBe(Severity.warning)
    expect(results[0].message).toBe('Параметры должны иметь заполненный description')
  })

  test('should not report an error when operation parameters have description', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/users': {
          get: {
            summary: 'Get users',
            parameters: [
              {
                name: 'limit',
                in: 'query',
                description: 'Number of users to return',
                schema: {
                  type: 'integer',
                },
              },
            ],
            responses: {
              '200': {
                description: 'List of users',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should report a warning when operation parameters do not have description', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/users': {
          get: {
            summary: 'Get users',
            parameters: [
              {
                name: 'limit',
                in: 'query',
                schema: {
                  type: 'integer',
                },
                // Missing description field
              },
            ],
            responses: {
              '200': {
                description: 'List of users',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].severity).toBe(Severity.warning)
    expect(results[0].message).toBe('Параметры должны иметь заполненный description')
  })

  test('should not report an error when component parameters have description', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      components: {
        parameters: {
          UserId: {
            name: 'id',
            in: 'path',
            description: 'User ID',
            required: true,
            schema: {
              type: 'integer',
            },
          },
        },
      },
      paths: {
        '/users/{id}': {
          get: {
            summary: 'Get user by ID',
            parameters: [
              {
                $ref: '#/components/parameters/UserId',
              },
            ],
            responses: {
              '200': {
                description: 'User object',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should report a warning when component parameters do not have description', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      components: {
        parameters: {
          UserId: {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'integer',
            },
            // Missing description field
          },
        },
      },
      paths: {
        '/users/{id}': {
          get: {
            summary: 'Get user by ID',
            parameters: [
              {
                $ref: '#/components/parameters/UserId',
              },
            ],
            responses: {
              '200': {
                description: 'User object',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].severity).toBe(Severity.warning)
    expect(results[0].message).toBe('Параметры должны иметь заполненный description')
  })

  test('should not report an error when parameters are not present', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/users': {
          get: {
            summary: 'Get users',
            responses: {
              '200': {
                description: 'List of users',
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
