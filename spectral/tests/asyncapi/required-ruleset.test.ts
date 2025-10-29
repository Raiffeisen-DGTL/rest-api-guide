import { readFileSync } from 'fs'
import { join } from 'path'
import * as yaml from 'js-yaml'
import { readdirSync } from 'fs'
import { setupSpectral } from '../utils/utils'
import { Spectral } from '@stoplight/spectral-core'

let linter: Spectral

beforeAll(async () => {
  const rulesFile = './asyncapi-required-ruleset.yaml'
  linter = await setupSpectral(rulesFile)
})

describe('Final ruleset validation', () => {
  test('should contain all rules from required directory and not contain extra rules', () => {
    // Read the final ruleset file
    const finalRulesetPath = join(__dirname, '../../asyncapi-required-ruleset.yaml')
    const finalRulesetContent = readFileSync(finalRulesetPath, 'utf8')
    const finalRuleset = yaml.load(finalRulesetContent)

    // Read all rule files from the required directory
    const requiredRulesDir = join(__dirname, '../../rules/asyncapi/required/')

    // Get all YAML files in the required directory
    const ruleFiles = readdirSync(requiredRulesDir)
      .filter((file) => file.endsWith('.yaml') || file.endsWith('.yml'))
      .map((value) => join(requiredRulesDir, value))

    const expectedRules = new Set<string>()

    // Extract rule names from each rule file
    ruleFiles.forEach((ruleFilePath) => {
      const ruleFileContent = readFileSync(ruleFilePath, 'utf8')
      const ruleFile = yaml.load(ruleFileContent)

      if (ruleFile.rules) {
        Object.keys(ruleFile.rules).forEach((ruleName) => {
          expectedRules.add(ruleName)
        })
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

  test('should report errors for missing required fields in info.contact', async () => {
    const specFile = {
      asyncapi: '2.0.0',
      info: {
        title: 'Test Spec',
        version: '0.0.1',
        contact: {
          name: 'Test Team',
          url: 'https://sometestserver.ru/198',
        },
      },
      channels: {},
    }

    const results = await linter.run(specFile)

    // Should have 2 errors for missing x-short-team-name and x-team-id
    expect(results.length).toBeGreaterThanOrEqual(2)

    const errorMessages = results.map((result) => result.message)
    expect(errorMessages).toContain('Отсутствует поле info.contact.x-short-team-name')
    expect(errorMessages).toContain('Отсутствует поле info.contact.x-team-id')
  })

  test('should not report errors when all required fields are present', async () => {
    const specFile = {
      asyncapi: '2.0.0',
      info: {
        title: 'Test Spec',
        version: '0.0.1',
        contact: {
          name: 'Test Team',
          url: 'https://sometestserver.ru/198',
          'x-short-team-name': 'test-team',
          'x-team-id': '12345',
        },
      },
      channels: {},
    }

    const results = await linter.run(specFile)

    // Filter out any non-error results if needed
    const errorResults = results.filter((result) => result.severity === 0) // 0 is error in Spectral

    // Should have no errors for missing required fields
    expect(errorResults.length).toBe(0)
  })
})
