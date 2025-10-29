import { setupSpectral } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from '../utils/severity'

let linter: Spectral

describe('oas3-1-servers-in-webhook rule tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/openapi/base/oas3-1-servers-in-webhook.yaml'
    linter = await setupSpectral(rulesFile)
  })

  test('should not report an error when webhooks do not contain servers', async () => {
    const specFile = {
      openapi: '3.1.0',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      webhooks: {
        'user.created': {
          post: {
            summary: 'User created webhook',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/User',
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'User created',
              },
            },
          },
        },
      },
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
              },
              name: {
                type: 'string',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })
  test('should not report an error when root level servers are present (rule may not catch this)', async () => {
    const specFile = {
      openapi: '3.1.0',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      webhooks: {
        'user.created': {
          post: {
            summary: 'User created webhook',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/User',
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'User created',
              },
            },
          },
        },
      },
      servers: [
        {
          url: 'https://api.example.com',
          description: 'Production server',
        },
      ],
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
              },
              name: {
                type: 'string',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })
  test('should report an error when webhooks contain servers in operation level', async () => {
    const specFile = {
      openapi: '3.1.0',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      webhooks: {
        'user.created': {
          post: {
            summary: 'User created webhook',
            servers: [
              {
                url: 'https://api.example.com',
                description: 'Production server',
              },
            ],
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/User',
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'User created',
              },
            },
          },
        },
      },
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
              },
              name: {
                type: 'string',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].severity).toBe(Severity.error)
    expect(results[0].message).toBe('Webhooks не должны включать в себя servers')
  })
  test('should report an error when webhooks contain servers path level', async () => {
    const specFile = {
      openapi: '3.1.0',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      webhooks: {
        servers: [
          {
            url: 'https://api.example.com',
            description: 'Production server',
          },
        ],
        'user.created': {
          post: {
            summary: 'User created webhook',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/User',
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'User created',
              },
            },
          },
        },
      },
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
              },
              name: {
                type: 'string',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].severity).toBe(Severity.error)
    expect(results[0].message).toBe('Webhooks не должны включать в себя servers')
  })
})
