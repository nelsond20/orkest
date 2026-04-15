import { z } from 'zod'
import type { EndConfig } from './end.types'

export const endConfigSchema = z.object({
  result: z.enum(['completed', 'failed', 'manual_review'])
})

export const defaultEndConfig: EndConfig = {
  result: 'completed'
}
