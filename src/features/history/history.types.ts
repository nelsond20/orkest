import type { NodeType } from '../../engine/workflow.types'

export type RunStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled'

export type StepStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'skipped' | 'retried'

export interface StepLog {
  nodeId: string
  nodeType: NodeType
  status: StepStatus
  startedAt: string
  endedAt?: string
  input?: unknown
  output?: unknown
  error?: string
}

export interface ExecutionRun {
  id: string
  workflowId: string
  workflowName: string
  status: RunStatus
  startedAt: string
  endedAt?: string
  mockInput: Record<string, unknown>
  steps: StepLog[]
}
