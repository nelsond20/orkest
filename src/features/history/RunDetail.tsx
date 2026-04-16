import { Panel } from '../../components/ui/Panel'
import type { ExecutionRun } from './history.types'

interface RunDetailProps {
  run?: ExecutionRun
}

export function RunDetail({ run }: RunDetailProps) {
  if (!run) {
    return (
      <Panel title="Run Detail">
        <p className="text-xs text-slate-400">Select a run to inspect full trace details.</p>
      </Panel>
    )
  }

  return (
    <Panel title="Run Detail">
      <div className="space-y-2 text-xs text-slate-300">
        <p>Run ID: {run.id}</p>
        <p>Workflow: {run.workflowName}</p>
        <p>Status: {run.status}</p>
        <p>Started: {new Date(run.startedAt).toLocaleString()}</p>
        <p>Ended: {run.endedAt ? new Date(run.endedAt).toLocaleString() : 'N/A'}</p>

        <div className="mt-3 max-h-[48vh] overflow-auto rounded-md border border-slate-800 bg-slate-950 p-2">
          <ul className="space-y-1">
            {run.steps.map((step, index) => (
              <li key={`${step.nodeId}-${step.status}-${index}`} className="rounded border border-slate-800 px-2 py-1 text-[11px]">
                {step.nodeId} · {step.nodeType} · {step.status}
                {step.error ? ` · ${step.error}` : ''}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Panel>
  )
}
