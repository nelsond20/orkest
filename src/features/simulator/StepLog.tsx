import type { StepLog as StepLogEntry } from '../history/history.types'

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    success: 'bg-[var(--success-bg)] text-[var(--success)]',
    failed: 'bg-[var(--destructive-bg)] text-[var(--destructive)]',
    cancelled: 'bg-[var(--warning-bg)] text-[var(--warning)]',
    running: 'bg-[var(--accent-bg)] text-[var(--accent)]',
    succeeded: 'bg-[var(--success-bg)] text-[var(--success)]',
  }
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium uppercase tracking-wide ${styles[status] ?? 'bg-[var(--surface-2)] text-[var(--text-3)]'}`}>
      {status || 'idle'}
    </span>
  )
}

interface StepLogProps {
  steps: StepLogEntry[]
}

export function StepLog({ steps }: StepLogProps) {
  if (steps.length === 0) {
    return <p className="text-xs text-[var(--text-3)]">No execution steps yet.</p>
  }

  return (
    <div className="max-h-[36vh] overflow-y-auto pr-1">
      <ul className="space-y-2">
        {steps.map((step, index) => (
          <li
            data-status={step.status}
            data-testid="step-log-item"
            key={`${step.nodeId}-${step.status}-${index}`}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-2.5 text-xs"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-[var(--text-2)]">
                {step.nodeId}
                <span className="ml-1 text-[var(--text-3)]">· {step.nodeType}</span>
              </span>
              <StatusBadge status={step.status} />
            </div>
            <p className="mt-1 text-xs text-[var(--text-3)]">{new Date(step.startedAt).toLocaleString()}</p>
            {step.error ? <p className="mt-1 text-xs text-[var(--destructive)]">{step.error}</p> : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
