import { useEffect, useMemo } from 'react'
import { Panel } from '../../components/ui/Panel'
import { Select } from '../../components/ui/Select'
import type { RunStatus } from './history.types'
import { useHistoryStore } from './history.store'
import { RunDetail } from './RunDetail'

const runStatuses: Array<RunStatus | ''> = ['', 'success', 'failed', 'cancelled']

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    success: 'bg-[var(--success-bg)] text-[var(--success)]',
    failed: 'bg-[var(--destructive-bg)] text-[var(--destructive)]',
    cancelled: 'bg-[var(--warning-bg)] text-[var(--warning)]',
    running: 'bg-[var(--accent-bg)] text-[var(--accent)]',
  }
  return (
    <span
      className={`rounded px-2 py-0.5 text-xs font-medium uppercase tracking-wide ${styles[status] ?? 'bg-[var(--surface-2)] text-[var(--text-3)]'}`}
    >
      {status || 'unknown'}
    </span>
  )
}

export function HistoryPage() {
  const { runs, selectedRunId, filters, loadRuns, setWorkflowFilter, setStatusFilter, selectRun } =
    useHistoryStore()

  useEffect(() => {
    loadRuns()
  }, [loadRuns])

  const selectedRun = useMemo(
    () => runs.find((run) => run.id === selectedRunId),
    [runs, selectedRunId]
  )

  const workflowOptions = useMemo(() => {
    return Array.from(new Set(runs.map((run) => run.workflowId))).map((workflowId) => ({
      workflowId,
      workflowName: runs.find((run) => run.workflowId === workflowId)?.workflowName ?? workflowId,
    }))
  }, [runs])

  const workflowFilterOptions = useMemo(
    () => [
      { value: '', label: 'All Workflows' },
      ...workflowOptions.map((o) => ({ value: o.workflowId, label: o.workflowName })),
    ],
    [workflowOptions]
  )

  const statusFilterOptions = useMemo(
    () =>
      runStatuses.map((s) => ({
        value: s,
        label: s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Statuses',
      })),
    []
  )

  return (
    <div className="grid h-full grid-cols-[380px_1fr] gap-4">
      <Panel title="Execution History">
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--text-3)]">
              Workflow
            </p>
            <Select
              onChange={(v) => setWorkflowFilter(v || undefined)}
              options={workflowFilterOptions}
              value={filters.workflowId ?? ''}
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--text-3)]">
              Status
            </p>
            <Select
              onChange={(v) => setStatusFilter((v as RunStatus) || undefined)}
              options={statusFilterOptions}
              value={filters.status ?? ''}
            />
          </div>
        </div>

        {runs.length === 0 ? (
          <p className="text-sm text-[var(--text-3)]">No runs recorded yet.</p>
        ) : (
          <ul className="space-y-2">
            {runs.map((run) => (
              <li key={run.id}>
                <button
                  className={`w-full cursor-pointer rounded-lg border px-4 py-3 text-left transition-all duration-[120ms] ${
                    selectedRunId === run.id
                      ? 'border-[var(--accent-border)] bg-[var(--accent-bg)]'
                      : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent-border)] hover:bg-[var(--surface-2)]'
                  }`}
                  onClick={() => selectRun(run.id)}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[var(--text)]">{run.workflowName}</p>
                    <StatusBadge status={run.status} />
                  </div>
                  <p className="mt-1.5 text-xs text-[var(--text-3)]">
                    {new Date(run.startedAt).toLocaleString()}
                  </p>
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
