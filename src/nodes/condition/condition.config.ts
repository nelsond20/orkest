import { z } from 'zod'
import type { ConditionConfig } from './condition.types'

export const conditionConfigSchema = z.object({
  field: z.string().min(1),
  operator: z.enum(['>', '<', '==', 'in']),
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])
})

export const defaultConditionConfig: ConditionConfig = {
  field: 'amount',
  operator: '>',
  value: 1000
}
