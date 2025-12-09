import { readFileSync } from 'fs'
import { join } from 'path'
import * as yaml from 'js-yaml'
import { readdirSync } from 'fs'
import { setupSpectral } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'

let linter: Spectral

beforeAll(async () => {
  const rulesFile = './required-ruleset.yaml'
  linter = await setupSpectral(rulesFile)
})

describe('Final ruleset validation', () => {
  test('should contain all rules with required tag and not contain extra rules', () => {
    // Read the final ruleset file
    const finalRulesetPath = join(__dirname, '../../required-ruleset.yaml')
    const finalRulesetContent = readFileSync(finalRulesetPath, 'utf8')
    const finalRuleset = yaml.load(finalRulesetContent)

    // Read all rule files from the openapi directory
    const openapiRulesDir = join(__dirname, '../../rules/openapi')

    // Get all YAML files in the openapi directory
    const ruleFiles = readdirSync(openapiRulesDir).filter(
      (file) => file.endsWith('.yaml') || file.endsWith('.yml'),
    )

    const expectedRules = new Set<string>()

    // Extract rule names from each rule file that has required tag
    ruleFiles.forEach((file) => {
      const ruleFilePath = join(openapiRulesDir, file)
      const ruleFileContent = readFileSync(ruleFilePath, 'utf8')
      const ruleFile = yaml.load(ruleFileContent)

      // Check if the rule has required tag
      if (ruleFile['x-rulesets'] && ruleFile['x-rulesets'].includes('required')) {
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
  test('should report an error in required rulest when info.contact x-team-id field is missing', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        contact: {
          url: 'https://sometestserver.ru/198',
          name: 'Test Team',
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
    await linter.run(specFile).then((results) => {
      expect(results.length).toBe(2)
      expect(results[0].message).toBe('must have required property "paths".')
      expect(results[1].path.join('.')).toBe('info.contact')
      expect(results[1].message).toBe('Отсутствует поле info.contact.x-team-id')
    })
  })
})
