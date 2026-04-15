import { z } from 'zod'
import type { DelayConfig } from './delay.types'

export const delayConfigSchema = z.object({
  duration: z.number().int().positive(),
  unit: z.enum(['seconds', 'minutes'])
})

export const defaultDelayConfig: DelayConfig = {
  duration: 30,
  unit: 'seconds'
}
