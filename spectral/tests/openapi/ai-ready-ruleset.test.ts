import { readFileSync } from 'fs'
import { join } from 'path'
import * as yaml from 'js-yaml'
import { readdirSync } from 'fs'
import { setupSpectral } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'

let linter: Spectral

beforeAll(async () => {
  const rulesFile = './ai-ready-ruleset.yaml'
  linter = await setupSpectral(rulesFile)
})

describe('AI Ready ruleset validation', () => {
  test('should contain all rules with ai-ready tag and not contain extra rules', () => {
    // Read the final ruleset file
    const finalRulesetPath = join(__dirname, '../../ai-ready-ruleset.yaml')
    const finalRulesetContent = readFileSync(finalRulesetPath, 'utf8')
    const finalRuleset = yaml.load(finalRulesetContent)

    // Read all rule files from the openapi directory
    const openapiRulesDir = join(__dirname, '../../rules/openapi')

    // Get all YAML files in the openapi directory
    const ruleFiles = readdirSync(openapiRulesDir)
      .filter((file) => file.endsWith('.yaml') || file.endsWith('.yml'))
      .map((value) => join(openapiRulesDir, value))

    const expectedRules = new Set<string>()

    // Extract rule names from each rule file that has ai-ready tag
    ruleFiles.forEach((ruleFilePath) => {
      const ruleFileContent = readFileSync(ruleFilePath, 'utf8')
      const ruleFile = yaml.load(ruleFileContent)

      // Check if the rule has ai-ready tag
      if (ruleFile['x-rulesets'] && ruleFile['x-rulesets'].includes('ai-ready')) {
        if (ruleFile.rules) {
          Object.keys(ruleFile.rules).forEach((ruleName) => {
            expectedRules.add(ruleName)
          })
        }
      }
    })

    // Check that all expected rules are present in the final ruleset
    const finalRules = new Set<string>()
    if (finalRuleset.rules) {
      Object.keys(finalRuleset.rules).forEach((ruleName) => {
        finalRules.add(ruleName)
      })
    }

    // Verify that all expected rules are present in the final ruleset
    const missingRules = new Set<string>()
    expectedRules.forEach((ruleName) => {
      if (!finalRules.has(ruleName)) {
        missingRules.add(ruleName)
      }
    })

    // Verify that final ruleset doesn't contain extra rules
    const extraRules = new Set<string>()
    finalRules.forEach((ruleName) => {
      if (!expectedRules.has(ruleName)) {
        extraRules.add(ruleName)
      }
    })

    expect(missingRules.size).toBe(0)
    expect(extraRules.size).toBe(0)

    if (missingRules.size > 0) {
      throw new Error(`Missing rules in final ruleset: ${Array.from(missingRules).join(', ')}`)
    }

    if (extraRules.size > 0) {
      throw new Error(`Extra rules found in final ruleset: ${Array.from(extraRules).join(', ')}`)
    }
  })

  test('should report an error in ai-ready ruleset when info.description field is missing', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        contact: {
          'x-team-id': '198',
          url: 'https://sometestserver.ru/198',
          name: 'Test Team',
        },
        title: 'Test Spec',
        version: '0.0.2',
      },
      tags: [
        {
          name: 'test',
          description: 'Test tag',
        },
      ],
      servers: [
        {
          description: 'test',
          url: 'https://test.sometestserver.ru',
        },
        {
          description: 'prod',
          url: 'https://prod.sometestserver.ru',
        },
      ],
      paths: {
        '/v1/test': {
          get: {
            tags: ['test'],
            summary: 'Test operation',
            operationId: 'getTest',
            description: 'Test description',
            security: [
              {
                api_key: [],
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
      components: {
        securitySchemes: {
          api_key: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key',
          },
        },
      },
    }
    await linter.run(specFile).then((results) => {
      expect(results.length).toBe(1)
      expect(results[0].path.join('.')).toBe('info')
      expect(results[0].message).toBe('Блок info должен содержать раздел description')
    })
  })

  test('should report an error when operation summary is missing', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        description: 'Test API',
        title: 'Test Spec',
        version: '0.0.2',
      },
      tags: [
        {
          name: 'test',
          description: 'Test tag',
        },
      ],
      paths: {
        '/v1/test': {
          get: {
            tags: ['test'],
            operationId: 'getTest',
            description: 'Test description',
            responses: {
              '200': {
                description: 'OK',
              },
            },
          },
        },
      },
    }
    await linter.run(specFile).then((results) => {
      // Filter to only the rules we're testing
      const summaryErrors = results.filter((r) => r.code === 'operation-must-have-summary')
      expect(summaryErrors.length).toBe(1)
      expect(summaryErrors[0].code).toBe('operation-must-have-summary')
      expect(summaryErrors[0].message).toBe('Каждая операция должна содержать поле summary')
    })
  })

  test('should report an error when operation has more than one tag', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        description: 'Test API',
        title: 'Test Spec',
        version: '0.0.2',
      },
      tags: [
        {
          name: 'test',
          description: 'Test tag',
        },
        {
          name: 'another',
          description: 'Another tag',
        },
      ],
      paths: {
        '/v1/test': {
          get: {
            tags: ['test', 'another'],
            summary: 'Test operation',
            operationId: 'getTest',
            description: 'Test description',
            responses: {
              '200': {
                description: 'OK',
              },
            },
          },
        },
      },
    }
    await linter.run(specFile).then((results) => {
      // Filter to only the rules we're testing
      const tagErrors = results.filter((r) => r.code === 'operation-singular-tag')
      expect(tagErrors.length).toBe(1)
      expect(tagErrors[0].code).toBe('operation-singular-tag')
      expect(tagErrors[0].message).toBe('Метод должен иметь не более одного тега')
    })
  })

  test('should report an error when array items are missing', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        description: 'Test API',
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/v1/test': {
          get: {
            summary: 'Test operation',
            operationId: 'getTest',
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        items: {
                          type: 'array',
                          // items property is missing
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
    await linter.run(specFile).then((results) => {
      // Filter to only the rules we're testing
      const arrayItemsErrors = results.filter((r) => r.code === 'array-items')
      expect(arrayItemsErrors.length).toBe(1)
      expect(arrayItemsErrors[0].code).toBe('array-items')
      expect(arrayItemsErrors[0].message).toBe(
        'Объекты типа Array должны содержать массив элементов',
      )
    })
  })

  test('should report an error when operationId is not in camelCase', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        description: 'Test API',
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/v1/test': {
          get: {
            summary: 'Test operation',
            operationId: 'Get_Test', // Not camelCase
            responses: {
              '200': {
                description: 'OK',
              },
            },
          },
        },
      },
    }
    await linter.run(specFile).then((results) => {
      // Filter to only the rules we're testing
      const camelCaseErrors = results.filter((r) => r.code === 'method-operation-id-camel-case')
      expect(camelCaseErrors.length).toBe(1)
      expect(camelCaseErrors[0].code).toBe('method-operation-id-camel-case')
      expect(camelCaseErrors[0].message).toBe('OperationId должны быть в camelCase формате')
    })
  })

  test('should report an error when description is blank', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        description: ' ', // Blank string
        title: 'Test Spec',
        version: '0.0.2',
      },
      paths: {
        '/v1/test': {
          get: {
            summary: 'Test operation',
            operationId: 'getTest',
            description: 'Test description',
            responses: {
              '200': {
                description: 'OK',
              },
            },
          },
        },
      },
    }
    await linter.run(specFile).then((results) => {
      // Filter to only the rules we're testing
      const blankStringErrors = results.filter((r) => r.code === 'blank-strings-forbidden')
      expect(blankStringErrors.length).toBe(1)
      expect(blankStringErrors[0].code).toBe('blank-strings-forbidden')
      expect(blankStringErrors[0].message).toBe('Пустые строки запрещены')
    })
  })
})
