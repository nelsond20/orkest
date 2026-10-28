import { z } from 'zod'
import type { WorkflowDef } from '../../engine/workflow.types'
import type { ExecutionRun } from '../../features/history/history.types'

export const workflowNodeSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['trigger', 'condition', 'action', 'delay', 'branch', 'retry', 'end']),
  position: z.object({
    x: z.number(),
    y: z.number()
  }),
  config: z.record(z.unknown())
})

export const workflowEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  sourceHandle: z.string().optional(),
  target: z.string().min(1)
})

export const workflowSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.number().int().positive(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  nodes: z.array(workflowNodeSchema),
  edges: z.array(workflowEdgeSchema)
})

export const runStepSchema = z.object({
  nodeId: z.string().min(1),
  nodeType: z.enum(['trigger', 'condition', 'action', 'delay', 'branch', 'retry', 'end']),
  status: z.enum(['queued', 'running', 'succeeded', 'failed', 'skipped', 'retried']),
  startedAt: z.string().min(1),
  endedAt: z.string().optional(),
  input: z.unknown().optional(),
  output: z.unknown().optional(),
  error: z.string().optional()
})

export const executionRunSchema = z.object({
  id: z.string().min(1),
  workflowId: z.string().min(1),
  workflowName: z.string().min(1),
  status: z.enum(['pending', 'running', 'success', 'failed', 'cancelled']),
  startedAt: z.string().min(1),
  endedAt: z.string().optional(),
  mockInput: z.record(z.unknown()),
  steps: z.array(runStepSchema)
})

export const workflowCollectionSchema = z.array(workflowSchema)
export const runCollectionSchema = z.array(executionRunSchema)

export const storageKeys = {
  workflows: 'orderflow.workflows.v1',
  runs: 'orderflow.runs.v1'
} as const

export type StoredWorkflow = z.infer<typeof workflowSchema>
export type StoredRun = z.infer<typeof executionRunSchema>

export interface PersistenceApi {
  listWorkflows(): WorkflowDef[]
  getWorkflowById(id: string): WorkflowDef | undefined
  saveWorkflow(workflow: WorkflowDef): WorkflowDef
  deleteWorkflow(id: string): void
  listRuns(): ExecutionRun[]
  saveRun(run: ExecutionRun): ExecutionRun
}
