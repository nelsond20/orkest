import { describe, expect, it } from 'vitest'
import type { WorkflowDef, WorkflowEdge, WorkflowNode } from '../workflow.types'
import { validateWorkflow } from './validator'
import { highValueOrderTemplate } from '../../templates/high-value-order'
import { outOfStockTemplate } from '../../templates/out-of-stock'
import { appointmentConfirmationTemplate } from '../../templates/appointment-confirmation'

function cloneTemplate(template: WorkflowDef): WorkflowDef {
  return structuredClone(template)
}

function buildSimpleValidWorkflow(): WorkflowDef {
  return {
    id: 'wf-valid',
    name: 'Valid Workflow',
    version: 1,
    createdAt: '2026-04-15T00:00:00.000Z',
    updatedAt: '2026-04-15T00:00:00.000Z',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 0, y: 0 },
        config: { eventType: 'manual' }
      },
      {
        id: 'action-1',
        type: 'action',
        position: { x: 100, y: 0 },
        config: { actionType: 'notify', params: { channel: 'email' }, shouldFail: false }
      },
      {
        id: 'end-1',
        type: 'end',
        position: { x: 200, y: 0 },
        config: { result: 'completed' }
      }
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'action-1' },
      { id: 'e2', source: 'action-1', sourceHandle: 'success', target: 'end-1' }
    ]
  }
}

function addNode(workflow: WorkflowDef, node: WorkflowNode) {
  workflow.nodes.push(node)
}

function addEdge(workflow: WorkflowDef, edge: WorkflowEdge) {
  workflow.edges.push(edge)
}

describe('validateWorkflow', () => {
  it('accepts a valid workflow', () => {
    const result = validateWorkflow(buildSimpleValidWorkflow())
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejects duplicate node ids', () => {
    const workflow = buildSimpleValidWorkflow()
    addNode(workflow, {
      id: 'action-1',
      type: 'delay',
      position: { x: 320, y: 0 },
      config: { duration: 1, unit: 'seconds' }
    })

    const result = validateWorkflow(workflow)
    expect(result.errors.some((issue) => issue.message.includes('Duplicate node id'))).toBe(true)
  })

  it('rejects workflow without trigger', () => {
    const workflow = buildSimpleValidWorkflow()
    workflow.nodes = workflow.nodes.filter((node) => node.type !== 'trigger')

    const result = validateWorkflow(workflow)
    expect(result.errors.some((issue) => issue.message.includes('exactly one trigger'))).toBe(true)
  })

  it('rejects workflow with multiple triggers', () => {
    const workflow = buildSimpleValidWorkflow()
    addNode(workflow, {
      id: 'trigger-2',
      type: 'trigger',
      position: { x: -100, y: 0 },
      config: { eventType: 'order.created' }
    })

    const result = validateWorkflow(workflow)
    expect(result.errors.some((issue) => issue.message.includes('more than one trigger'))).toBe(true)
  })

  it('rejects cycles', () => {
    const workflow = buildSimpleValidWorkflow()
    addEdge(workflow, { id: 'e3', source: 'end-1', target: 'trigger-1' })

    const result = validateWorkflow(workflow)
    expect(result.errors.some((issue) => issue.message.includes('cannot contain cycles'))).toBe(true)
  })

  it('rejects unreachable nodes', () => {
    const workflow = buildSimpleValidWorkflow()
    addNode(workflow, {
      id: 'action-unreachable',
      type: 'action',
      position: { x: 400, y: 300 },
      config: { actionType: 'notify', params: { channel: 'sms' }, shouldFail: false }
    })

    const result = validateWorkflow(workflow)
    expect(result.errors.some((issue) => issue.nodeId === 'action-unreachable' && issue.message.includes('unreachable'))).toBe(true)
  })

  it('rejects invalid retry placement', () => {
    const workflow = buildSimpleValidWorkflow()
    addNode(workflow, {
      id: 'retry-1',
      type: 'retry',
      position: { x: 140, y: 100 },
      config: { maxAttempts: 2, delaySeconds: 1 }
    })
    addEdge(workflow, { id: 'e3', source: 'trigger-1', target: 'retry-1' })

    const result = validateWorkflow(workflow)
    expect(result.errors.some((issue) => issue.nodeId === 'retry-1' && issue.message.includes('connected from an action'))).toBe(true)
  })

  it('rejects invalid node config', () => {
    const workflow = buildSimpleValidWorkflow()
    workflow.nodes = workflow.nodes.map((node) => {
      if (node.id !== 'action-1') {
        return node
      }

      return {
        ...node,
        config: {
          actionType: 'invalid-action-type',
          params: {}
        }
      }
    })

    const result = validateWorkflow(workflow)
    expect(result.errors.some((issue) => issue.nodeId === 'action-1' && issue.message.includes('Invalid action config'))).toBe(true)
  })

  it('accepts all demo templates', () => {
    const templates = [
      cloneTemplate(highValueOrderTemplate),
      cloneTemplate(outOfStockTemplate),
      cloneTemplate(appointmentConfirmationTemplate)
    ]

    for (const template of templates) {
      const result = validateWorkflow(template)
      expect(result.errors, template.name).toHaveLength(0)
    }
  })

  it('requires condition to expose true and false outputs', () => {
    const workflow = buildSimpleValidWorkflow()
    workflow.nodes = [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 0, y: 0 },
        config: { eventType: 'manual' }
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 100, y: 0 },
        config: { field: 'amount', operator: '>', value: 10 }
      },
      {
        id: 'end-1',
        type: 'end',
        position: { x: 240, y: -60 },
        config: { result: 'completed' }
      },
      {
        id: 'end-2',
        type: 'end',
        position: { x: 240, y: 60 },
        config: { result: 'failed' }
      }
    ]
    workflow.edges = [
      { id: 'e1', source: 'trigger-1', target: 'condition-1' },
      { id: 'e2', source: 'condition-1', sourceHandle: 'true', target: 'end-1' },
      { id: 'e3', source: 'condition-1', sourceHandle: 'true', target: 'end-2' }
    ]

    const result = validateWorkflow(workflow)
    expect(result.errors.some((issue) => issue.nodeId === 'condition-1' && issue.message.includes('true and false'))).toBe(true)
  })

  it('requires branch to expose branch-a and branch-b outputs', () => {
    const workflow = buildSimpleValidWorkflow()
    workflow.nodes = [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 0, y: 0 },
        config: { eventType: 'manual' }
      },
      {
        id: 'branch-1',
        type: 'branch',
        position: { x: 100, y: 0 },
        config: {
          options: [
            { handleId: 'branch-a', label: 'A' },
            { handleId: 'branch-b', label: 'B' }
          ]
        }
      },
      {
        id: 'end-1',
        type: 'end',
        position: { x: 240, y: -60 },
        config: { result: 'completed' }
      },
      {
        id: 'end-2',
        type: 'end',
        position: { x: 240, y: 60 },
        config: { result: 'failed' }
      }
    ]
    workflow.edges = [
      { id: 'e1', source: 'trigger-1', target: 'branch-1' },
      { id: 'e2', source: 'branch-1', sourceHandle: 'branch-a', target: 'end-1' },
      { id: 'e3', source: 'branch-1', sourceHandle: 'invalid', target: 'end-2' }
    ]

    const result = validateWorkflow(workflow)
    expect(result.errors.some((issue) => issue.nodeId === 'branch-1' && issue.message.includes('branch-a and branch-b'))).toBe(true)
  })
})
