import type { WorkflowDef } from '../engine/workflow.types'

export const appointmentConfirmationTemplate: WorkflowDef = {
  id: 'template-appointment-confirmation',
  name: 'Appointment Confirmation Flow',
  version: 1,
  createdAt: '2026-04-15T00:00:00.000Z',
  updatedAt: '2026-04-15T00:00:00.000Z',
  nodes: [
    {
      id: 'trigger-appointment-created',
      type: 'trigger',
      position: { x: 100, y: 210 },
      config: { eventType: 'appointment.created' }
    },
    {
      id: 'action-validate-phone',
      type: 'action',
      position: { x: 350, y: 210 },
      config: { actionType: 'notify', params: { operation: 'validate_phone' }, shouldFail: false }
    },
    {
      id: 'action-send-whatsapp',
      type: 'action',
      position: { x: 620, y: 210 },
      config: { actionType: 'notify', params: { channel: 'whatsapp' }, shouldFail: false }
    },
    {
      id: 'retry-send-whatsapp',
      type: 'retry',
      position: { x: 880, y: 320 },
      config: { maxAttempts: 2, delaySeconds: 1 }
    },
    {
      id: 'action-set-confirmation-status',
      type: 'action',
      position: { x: 880, y: 130 },
      config: { actionType: 'updateStatus', params: { status: 'confirmation_sent' }, shouldFail: false }
    },
    {
      id: 'end-completed',
      type: 'end',
      position: { x: 1140, y: 130 },
      config: { result: 'completed' }
    },
    {
      id: 'end-failed',
      type: 'end',
      position: { x: 1140, y: 320 },
      config: { result: 'failed' }
    }
  ],
  edges: [
    { id: 'e1', source: 'trigger-appointment-created', target: 'action-validate-phone' },
    { id: 'e2', source: 'action-validate-phone', sourceHandle: 'success', target: 'action-send-whatsapp' },
    { id: 'e3', source: 'action-send-whatsapp', sourceHandle: 'success', target: 'action-set-confirmation-status' },
    { id: 'e4', source: 'action-set-confirmation-status', sourceHandle: 'success', target: 'end-completed' },
    { id: 'e5', source: 'action-send-whatsapp', sourceHandle: 'failed', target: 'retry-send-whatsapp' },
    { id: 'e6', source: 'retry-send-whatsapp', sourceHandle: 'success', target: 'action-set-confirmation-status' },
    { id: 'e7', source: 'retry-send-whatsapp', sourceHandle: 'exhausted', target: 'end-failed' }
  ]
}
