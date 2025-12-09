import { readFileSync } from 'fs'
import { join } from 'path'
import * as yaml from 'js-yaml'
import { readdirSync } from 'fs'
import { retrieveDocument, setupSpectral } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'

let linter: Spectral

beforeAll(async () => {
  const rulesFile = './documentation-ruleset.yaml'
  linter = await setupSpectral(rulesFile)
})

describe('Documentation ruleset validation', () => {
  test('should contain all rules with documentation tag and not contain extra rules', () => {
    // Read the final ruleset file
    const finalRulesetPath = join(__dirname, '../../documentation-ruleset.yaml')
    const finalRulesetContent = readFileSync(finalRulesetPath, 'utf8')
    const finalRuleset = yaml.load(finalRulesetContent)

    // Read all rule files from the openapi directory
    const openapiRulesDir = join(__dirname, '../../rules/openapi')

    // Get all YAML files in the openapi directory
    const ruleFiles = readdirSync(openapiRulesDir)
      .filter((file) => file.endsWith('.yaml') || file.endsWith('.yml'))
      .map((value) => join(openapiRulesDir, value))

    const expectedRules = new Set<string>()

    // Extract rule names from each rule file that has documentation tag
    ruleFiles.forEach((ruleFilePath) => {
      const ruleFileContent = readFileSync(ruleFilePath, 'utf8')
      const ruleFile = yaml.load(ruleFileContent)

      // Check if the rule has documentation tag
      if (ruleFile['x-rulesets'] && ruleFile['x-rulesets'].includes('documentation')) {
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

  test('should report an error in documentation ruleset when info.description field is missing', async () => {
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

  test('should not report an error when spec has infinity recursion', async () => {
    const specFile = './tests/openapi/testData/baseRuleset/base-ruleset-infinite-recursion.yaml'
    const spec = retrieveDocument(specFile)
    const results = await linter.run(spec)
    // The documentation ruleset should not have the infinite recursion issue
    // that was fixed in the base ruleset test file
    expect(results.filter((r) => r.code === 'valid-schema-example').length).toBe(0)
  }, 60000)
})
