import type { StepLog as StepLogEntry } from '../history/history.types'

interface StepLogProps {
  steps: StepLogEntry[]
}

export function StepLog({ steps }: StepLogProps) {
  if (steps.length === 0) {
    return <p className="text-xs text-slate-400">No execution steps yet.</p>
  }

  return (
    <div className="max-h-[36vh] overflow-y-auto pr-1">
      <ul className="space-y-2">
        {steps.map((step, index) => (
          <li
            data-status={step.status}
            data-testid="step-log-item"
            key={`${step.nodeId}-${step.status}-${index}`}
            className="rounded-md border border-slate-800 bg-slate-950 p-2 text-xs"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-slate-200">
                {step.nodeId} · {step.nodeType}
              </span>
              <span
                className={`rounded px-2 py-0.5 text-[10px] uppercase ${
                  step.status === 'failed'
                    ? 'bg-red-500/20 text-red-300'
                    : step.status === 'succeeded'
                      ? 'bg-green-500/20 text-green-300'
                      : step.status === 'running'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-slate-800 text-slate-300'
                }`}
              >
                {step.status}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">{new Date(step.startedAt).toLocaleString()}</p>
            {step.error ? <p className="mt-1 text-[11px] text-red-300">{step.error}</p> : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
