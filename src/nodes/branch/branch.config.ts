import { z } from 'zod'
import type { BranchConfig } from './branch.types'

export const branchOptionSchema = z.object({
  handleId: z.enum(['branch-a', 'branch-b']),
  label: z.string().min(1)
})

export const branchConfigSchema = z.object({
  options: z.tuple([branchOptionSchema, branchOptionSchema])
})

export const defaultBranchConfig: BranchConfig = {
  options: [
    { handleId: 'branch-a', label: 'Primary path' },
    { handleId: 'branch-b', label: 'Alternative path' }
  ]
}
