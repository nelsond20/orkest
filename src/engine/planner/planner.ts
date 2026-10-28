import { retryConfigSchema } from '../../nodes/retry/retry.config'
import type { WorkflowDef, WorkflowEdge, WorkflowNode } from '../workflow.types'
import { validateWorkflow } from '../validator/validator'
import type { ExecutionPlan, ExecutionStep, PlannerInput, StepTransition } from './planner.types'

function byHandleThenTarget(left: WorkflowEdge, right: WorkflowEdge): number {
  const handleOrder = (left.sourceHandle ?? '').localeCompare(right.sourceHandle ?? '')
  if (handleOrder !== 0) {
    return handleOrder
  }

  return left.target.localeCompare(right.target)
}

function createTransition(edge: WorkflowEdge): StepTransition {
  return {
    targetNodeId: edge.target,
    sourceHandle: edge.sourceHandle
  }
}

function createOutgoingMap(workflow: WorkflowDef): Map<string, WorkflowEdge[]> {
  const outgoingMap = new Map<string, WorkflowEdge[]>()

  for (const edge of workflow.edges) {
    const existing = outgoingMap.get(edge.source) ?? []
    existing.push(edge)
    outgoingMap.set(edge.source, existing)
  }

  for (const [nodeId, edges] of outgoingMap.entries()) {
    outgoingMap.set(nodeId, [...edges].sort(byHandleThenTarget))
  }

  return outgoingMap
}

function createNodeMap(workflow: WorkflowDef): Map<string, WorkflowNode> {
  return new Map(workflow.nodes.map((node) => [node.id, node]))
}

function attachRetryMetadata(
  step: ExecutionStep,
  outgoing: WorkflowEdge[],
  nodeMap: Map<string, WorkflowNode>,
  outgoingMap: Map<string, WorkflowEdge[]>
) {
  if (step.nodeType !== 'action') {
    return
  }

  const failedEdge = outgoing.find((edge) => edge.sourceHandle === 'failed')
  if (!failedEdge) {
    return
  }

  const retryNode = nodeMap.get(failedEdge.target)
  if (!retryNode || retryNode.type !== 'retry') {
    return
  }

  const parsedRetryConfig = retryConfigSchema.safeParse(retryNode.config)
  if (!parsedRetryConfig.success) {
    return
  }

  const retryOutgoing = (outgoingMap.get(retryNode.id) ?? []).filter((edge) => nodeMap.has(edge.target))
  const onSuccessNodeId = retryOutgoing.find((edge) => edge.sourceHandle === 'success')?.target
  const onExhaustedNodeId = retryOutgoing.find((edge) => edge.sourceHandle === 'exhausted')?.target

  step.retryAttachment = {
    retryNodeId: retryNode.id,
    maxAttempts: parsedRetryConfig.data.maxAttempts,
    delaySeconds: parsedRetryConfig.data.delaySeconds,
    onSuccessNodeId,
    onExhaustedNodeId
  }
}

export function planWorkflow(input: PlannerInput): ExecutionPlan {
  const { workflow, options } = input
  const validation = validateWorkflow(workflow)

  if (validation.errors.length > 0 && options?.throwOnValidationError !== false) {
    const message = validation.errors.map((error) => `${error.nodeId}: ${error.message}`).join(' | ')
    throw new Error(`Cannot plan invalid workflow. ${message}`)
  }

  const trigger = workflow.nodes.find((node) => node.type === 'trigger')

  if (!trigger) {
    throw new Error('Cannot plan workflow without trigger node.')
  }

  const nodeMap = createNodeMap(workflow)
  const outgoingMap = createOutgoingMap(workflow)

  const queue = [trigger.id]
  const visited = new Set<string>()
  const plannedSteps: ExecutionStep[] = []

  while (queue.length > 0) {
    const currentNodeId = queue.shift()

    if (!currentNodeId || visited.has(currentNodeId)) {
      continue
    }

    const currentNode = nodeMap.get(currentNodeId)
    if (!currentNode) {
      continue
    }

    visited.add(currentNodeId)

    const outgoingEdges = outgoingMap.get(currentNodeId) ?? []
    const transitions = outgoingEdges.filter((edge) => nodeMap.has(edge.target)).map(createTransition)

    const step: ExecutionStep = {
      nodeId: currentNode.id,
      nodeType: currentNode.type,
      config: currentNode.config,
      transitions,
      order: plannedSteps.length
    }

    attachRetryMetadata(step, outgoingEdges, nodeMap, outgoingMap)
    plannedSteps.push(step)

    for (const transition of transitions) {
      if (!visited.has(transition.targetNodeId)) {
        queue.push(transition.targetNodeId)
      }
    }
  }

  return {
    workflowId: workflow.id,
    workflowVersion: workflow.version,
    startNodeId: trigger.id,
    steps: plannedSteps
  }
}
