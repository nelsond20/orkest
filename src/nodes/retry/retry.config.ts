import { z } from 'zod'
import type { RetryConfig } from './retry.types'

export const retryConfigSchema = z.object({
  maxAttempts: z.number().int().min(1).max(10),
  delaySeconds: z.number().int().min(0).max(120)
})

export const defaultRetryConfig: RetryConfig = {
  maxAttempts: 2,
  delaySeconds: 1
}
