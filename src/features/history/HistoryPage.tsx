import { useEffect, useMemo } from 'react'
import { Panel } from '../../components/ui/Panel'
import type { RunStatus } from './history.types'
import { useHistoryStore } from './history.store'
import { RunDetail } from './RunDetail'

const runStatuses: Array<RunStatus | ''> = ['', 'success', 'failed', 'cancelled']

export function HistoryPage() {
  const { runs, selectedRunId, filters, loadRuns, setWorkflowFilter, setStatusFilter, selectRun } = useHistoryStore()

  useEffect(() => {
    loadRuns()
  }, [loadRuns])

  const selectedRun = useMemo(() => runs.find((run) => run.id === selectedRunId), [runs, selectedRunId])
  const workflowOptions = useMemo(() => {
    return Array.from(new Set(runs.map((run) => run.workflowId))).map((workflowId) => ({
      workflowId,
      workflowName: runs.find((run) => run.workflowId === workflowId)?.workflowName ?? workflowId
    }))
  }, [runs])

  return (
    <div className="grid h-full grid-cols-[420px_1fr] gap-3">
      <Panel title="Execution History">
        <div className="mb-3 grid grid-cols-2 gap-2">
          <label className="text-xs text-slate-300">
            Workflow
            <select
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-2 text-xs"
              onChange={(event) => setWorkflowFilter(event.target.value || undefined)}
              value={filters.workflowId ?? ''}
            >
              <option value="">All</option>
              {workflowOptions.map((option) => (
                <option key={option.workflowId} value={option.workflowId}>
                  {option.workflowName}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs text-slate-300">
            Status
            <select
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-2 text-xs"
              onChange={(event) => setStatusFilter((event.target.value as RunStatus) || undefined)}
              value={filters.status ?? ''}
            >
              {runStatuses.map((status) => (
                <option key={status || 'all'} value={status}>
                  {status || 'all'}
                </option>
              ))}
            </select>
          </label>
        </div>

        {runs.length === 0 ? (
          <p className="text-xs text-slate-400">No runs recorded yet.</p>
        ) : (
          <ul className="space-y-2">
            {runs.map((run) => (
              <li key={run.id}>
                <button
                  className={`w-full rounded-md border px-3 py-2 text-left text-xs ${
                    selectedRunId === run.id
                      ? 'border-blue-500 bg-blue-500/10 text-blue-200'
                      : 'border-slate-800 bg-slate-950 text-slate-300'
                  }`}
                  onClick={() => selectRun(run.id)}
                  type="button"
                >
                  <p className="font-semibold">{run.workflowName}</p>
                  <p className="mt-1 text-[11px]">{new Date(run.startedAt).toLocaleString()}</p>
                  <p className="mt-1 text-[11px] uppercase">{run.status}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <RunDetail run={selectedRun} />
    </div>
  )
}
