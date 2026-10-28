import type { WorkflowDef } from '../engine/workflow.types'
import { appointmentConfirmationTemplate } from './appointment-confirmation'
import { highValueOrderTemplate } from './high-value-order'
import { outOfStockTemplate } from './out-of-stock'

export interface WorkflowTemplate {
  id: string
  name: string
  workflow: WorkflowDef
}

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'high-value-order',
    name: 'High Value Order Review',
    workflow: highValueOrderTemplate
  },
  {
    id: 'out-of-stock',
    name: 'Out of Stock Handling',
    workflow: outOfStockTemplate
  },
  {
    id: 'appointment-confirmation',
    name: 'Appointment Confirmation Flow',
    workflow: appointmentConfirmationTemplate
  }
]
