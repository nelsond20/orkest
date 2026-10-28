import type { NodeType, WorkflowDef } from '../workflow.types'

export interface StepTransition {
  targetNodeId: string
  sourceHandle?: string
}

export interface RetryAttachment {
  retryNodeId: string
  maxAttempts: number
  delaySeconds: number
  onSuccessNodeId?: string
  onExhaustedNodeId?: string
}

export interface ExecutionStep {
  nodeId: string
  nodeType: NodeType
  config: unknown
  transitions: StepTransition[]
  order: number
  retryAttachment?: RetryAttachment
}

export interface ExecutionPlan {
  workflowId: string
  workflowVersion: number
  startNodeId: string
  steps: ExecutionStep[]
}

export interface PlannerOptions {
  throwOnValidationError?: boolean
}

export interface PlannerInput {
  workflow: WorkflowDef
  options?: PlannerOptions
}
