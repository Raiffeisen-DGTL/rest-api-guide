import { setupSpectral } from './utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from './utils/severity'

let linter: Spectral

describe('provide-head-method rule tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/base/provide-head-method.yaml'
    linter = await setupSpectral(rulesFile)
  })

  test('should not report an error when HEAD is present for GET returning file', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/download': {
          get: {
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/octet-stream': {},
                },
              },
            },
          },
          head: {
            responses: {
              '200': {
                description: 'OK',
                headers: {
                  'Content-Length': {
                    schema: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
    }

    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should report an error when HEAD is missing for GET returning file', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/download': {
          get: {
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/pdf': {},
                },
              },
            },
          },
        },
      },
    }

    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].message).toBe(
      'API для скачивания какого-либо файла должно поддерживать метод **HEAD**',
    )
    expect(results[0].path.join('.')).toBe('paths./download')
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should not report an error when GET does not return file', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/users': {
          get: {
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/json': {
                    schema: { type: 'object' },
                  },
                },
              },
            },
          },
        },
      },
    }

    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  // Additional test cases

  test('should report error for all file MIME types when HEAD is missing', async () => {
    const fileMimeTypes = [
      'application/octet-stream',
      'application/xml',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/zip',
      'application/gzip',
      'application/vnd.oasis.opendocument.text',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]

    for (const mimeType of fileMimeTypes) {
      const specFile = {
        openapi: '3.0.3',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/download': {
            get: {
              responses: {
                '200': {
                  description: 'OK',
                  content: {
                    [mimeType]: {},
                  },
                },
              },
            },
          },
        },
      }

      const results = await linter.run(specFile)
      expect(results.length).toBe(1)
      expect(results[0].message).toBe(
        'API для скачивания какого-либо файла должно поддерживать метод **HEAD**',
      )
      expect(results[0].path.join('.')).toBe('paths./download')
      expect(results[0].severity).toBe(Severity.error)
    }
  })

  test('should report error when GET returns file with 2xx status code other than 200', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/download': {
          get: {
            responses: {
              '201': {
                description: 'Created',
                content: {
                  'application/pdf': {},
                },
              },
            },
          },
        },
      },
    }

    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].message).toBe(
      'API для скачивания какого-либо файла должно поддерживать метод **HEAD**',
    )
    expect(results[0].path.join('.')).toBe('paths./download')
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should not report error when GET returns file with non-2xx status code', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/download': {
          get: {
            responses: {
              '404': {
                description: 'Not Found',
                content: {
                  'application/pdf': {},
                },
              },
            },
          },
        },
      },
    }

    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should not report error when GET has no responses', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/download': {
          get: {},
        },
      },
    }

    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should not report error when GET has no content', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/download': {
          get: {
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

  test('should not report error when path has no GET method', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/download': {
          post: {
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/pdf': {},
                },
              },
            },
          },
        },
      },
    }

    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should not report error when path item is null or undefined', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/download': null,
      },
    }

    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should not report error when path item is not an object', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/download': 'invalid',
      },
    }

    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should not report error when HEAD is present for GET returning file with multiple content types', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/download': {
          get: {
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/json': {
                    schema: { type: 'object' },
                  },
                  'application/pdf': {},
                },
              },
            },
          },
          head: {
            responses: {
              '200': {
                description: 'OK',
                headers: {
                  'Content-Length': {
                    schema: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
    }

    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should report error when HEAD is missing for GET returning file with multiple content types', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/download': {
          get: {
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/json': {
                    schema: { type: 'object' },
                  },
                  'application/pdf': {},
                },
              },
            },
          },
        },
      },
    }

    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].message).toBe(
      'API для скачивания какого-либо файла должно поддерживать метод **HEAD**',
    )
    expect(results[0].path.join('.')).toBe('paths./download')
    expect(results[0].severity).toBe(Severity.error)
  })

  test('should handle multiple paths correctly', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/download1': {
          get: {
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/pdf': {},
                },
              },
            },
          },
          head: {
            responses: {
              '200': {
                description: 'OK',
              },
            },
          },
        },
        '/download2': {
          get: {
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/zip': {},
                },
              },
            },
          },
        },
        '/users': {
          get: {
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/json': {
                    schema: { type: 'object' },
                  },
                },
              },
            },
          },
        },
      },
    }

    const results = await linter.run(specFile)
    expect(results.length).toBe(1)
    expect(results[0].message).toBe(
      'API для скачивания какого-либо файла должно поддерживать метод **HEAD**',
    )
    expect(results[0].path.join('.')).toBe('paths./download2')
    expect(results[0].severity).toBe(Severity.error)
  })
})
