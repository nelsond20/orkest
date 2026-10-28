import { getNodeConfigDefinition } from '../../nodes/node-config-registry'
import type { WorkflowDef, WorkflowEdge, WorkflowNode } from '../workflow.types'
import type { ValidationIssue, ValidationResult, WorkflowGraphIndex } from './validator.types'

const ROOT_NODE_ID = '__workflow__'

function createGraphIndex(workflow: WorkflowDef): WorkflowGraphIndex {
  const nodesById = new Map<string, WorkflowNode>()
  const outgoingEdges = new Map<string, WorkflowEdge[]>()
  const incomingEdges = new Map<string, WorkflowEdge[]>()

  for (const node of workflow.nodes) {
    nodesById.set(node.id, node)
    outgoingEdges.set(node.id, [])
    incomingEdges.set(node.id, [])
  }

  for (const edge of workflow.edges) {
    if (!outgoingEdges.has(edge.source)) {
      outgoingEdges.set(edge.source, [])
    }

    if (!incomingEdges.has(edge.target)) {
      incomingEdges.set(edge.target, [])
    }

    outgoingEdges.get(edge.source)?.push(edge)
    incomingEdges.get(edge.target)?.push(edge)
  }

  return {
    nodesById,
    outgoingEdges,
    incomingEdges
  }
}

function appendIssue(issues: ValidationIssue[], nodeId: string, message: string, severity: 'error' | 'warning' = 'error') {
  issues.push({ nodeId, message, severity })
}

function validateDuplicateNodeIds(workflow: WorkflowDef, issues: ValidationIssue[]) {
  const seenIds = new Set<string>()

  for (const node of workflow.nodes) {
    if (seenIds.has(node.id)) {
      appendIssue(issues, node.id, `Duplicate node id \"${node.id}\" was found.`)
      continue
    }

    seenIds.add(node.id)
  }
}

function validateEdgeReferences(index: WorkflowGraphIndex, workflow: WorkflowDef, issues: ValidationIssue[]) {
  for (const edge of workflow.edges) {
    if (!index.nodesById.has(edge.source)) {
      appendIssue(issues, ROOT_NODE_ID, `Edge \"${edge.id}\" references missing source node \"${edge.source}\".`)
    }

    if (!index.nodesById.has(edge.target)) {
      appendIssue(issues, ROOT_NODE_ID, `Edge \"${edge.id}\" references missing target node \"${edge.target}\".`)
    }
  }
}

function validateTriggerCount(workflow: WorkflowDef, issues: ValidationIssue[]) {
  const triggerNodes = workflow.nodes.filter((node) => node.type === 'trigger')

  if (triggerNodes.length === 0) {
    appendIssue(issues, ROOT_NODE_ID, 'Workflow must contain exactly one trigger node.')
  }

  if (triggerNodes.length > 1) {
    appendIssue(issues, ROOT_NODE_ID, 'Workflow must not contain more than one trigger node.')
  }
}

function validateOrphanNodes(workflow: WorkflowDef, index: WorkflowGraphIndex, issues: ValidationIssue[]) {
  for (const node of workflow.nodes) {
    const incomingCount = index.incomingEdges.get(node.id)?.length ?? 0
    const outgoingCount = index.outgoingEdges.get(node.id)?.length ?? 0

    if (incomingCount === 0 && outgoingCount === 0) {
      appendIssue(issues, node.id, 'Node is orphaned and has no connections.')
    }
  }
}

function detectCycleFromNode(
  nodeId: string,
  adjacency: Map<string, string[]>,
  activePath: Set<string>,
  visited: Set<string>
): boolean {
  if (activePath.has(nodeId)) {
    return true
  }

  if (visited.has(nodeId)) {
    return false
  }

  visited.add(nodeId)
  activePath.add(nodeId)

  const nextNodes = adjacency.get(nodeId) ?? []
  for (const nextNodeId of nextNodes) {
    if (detectCycleFromNode(nextNodeId, adjacency, activePath, visited)) {
      return true
    }
  }

  activePath.delete(nodeId)
  return false
}

function validateNoCycles(workflow: WorkflowDef, index: WorkflowGraphIndex, issues: ValidationIssue[]) {
  const adjacency = new Map<string, string[]>()

  for (const node of workflow.nodes) {
    const outgoing = index.outgoingEdges.get(node.id) ?? []
    adjacency.set(
      node.id,
      outgoing
        .filter((edge) => index.nodesById.has(edge.target))
        .map((edge) => edge.target)
    )
  }

  const visited = new Set<string>()
  for (const node of workflow.nodes) {
    const hasCycle = detectCycleFromNode(node.id, adjacency, new Set<string>(), visited)
    if (hasCycle) {
      appendIssue(issues, node.id, 'Workflow cannot contain cycles.')
      return
    }
  }
}

function validateReachability(workflow: WorkflowDef, index: WorkflowGraphIndex, issues: ValidationIssue[]) {
  const triggerNode = workflow.nodes.find((node) => node.type === 'trigger')

  if (!triggerNode) {
    return
  }

  const reachable = new Set<string>([triggerNode.id])
  const queue = [triggerNode.id]

  while (queue.length > 0) {
    const currentNodeId = queue.shift()
    if (!currentNodeId) {
      continue
    }

    const outgoing = index.outgoingEdges.get(currentNodeId) ?? []

    for (const edge of outgoing) {
      if (!index.nodesById.has(edge.target) || reachable.has(edge.target)) {
        continue
      }

      reachable.add(edge.target)
      queue.push(edge.target)
    }
  }

  for (const node of workflow.nodes) {
    if (!reachable.has(node.id)) {
      appendIssue(issues, node.id, 'Node is unreachable from trigger.')
    }
  }
}

function validateConditionAndBranchOutputs(workflow: WorkflowDef, index: WorkflowGraphIndex, issues: ValidationIssue[]) {
  for (const node of workflow.nodes) {
    const outgoing = index.outgoingEdges.get(node.id) ?? []

    if (node.type === 'condition') {
      const handles = outgoing.map((edge) => edge.sourceHandle)
      const hasTrue = handles.includes('true')
      const hasFalse = handles.includes('false')

      if (!hasTrue || !hasFalse || outgoing.length !== 2) {
        appendIssue(issues, node.id, 'Condition node must route exactly two outputs: true and false.')
      }

      for (const edge of outgoing) {
        if (edge.sourceHandle !== 'true' && edge.sourceHandle !== 'false') {
          appendIssue(issues, node.id, `Condition node has invalid source handle \"${edge.sourceHandle ?? 'undefined'}\".`)
        }
      }
    }

    if (node.type === 'branch') {
      const handles = outgoing.map((edge) => edge.sourceHandle)
      const hasBranchA = handles.includes('branch-a')
      const hasBranchB = handles.includes('branch-b')

      if (!hasBranchA || !hasBranchB || outgoing.length !== 2) {
        appendIssue(issues, node.id, 'Branch node must route exactly two outputs: branch-a and branch-b.')
      }

      for (const edge of outgoing) {
        if (edge.sourceHandle !== 'branch-a' && edge.sourceHandle !== 'branch-b') {
          appendIssue(issues, node.id, `Branch node has invalid source handle \"${edge.sourceHandle ?? 'undefined'}\".`)
        }
      }
    }
  }
}

function validateActionAndRetryPlacement(workflow: WorkflowDef, index: WorkflowGraphIndex, issues: ValidationIssue[]) {
  for (const node of workflow.nodes) {
    const incoming = index.incomingEdges.get(node.id) ?? []
    const outgoing = index.outgoingEdges.get(node.id) ?? []

    if (node.type === 'action' && incoming.length === 0) {
      appendIssue(issues, node.id, 'Action node cannot be the first node in a path.')
    }

    if (node.type === 'retry') {
      const hasActionInput = incoming.some((edge) => index.nodesById.get(edge.source)?.type === 'action')
      if (!hasActionInput) {
        appendIssue(issues, node.id, 'Retry node must be connected from an action node failure path.')
      }
    }

    if (node.type === 'end' && outgoing.length > 0) {
      appendIssue(issues, node.id, 'End node cannot have outgoing edges.')
    }
  }
}

function validateNodeConfigs(workflow: WorkflowDef, issues: ValidationIssue[]) {
  for (const node of workflow.nodes) {
    const schema = getNodeConfigDefinition(node.type).configSchema
    const result = schema.safeParse(node.config)

    if (!result.success) {
      appendIssue(issues, node.id, `Invalid ${node.type} config: ${result.error.issues[0]?.message ?? 'unknown error'}`)
    }
  }
}

export function validateWorkflow(workflow: WorkflowDef): ValidationResult {
  const errors: ValidationIssue[] = []
  const warnings: ValidationIssue[] = []
  const index = createGraphIndex(workflow)

  validateDuplicateNodeIds(workflow, errors)
  validateEdgeReferences(index, workflow, errors)
  validateTriggerCount(workflow, errors)
  validateOrphanNodes(workflow, index, errors)
  validateNoCycles(workflow, index, errors)
  validateConditionAndBranchOutputs(workflow, index, errors)
  validateActionAndRetryPlacement(workflow, index, errors)
  validateReachability(workflow, index, errors)
  validateNodeConfigs(workflow, errors)

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}
