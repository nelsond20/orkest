import { describe, expect, it } from 'vitest'
import type { WorkflowDef } from '../workflow.types'
import { planWorkflow } from './planner'
import { highValueOrderTemplate } from '../../templates/high-value-order'
import { appointmentConfirmationTemplate } from '../../templates/appointment-confirmation'

function simpleLinearWorkflow(): WorkflowDef {
  return {
    id: 'wf-linear',
    name: 'Linear',
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
        id: 'delay-1',
        type: 'delay',
        position: { x: 100, y: 0 },
        config: { duration: 5, unit: 'seconds' }
      },
      {
        id: 'action-1',
        type: 'action',
        position: { x: 220, y: 0 },
        config: { actionType: 'notify', params: { channel: 'email' }, shouldFail: false }
      },
      {
        id: 'end-1',
        type: 'end',
        position: { x: 340, y: 0 },
        config: { result: 'completed' }
      }
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'delay-1' },
      { id: 'e2', source: 'delay-1', target: 'action-1' },
      { id: 'e3', source: 'action-1', sourceHandle: 'success', target: 'end-1' }
    ]
  }
}

describe('planWorkflow', () => {
  it('plans a linear workflow in BFS order', () => {
    const plan = planWorkflow({ workflow: simpleLinearWorkflow() })
    expect(plan.startNodeId).toBe('trigger-1')
    expect(plan.steps.map((step) => step.nodeId)).toEqual(['trigger-1', 'delay-1', 'action-1', 'end-1'])
  })

  it('includes condition transitions with true and false handles', () => {
    const plan = planWorkflow({ workflow: highValueOrderTemplate })
    const conditionStep = plan.steps.find((step) => step.nodeId === 'condition-high-value')

    expect(conditionStep?.transitions).toEqual([
      {
        sourceHandle: 'false',
        targetNodeId: 'action-auto-approve'
      },
      {
        sourceHandle: 'true',
        targetNodeId: 'action-notify-ops'
      }
    ])
  })

  it('serializes branch ordering deterministically by handle id', () => {
    const workflow: WorkflowDef = {
      id: 'wf-branch',
      name: 'Branch test',
      version: 1,
      createdAt: '2026-04-15T00:00:00.000Z',
      updatedAt: '2026-04-15T00:00:00.000Z',
      nodes: [
        { id: 'trigger-1', type: 'trigger', position: { x: 0, y: 0 }, config: { eventType: 'manual' } },
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
        { id: 'end-a', type: 'end', position: { x: 200, y: -60 }, config: { result: 'completed' } },
        { id: 'end-b', type: 'end', position: { x: 200, y: 60 }, config: { result: 'failed' } }
      ],
      edges: [
        { id: 'e1', source: 'trigger-1', target: 'branch-1' },
        { id: 'e2', source: 'branch-1', sourceHandle: 'branch-b', target: 'end-b' },
        { id: 'e3', source: 'branch-1', sourceHandle: 'branch-a', target: 'end-a' }
      ]
    }

    const plan = planWorkflow({ workflow })
    const branchStep = plan.steps.find((step) => step.nodeId === 'branch-1')

    expect(branchStep?.transitions).toEqual([
      { sourceHandle: 'branch-a', targetNodeId: 'end-a' },
      { sourceHandle: 'branch-b', targetNodeId: 'end-b' }
    ])
  })

  it('preserves retry attachment for action failure path', () => {
    const plan = planWorkflow({ workflow: appointmentConfirmationTemplate })
    const actionStep = plan.steps.find((step) => step.nodeId === 'action-send-whatsapp')

    expect(actionStep?.retryAttachment).toEqual({
      retryNodeId: 'retry-send-whatsapp',
      maxAttempts: 2,
      delaySeconds: 1,
      onSuccessNodeId: 'action-set-confirmation-status',
      onExhaustedNodeId: 'end-failed'
    })
  })

  it('throws for invalid workflow inputs', () => {
    const invalid = simpleLinearWorkflow()
    invalid.nodes = invalid.nodes.filter((node) => node.type !== 'trigger')

    expect(() => planWorkflow({ workflow: invalid })).toThrowError('Cannot plan invalid workflow')
  })
})
