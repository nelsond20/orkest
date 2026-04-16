import { useMemo } from 'react'
import type { NodeConfigFormProps } from '../shared/config-form.types'
import type { ActionConfig } from './action.types'

export function ActionConfigForm({ value, onChange }: NodeConfigFormProps<ActionConfig>) {
  const paramsJson = useMemo(() => JSON.stringify(value.params, null, 2), [value.params])

  return (
    <div className="space-y-2 text-xs text-slate-300">
      <label className="block">
        Action Type
        <select
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-2"
          onChange={(event) => onChange({ ...value, actionType: event.target.value as ActionConfig['actionType'] })}
          value={value.actionType}
        >
          <option value="notify">notify</option>
          <option value="updateStatus">updateStatus</option>
          <option value="assignQueue">assignQueue</option>
          <option value="addTag">addTag</option>
        </select>
      </label>

      <label className="block">
        Params JSON
        <textarea
          className="mt-1 h-24 w-full rounded-md border border-slate-700 bg-slate-950 p-2 font-mono"
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

      <label className="flex items-center gap-2">
        <input
          checked={Boolean(value.shouldFail)}
          onChange={(event) => onChange({ ...value, shouldFail: event.target.checked })}
          type="checkbox"
        />
        Force deterministic failure
      </label>
    </div>
  )
}
