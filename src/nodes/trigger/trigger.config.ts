import { z } from 'zod'
import type { TriggerConfig } from './trigger.types'

export const triggerConfigSchema = z.object({
  eventType: z.enum(['order.created', 'appointment.created', 'manual'])
})

export const defaultTriggerConfig: TriggerConfig = {
  eventType: 'order.created'
}
