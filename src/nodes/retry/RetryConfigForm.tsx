import type { NodeConfigFormProps } from '../shared/config-form.types'
import type { RetryConfig } from './retry.types'

export function RetryConfigForm({ value, onChange }: NodeConfigFormProps<RetryConfig>) {
  return (
    <div className="space-y-2 text-xs text-slate-300">
      <label className="block">
        Max Attempts
        <input
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-2"
          max={10}
          min={1}
          onChange={(event) => onChange({ ...value, maxAttempts: Number(event.target.value) })}
          type="number"
          value={value.maxAttempts}
        />
      </label>

      <label className="block">
        Delay Seconds
        <input
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-2"
          max={120}
          min={0}
          onChange={(event) => onChange({ ...value, delaySeconds: Number(event.target.value) })}
          type="number"
          value={value.delaySeconds}
        />
      </label>
    </div>
  )
}
