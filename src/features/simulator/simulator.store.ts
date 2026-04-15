import { create } from 'zustand'
import { createWorkflowRunner } from '../../engine/runner/runner'
import type { WorkflowEvent, WorkflowRunner } from '../../engine/runner/runner.types'
import type { WorkflowDef, NodeType } from '../../engine/workflow.types'
import { planWorkflow } from '../../engine/planner/planner'
import type { ExecutionRun, StepLog } from '../history/history.types'
import { persistence } from '../../lib/persistence/persistence'

type SimulatorMode = 'step' | 'auto'

interface SimulatorState {
  workflow?: WorkflowDef
  nodeTypes: Record<string, NodeType>
  run?: ExecutionRun
  activeNodeId?: string
  mode: SimulatorMode
  mockInput: Record<string, unknown>
  start: (workflow: WorkflowDef, mode: SimulatorMode) => Promise<void>
  step: () => Promise<void>
  setMockInput: (value: Record<string, unknown>) => void
  reset: () => void
}

interface RunnerSession {
  runner: WorkflowRunner
  mode: SimulatorMode
}

let currentSession: RunnerSession | undefined

function nowIso(): string {
  return new Date().toISOString()
}

function createRun(workflow: WorkflowDef, mockInput: Record<string, unknown>): ExecutionRun {
  return {
    id: `run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    workflowId: workflow.id,
    workflowName: workflow.name,
    status: 'pending',
    startedAt: nowIso(),
    mockInput,
    steps: []
  }
}

function upsertStep(steps: StepLog[], update: StepLog): StepLog[] {
  const index = steps.findIndex((step) => step.nodeId === update.nodeId && !step.endedAt)

  if (index === -1) {
    return [...steps, update]
  }

  const next = [...steps]
  next[index] = {
    ...next[index],
    ...update
  }

  return next
}

function eventToRunUpdate(
  event: WorkflowEvent,
  run: ExecutionRun,
  nodeTypes: Record<string, NodeType>
): Pick<SimulatorState, 'run' | 'activeNodeId'> {
  if (event.type === 'run:started') {
    return {
      run: {
        ...run,
        status: 'running'
      },
      activeNodeId: undefined
    }
  }

  if (event.type === 'step:started') {
    return {
      run: {
        ...run,
        steps: upsertStep(run.steps, {
          nodeId: event.nodeId,
          nodeType: nodeTypes[event.nodeId] ?? 'action',
          status: 'running',
          startedAt: nowIso()
        })
      },
      activeNodeId: event.nodeId
    }
  }

  if (event.type === 'step:succeeded') {
    return {
      run: {
        ...run,
        steps: upsertStep(run.steps, {
          nodeId: event.nodeId,
          nodeType: nodeTypes[event.nodeId] ?? 'action',
          status: 'succeeded',
          startedAt: nowIso(),
          endedAt: nowIso(),
          output: event.output
        })
      },
      activeNodeId: event.nodeId
    }
  }

  if (event.type === 'step:failed') {
    return {
      run: {
        ...run,
        steps: upsertStep(run.steps, {
          nodeId: event.nodeId,
          nodeType: nodeTypes[event.nodeId] ?? 'action',
          status: 'failed',
          startedAt: nowIso(),
          endedAt: nowIso(),
          error: event.error
        })
      },
      activeNodeId: event.nodeId
    }
  }

  if (event.type === 'step:skipped') {
    return {
      run: {
        ...run,
        steps: upsertStep(run.steps, {
          nodeId: event.nodeId,
          nodeType: nodeTypes[event.nodeId] ?? 'action',
          status: 'skipped',
          startedAt: nowIso(),
          endedAt: nowIso()
        })
      },
      activeNodeId: run.steps.at(-1)?.nodeId
    }
  }

  if (event.type === 'step:retried') {
    return {
      run: {
        ...run,
        steps: [
          ...run.steps,
          {
            nodeId: event.nodeId,
            nodeType: nodeTypes[event.nodeId] ?? 'action',
            status: 'retried',
            startedAt: nowIso(),
            endedAt: nowIso(),
            output: {
              attempt: event.attempt
            }
          }
        ]
      },
      activeNodeId: event.nodeId
    }
  }

  if (event.type === 'run:completed') {
    return {
      run: {
        ...run,
        status: event.status,
        endedAt: nowIso()
      },
      activeNodeId: undefined
    }
  }

  return {
    run,
    activeNodeId: undefined
  }
}

export const useSimulatorStore = create<SimulatorState>((set, get) => ({
  workflow: undefined,
  nodeTypes: {},
  run: undefined,
  activeNodeId: undefined,
  mode: 'step',
  mockInput: {},

  async start(workflow, mode) {
    const plan = planWorkflow({ workflow })
    const nodeTypes = Object.fromEntries(workflow.nodes.map((node) => [node.id, node.type])) as Record<string, NodeType>
    const run = createRun(workflow, get().mockInput)

    const runner = createWorkflowRunner({
      plan,
      mockInput: get().mockInput,
      onEvent: (event) => {
        set((state) => {
          const currentRun = state.run ?? run
          const nextState = eventToRunUpdate(event, currentRun, nodeTypes)

          if (event.type === 'run:completed' && nextState.run) {
            persistence.saveRun(nextState.run)
          }

          return nextState
        })
      }
    })

    currentSession = { runner, mode }
    set({ workflow, nodeTypes, run, mode, activeNodeId: undefined })

    if (mode === 'auto') {
      await runner.runAuto()
      return
    }

    await runner.step()
  },

  async step() {
    if (!currentSession) {
      return
    }

    await currentSession.runner.step()
  },

  setMockInput(value) {
    set({ mockInput: value })
  },

  reset() {
    currentSession = undefined
    set({ run: undefined, activeNodeId: undefined, workflow: undefined, nodeTypes: {}, mode: 'step' })
  }
}))
