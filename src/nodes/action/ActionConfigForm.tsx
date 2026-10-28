import { useMemo } from 'react'
import type { NodeConfigFormProps } from '../shared/config-form.types'
import type { ActionConfig } from './action.types'

export function ActionConfigForm({ value, onChange }: NodeConfigFormProps<ActionConfig>) {
  const paramsJson = useMemo(() => JSON.stringify(value.params, null, 2), [value.params])

  return (
    <div className="space-y-3">
      <label className="block space-y-1.5">
        <span className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--text-3)]">
          Action Type
        </span>
        <select
          className="w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] outline-none transition-colors duration-[120ms] focus:border-[var(--accent)] cursor-pointer"
          onChange={(event) => onChange({ ...value, actionType: event.target.value as ActionConfig['actionType'] })}
          value={value.actionType}
        >
          <option value="notify">notify</option>
          <option value="updateStatus">updateStatus</option>
          <option value="assignQueue">assignQueue</option>
          <option value="addTag">addTag</option>
        </select>
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--text-3)]">
          Params JSON
        </span>
        <textarea
          className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] outline-none transition-colors duration-[120ms] placeholder:text-[var(--text-3)] focus:border-[var(--accent)] w-full h-24 font-mono"
          onChange={(event) => {
            try {
              const parsed = JSON.parse(event.target.value) as Record<string, unknown>
              onChange({ ...value, params: parsed })
            } catch {
              onChange({ ...value, params: value.params })
            }
          }}
          value={paramsJson}
        />
      </label>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          checked={Boolean(value.shouldFail)}
          className="h-3.5 w-3.5 rounded border-[var(--border)] accent-[var(--accent)] cursor-pointer"
          onChange={(event) => onChange({ ...value, shouldFail: event.target.checked })}
          type="checkbox"
        />
        <span className="text-sm text-[var(--text-2)]">Force deterministic failure</span>
      </label>
    </div>
  )
}
