import { Panel } from '../../components/ui/Panel'
import type { ExecutionRun } from './history.types'

interface RunDetailProps {
  run?: ExecutionRun
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    success: 'bg-[var(--success-bg)] text-[var(--success)]',
    failed: 'bg-[var(--destructive-bg)] text-[var(--destructive)]',
    cancelled: 'bg-[var(--warning-bg)] text-[var(--warning)]',
    running: 'bg-[var(--accent-bg)] text-[var(--accent)]',
  }
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium uppercase tracking-wide ${styles[status] ?? 'bg-[var(--surface-2)] text-[var(--text-3)]'}`}>
      {status || 'unknown'}
    </span>
  )
}

export function RunDetail({ run }: RunDetailProps) {
  if (!run) {
    return (
      <Panel title="Run Detail">
        <div className="flex h-full items-center justify-center">
          <p className="text-xs text-[var(--text-3)]">Select a run to inspect trace details.</p>
        </div>
      </Panel>
    )
  }

  return (
    <Panel title="Run Detail">
      <div className="mb-4 space-y-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.1em] text-[var(--text-3)]">Status</span>
          <StatusBadge status={run.status} />
        </div>
        <div>
          <span className="text-xs uppercase tracking-[0.1em] text-[var(--text-3)]">Workflow</span>
          <p className="mt-0.5 text-sm text-[var(--text)]">{run.workflowName}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-xs uppercase tracking-[0.1em] text-[var(--text-3)]">Started</span>
            <p className="mt-0.5 text-xs text-[var(--text-2)]">{new Date(run.startedAt).toLocaleString()}</p>
          </div>
          <div>
            <span className="text-xs uppercase tracking-[0.1em] text-[var(--text-3)]">Ended</span>
            <p className="mt-0.5 text-xs text-[var(--text-2)]">{run.endedAt ? new Date(run.endedAt).toLocaleString() : '—'}</p>
          </div>
        </div>
      </div>

      <div className="max-h-[60vh] overflow-auto rounded-lg border border-[var(--border)] bg-[var(--bg)] p-2">
        <ul className="space-y-1.5">
          {run.steps.map((step, index) => (
            <li key={`${step.nodeId}-${step.status}-${index}`} className="flex items-center justify-between gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs">
              <span className="font-medium text-[var(--text-2)]">
                {step.nodeId} · <span className="text-[var(--text-3)]">{step.nodeType}</span>
              </span>
              <StatusBadge status={step.status} />
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  )
}
