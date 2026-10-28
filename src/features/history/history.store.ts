import { create } from 'zustand'
import type { ExecutionRun, RunStatus } from './history.types'
import { persistence } from '../../lib/persistence/persistence'

interface HistoryFilters {
  workflowId?: string
  status?: RunStatus
}

interface HistoryState {
  runs: ExecutionRun[]
  filters: HistoryFilters
  selectedRunId?: string
  loadRuns: () => void
  setWorkflowFilter: (workflowId?: string) => void
  setStatusFilter: (status?: RunStatus) => void
  selectRun: (runId?: string) => void
  addRun: (run: ExecutionRun) => void
}

function applyFilters(runs: ExecutionRun[], filters: HistoryFilters): ExecutionRun[] {
  return runs.filter((run) => {
    if (filters.workflowId && run.workflowId !== filters.workflowId) {
      return false
    }

    if (filters.status && run.status !== filters.status) {
      return false
    }

    return true
  })
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  runs: [],
  filters: {},
  selectedRunId: undefined,

  loadRuns() {
    const allRuns = persistence.listRuns()
    const filteredRuns = applyFilters(allRuns, get().filters)
    set({ runs: filteredRuns })
  },

  setWorkflowFilter(workflowId) {
    const filters = {
      ...get().filters,
      workflowId
    }
    const filteredRuns = applyFilters(persistence.listRuns(), filters)
    set({ filters, runs: filteredRuns })
  },

  setStatusFilter(status) {
    const filters = {
      ...get().filters,
      status
    }
    const filteredRuns = applyFilters(persistence.listRuns(), filters)
    set({ filters, runs: filteredRuns })
  },

  selectRun(runId) {
    set({ selectedRunId: runId })
  },

  addRun(run) {
    persistence.saveRun(run)
    get().loadRuns()
  }
}))
