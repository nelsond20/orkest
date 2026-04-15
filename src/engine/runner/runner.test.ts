import { describe, expect, it, vi } from 'vitest'
import type { ExecutionPlan } from '../planner/planner.types'
import { planWorkflow } from '../planner/planner'
import type { WorkflowDef } from '../workflow.types'
import { createWorkflowRunner } from './runner'
import { appointmentConfirmationTemplate } from '../../templates/appointment-confirmation'
import { highValueOrderTemplate } from '../../templates/high-value-order'

function linearWorkflow(): WorkflowDef {
  return {
    id: 'wf-runner-linear',
    name: 'Runner linear',
    version: 1,
    createdAt: '2026-04-15T00:00:00.000Z',
    updatedAt: '2026-04-15T00:00:00.000Z',
    nodes: [
      { id: 'trigger-1', type: 'trigger', position: { x: 0, y: 0 }, config: { eventType: 'manual' } },
      {
        id: 'action-1',
        type: 'action',
        position: { x: 120, y: 0 },
        config: { actionType: 'notify', params: { channel: 'email' }, shouldFail: false }
      },
      { id: 'end-1', type: 'end', position: { x: 240, y: 0 }, config: { result: 'completed' } }
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'action-1' },
      { id: 'e2', source: 'action-1', sourceHandle: 'success', target: 'end-1' }
    ]
  }
}

function delayWorkflow(): WorkflowDef {
  return {
    id: 'wf-runner-delay',
    name: 'Runner delay',
    version: 1,
    createdAt: '2026-04-15T00:00:00.000Z',
    updatedAt: '2026-04-15T00:00:00.000Z',
    nodes: [
      { id: 'trigger-1', type: 'trigger', position: { x: 0, y: 0 }, config: { eventType: 'manual' } },
      { id: 'delay-1', type: 'delay', position: { x: 120, y: 0 }, config: { duration: 2, unit: 'seconds' } },
      { id: 'end-1', type: 'end', position: { x: 240, y: 0 }, config: { result: 'completed' } }
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'delay-1' },
      { id: 'e2', source: 'delay-1', target: 'end-1' }
    ]
  }
}

function collectEvents(plan: ExecutionPlan, mockInput: Record<string, unknown>) {
  const events: string[] = []
  const runner = createWorkflowRunner({
    plan,
    mockInput,
    onEvent: (event) => {
      events.push(`${event.type}:${'nodeId' in event ? event.nodeId : ''}:${'status' in event ? event.status : ''}`)
    }
  })

  return { runner, events }
}

describe('createWorkflowRunner', () => {
  it('runs a successful linear workflow', async () => {
    const plan = planWorkflow({ workflow: linearWorkflow() })
    const { runner } = collectEvents(plan, { amount: 10 })

    const result = await runner.runAuto()
    expect(result.result).toBe('success')
  })

  it('evaluates condition true path', async () => {
    const plan = planWorkflow({ workflow: highValueOrderTemplate })
    const { runner, events } = collectEvents(plan, { amount: 2000 })

    const result = await runner.runAuto()

    expect(result.result).toBe('success')
    expect(events.some((entry) => entry.includes('step:started:action-notify-ops'))).toBe(true)
  })

  it('evaluates condition false path', async () => {
    const plan = planWorkflow({ workflow: highValueOrderTemplate })
    const { runner, events } = collectEvents(plan, { amount: 10 })

    const result = await runner.runAuto()

    expect(result.result).toBe('success')
    expect(events.some((entry) => entry.includes('step:started:action-auto-approve'))).toBe(true)
  })

  it('handles action failure followed by retry success', async () => {
    const workflow = structuredClone(appointmentConfirmationTemplate)
    workflow.nodes = workflow.nodes.map((node) => {
      if (node.id !== 'action-send-whatsapp') {
        return node
      }

      return {
        ...node,
        config: {
          ...node.config,
          shouldFail: true
        }
      }
    })

    const plan = planWorkflow({ workflow })
    const { runner, events } = collectEvents(plan, {
      retrySuccessAt: {
        'action-send-whatsapp': 1
      }
    })

    const result = await runner.runAuto()

    expect(result.result).toBe('success')
    expect(events.some((entry) => entry.includes('step:retried:action-send-whatsapp'))).toBe(true)
  })

  it('fails run when retry attempts are exhausted', async () => {
    const workflow = structuredClone(appointmentConfirmationTemplate)
    workflow.nodes = workflow.nodes.map((node) => {
      if (node.id !== 'action-send-whatsapp') {
        return node
      }

      return {
        ...node,
        config: {
          ...node.config,
          shouldFail: true
        }
      }
    })

    const plan = planWorkflow({ workflow })
    const { runner } = collectEvents(plan, {})

    const result = await runner.runAuto()

    expect(result.result).toBe('failed')
  })

  it('waits for delay nodes through injected timer', async () => {
    const waitSpy = vi.fn(async () => undefined)
    const plan = planWorkflow({ workflow: delayWorkflow() })

    const runner = createWorkflowRunner({
      plan,
      mockInput: {},
      timer: {
        wait: waitSpy
      }
    })

    await runner.runAuto()
    expect(waitSpy).toHaveBeenCalledWith(2000)
  })
})
