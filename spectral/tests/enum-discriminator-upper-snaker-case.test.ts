import { setupSpectral } from './utils/utils'
import { Spectral } from '@stoplight/spectral-core'
import { Severity } from './utils/severity'

let linter: Spectral

describe('Enum discriminator upper snake case rule tests', () => {
  beforeAll(async () => {
    const rulesFile = './rules/base/enum-discriminator-upper-snaker-case.yaml'
    linter = await setupSpectral(rulesFile)
  })

  test('should not report an error when enum values are in UPPER_SNAKE_CASE', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      components: {
        schemas: {
          Status: {
            type: 'string',
            enum: ['NEW_ORDER', 'CANCELLED', 'EXPIRED', 'PAID'],
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(0)
  })

  test('should report an error when enum values are not in UPPER_SNAKE_CASE', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      components: {
        schemas: {
          Status: {
            type: 'string',
            enum: ['NewOrder', 'cancelled', 'expired-order', 'PAID'],
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(3)
    expect(results[0].severity).toBe(Severity.error)
    expect(results[0].path.join('.')).toBe('components.schemas.Status.enum.0')
    expect(results[1].path.join('.')).toBe('components.schemas.Status.enum.1')
    expect(results[2].path.join('.')).toBe('components.schemas.Status.enum.2')
  })

  test('should not report an error when discriminator mapping keys are in UPPER_SNAKE_CASE', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      components: {
        schemas: {
          Payment: {
            type: 'object',
            discriminator: {
              propertyName: 'paymentType',
              mapping: {
                CREDIT_CARD: '#/components/schemas/CreditCardPayment',
                BANK_TRANSFER: '#/components/schemas/BankTransferPayment',
              },
            },
            properties: {
              paymentType: {
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

  test('should report an error when discriminator mapping keys are not in UPPER_SNAKE_CASE', async () => {
    const specFile = {
      openapi: '3.0.3',
      info: {
        title: 'Test Spec',
        version: '0.0.2',
      },
      components: {
        schemas: {
          Payment: {
            type: 'object',
            discriminator: {
              propertyName: 'paymentType',
              mapping: {
                'credit-card': '#/components/schemas/CreditCardPayment',
                BANK_TRANSFER: '#/components/schemas/BankTransferPayment',
                BankTransfer: '#/components/schemas/BankTransferPayment',
              },
            },
            properties: {
              paymentType: {
                type: 'string',
              },
            },
          },
        },
      },
    }
    const results = await linter.run(specFile)
    expect(results.length).toBe(2)
    expect(results[0].severity).toBe(Severity.error)
    expect(results[0].path.join('.')).toBe(
      'components.schemas.Payment.discriminator.mapping.credit-card',
    )
    expect(results[1].path.join('.')).toBe(
      'components.schemas.Payment.discriminator.mapping.BankTransfer',
    )
  })
})
