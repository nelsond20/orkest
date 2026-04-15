import type { WorkflowDef } from '../engine/workflow.types'

export const highValueOrderTemplate: WorkflowDef = {
  id: 'template-high-value-order',
  name: 'High Value Order Review',
  version: 1,
  createdAt: '2026-04-15T00:00:00.000Z',
  updatedAt: '2026-04-15T00:00:00.000Z',
  nodes: [
    {
      id: 'trigger-order-created',
      type: 'trigger',
      position: { x: 100, y: 200 },
      config: { eventType: 'order.created' }
    },
    {
      id: 'condition-high-value',
      type: 'condition',
      position: { x: 350, y: 200 },
      config: { field: 'amount', operator: '>', value: 1000 }
    },
    {
      id: 'action-notify-ops',
      type: 'action',
      position: { x: 650, y: 120 },
      config: { actionType: 'notify', params: { channel: 'ops' }, shouldFail: false }
    },
    {
      id: 'action-set-manual-review',
      type: 'action',
      position: { x: 900, y: 120 },
      config: { actionType: 'updateStatus', params: { status: 'manual_review' }, shouldFail: false }
    },
    {
      id: 'end-manual-review',
      type: 'end',
      position: { x: 1160, y: 120 },
      config: { result: 'manual_review' }
    },
    {
      id: 'action-auto-approve',
      type: 'action',
      position: { x: 650, y: 300 },
      config: { actionType: 'updateStatus', params: { status: 'approved' }, shouldFail: false }
    },
    {
      id: 'end-completed',
      type: 'end',
      position: { x: 900, y: 300 },
      config: { result: 'completed' }
    }
  ],
  edges: [
    { id: 'e1', source: 'trigger-order-created', target: 'condition-high-value' },
    { id: 'e2', source: 'condition-high-value', sourceHandle: 'true', target: 'action-notify-ops' },
    { id: 'e3', source: 'action-notify-ops', sourceHandle: 'success', target: 'action-set-manual-review' },
    { id: 'e4', source: 'action-set-manual-review', sourceHandle: 'success', target: 'end-manual-review' },
    { id: 'e5', source: 'condition-high-value', sourceHandle: 'false', target: 'action-auto-approve' },
    { id: 'e6', source: 'action-auto-approve', sourceHandle: 'success', target: 'end-completed' }
  ]
}
