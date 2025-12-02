import { setupSpectral, retrieveDocument } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'

let linter: Spectral

describe('oas3-examples-value-or-externalValue rule tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/openapi/base/oas3-examples-value-or-externalValue.yaml'
    linter = await setupSpectral(rulesFile)
  })

  test('should not report an error when examples have value property', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      components: {
        examples: {
          Example1: {
            summary: 'Example with value',
            value: {
              id: 1,
              name: 'Test',
            },
          },
        },
      },
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/json': {
                    examples: {
                      Example2: {
                        summary: 'Example with value',
                        value: {
                          id: 2,
                          name: 'Test2',
                        },
                      },
                    },
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

  test('should not report an error when examples have externalValue property', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      components: {
        examples: {
          Example1: {
            summary: 'Example with externalValue',
            externalValue: 'https://example.com/data.json',
          },
        },
      },
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/json': {
                    examples: {
                      Example2: {
                        summary: 'Example with externalValue',
                        externalValue: 'https://example.com/data2.json',
                      },
                    },
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

  test('should report an error when examples have neither value nor externalValue', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      components: {
        examples: {
          Example1: {
            summary: 'Example without value or externalValue',
          },
        },
      },
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/json': {
                    examples: {
                      Example2: {
                        summary: 'Example without value or externalValue',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(2)
    expect(results[0].path.join('.')).toBe('components.examples.Example1')
    expect(results[0].severity).toBe(1)
    expect(results[1].path.join('.')).toBe(
      'paths./test.get.responses.200.content.application/json.examples.Example2',
    )
    expect(results[1].message).toBe('Examples должен содержать value или externalValue')
  })

  test('should report an error when examples in components.parameters have neither value nor externalValue', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      components: {
        parameters: {
          TestParam: {
            name: 'test',
            in: 'query',
            examples: {
              Example1: {
                summary: 'Example without value or externalValue',
              },
            },
          },
        },
      },
      paths: {
        '/test': {
          get: {
            parameters: [
              {
                $ref: '#/components/parameters/TestParam',
              },
            ],
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
    expect(results[0].message).toBe('Examples должен содержать value или externalValue')
    expect(results[1].message).toBe('Examples должен содержать value или externalValue')
  })

  test('should report an error when examples in path.parameters have neither value nor externalValue', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/test': {
          get: {
            parameters: [
              {
                name: 'test',
                in: 'query',
                examples: {
                  Example1: {
                    summary: 'Example without value or externalValue',
                  },
                },
              },
            ],
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
    expect(results[0].path.join('.')).toBe('paths./test.get.parameters.0.examples.Example1')
    expect(results[0].message).toBe('Examples должен содержать value или externalValue')
  })

  test('should report an error when examples in path.headers have neither value nor externalValue', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                description: 'OK',
                headers: {
                  'X-Test-Header': {
                    examples: {
                      Example1: {
                        summary: 'Example without value or externalValue',
                      },
                    },
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
    expect(results[0].path.join('.')).toBe(
      'paths./test.get.responses.200.headers.X-Test-Header.examples.Example1',
    )
    expect(results[0].message).toBe('Examples должен содержать value или externalValue')
  })
  test('should report an error when examples in headers have neither value nor externalValue', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      components: {
        headers: {
          TestHeader: {
            examples: {
              Example1: {
                summary: 'Example without value or externalValue',
              },
            },
          },
        },
      },
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                description: 'OK',
                headers: {
                  'X-Test-Header': {
                    $ref: '#/components/headers/TestHeader',
                  },
                },
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(2)
    expect(results[0].message).toBe('Examples должен содержать value или externalValue')
    expect(results[1].message).toBe('Examples должен содержать value или externalValue')
  })
  test('should not report an error when examples have both value and externalValue (should be valid for xor)', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      components: {
        examples: {
          Example1: {
            summary: 'Example with both value and externalValue',
            value: {
              id: 1,
              name: 'Test',
            },
            externalValue: 'https://example.com/data.json',
          },
        },
      },
    }
    const results = await linter.run(specFile)
    // XOR function should report error when both properties are present
    expect(results.length).toBe(1)
    expect(results[0].message).toBe('Examples должен содержать value или externalValue')
    expect(results[0].path.join('.')).toBe('components.examples.Example1')
  })

  test('should report an error when external reference contains examples without value or externalValue', async () => {
    const specFile =
      './tests/openapi/testData/oas3ExamplesValueOrExternalValue/spec-with-external-ref-invalid-example.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(1)
    expect(results[0].message).toBe('Examples должен содержать value или externalValue')
    expect(results[0].path.join('.')).toBe('components.examples.LocalExample')
  })

  test('should not report an error when external reference contains valid examples', async () => {
    const specFile =
      './tests/openapi/testData/oas3ExamplesValueOrExternalValue/spec-with-external-ref-valid-example.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    expect(results.length).toBe(0)
  })
})
