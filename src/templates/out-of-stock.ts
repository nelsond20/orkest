import type { WorkflowDef } from '../engine/workflow.types'

export const outOfStockTemplate: WorkflowDef = {
  id: 'template-out-of-stock',
  name: 'Out of Stock Handling',
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
      id: 'condition-stock-available',
      type: 'condition',
      position: { x: 350, y: 200 },
      config: { field: 'stockAvailable', operator: '==', value: true }
    },
    {
      id: 'action-notify-customer',
      type: 'action',
      position: { x: 650, y: 300 },
      config: { actionType: 'notify', params: { audience: 'customer' }, shouldFail: false }
    },
    {
      id: 'action-set-pending-stock',
      type: 'action',
      position: { x: 900, y: 300 },
      config: { actionType: 'updateStatus', params: { status: 'pending_stock' }, shouldFail: false }
    },
    {
      id: 'end-failed',
      type: 'end',
      position: { x: 1160, y: 300 },
      config: { result: 'failed' }
    },
    {
      id: 'action-continue-processing',
      type: 'action',
      position: { x: 650, y: 120 },
      config: { actionType: 'assignQueue', params: { queue: 'fulfillment' }, shouldFail: false }
    },
    {
      id: 'end-completed',
      type: 'end',
      position: { x: 900, y: 120 },
      config: { result: 'completed' }
    }
  ],
  edges: [
    { id: 'e1', source: 'trigger-order-created', target: 'condition-stock-available' },
    { id: 'e2', source: 'condition-stock-available', sourceHandle: 'false', target: 'action-notify-customer' },
    { id: 'e3', source: 'action-notify-customer', sourceHandle: 'success', target: 'action-set-pending-stock' },
    { id: 'e4', source: 'action-set-pending-stock', sourceHandle: 'success', target: 'end-failed' },
    { id: 'e5', source: 'condition-stock-available', sourceHandle: 'true', target: 'action-continue-processing' },
    { id: 'e6', source: 'action-continue-processing', sourceHandle: 'success', target: 'end-completed' }
  ]
}
