import { beforeEach, describe, expect, it } from 'vitest'
import type { WorkflowDef } from '../../engine/workflow.types'
import { persistence } from './persistence'

function buildWorkflow(id: string, name: string): WorkflowDef {
  return {
    id,
    name,
    version: 1,
    createdAt: '2026-04-15T00:00:00.000Z',
    updatedAt: '2026-04-15T00:00:00.000Z',
    nodes: [
      {
        id: `trigger-${id}`,
        type: 'trigger',
        position: { x: 0, y: 0 },
        config: { eventType: 'manual' }
      }
    ],
    edges: []
  }
}

describe('persistence.saveWorkflow', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('enforces unique workflow names by appending numeric suffixes', () => {
    const first = persistence.saveWorkflow(buildWorkflow('wf-1', 'Imported Workflow'))
    const second = persistence.saveWorkflow(buildWorkflow('wf-2', 'Imported Workflow'))
    const third = persistence.saveWorkflow(buildWorkflow('wf-3', 'Imported Workflow'))

    expect(first.name).toBe('Imported Workflow')
    expect(second.name).toBe('Imported Workflow (1)')
    expect(third.name).toBe('Imported Workflow (2)')
  })

  it('keeps the same name when updating the same workflow id', () => {
    persistence.saveWorkflow(buildWorkflow('wf-1', 'My Workflow'))
    const updated = persistence.saveWorkflow(buildWorkflow('wf-1', 'My Workflow'))

    expect(updated.name).toBe('My Workflow')
  })
})
