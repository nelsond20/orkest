import { z } from 'zod'
import type { ActionConfig } from './action.types'

export const actionConfigSchema = z.object({
  actionType: z.enum(['notify', 'updateStatus', 'assignQueue', 'addTag']),
  params: z.record(z.unknown()),
  shouldFail: z.boolean().optional()
})

export const defaultActionConfig: ActionConfig = {
  actionType: 'notify',
  params: {
    channel: 'email'
  },
  shouldFail: false
}
