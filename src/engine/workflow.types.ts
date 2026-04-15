export type NodeType =
  | 'trigger'
  | 'condition'
  | 'action'
  | 'delay'
  | 'branch'
  | 'retry'
  | 'end'

export interface WorkflowNodePosition {
  x: number
  y: number
}

export interface WorkflowNode {
  id: string
  type: NodeType
  position: WorkflowNodePosition
  config: Record<string, unknown>
}

export interface WorkflowEdge {
  id: string
  source: string
  sourceHandle?: string
  target: string
}

export interface WorkflowDef {
  id: string
  name: string
  version: number
  createdAt: string
  updatedAt: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}
