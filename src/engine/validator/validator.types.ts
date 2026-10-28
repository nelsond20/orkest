import type { WorkflowDef, WorkflowEdge, WorkflowNode } from '../workflow.types'

export interface ValidationIssue {
  nodeId: string
  message: string
  severity: 'error' | 'warning'
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
}

export interface WorkflowGraphIndex {
  nodesById: Map<string, WorkflowNode>
  outgoingEdges: Map<string, WorkflowEdge[]>
  incomingEdges: Map<string, WorkflowEdge[]>
}

export interface ValidatorContext {
  workflow: WorkflowDef
  index: WorkflowGraphIndex
}
