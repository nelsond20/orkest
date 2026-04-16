import type { NodeConfigFormProps } from '../shared/config-form.types'
import type { RetryConfig } from './retry.types'

export function RetryConfigForm({ value, onChange }: NodeConfigFormProps<RetryConfig>) {
  return (
    <div className="space-y-3">
      <label className="block space-y-1.5">
        <span className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--text-3)]">
          Max Attempts
        </span>
        <input
          className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] outline-none transition-colors duration-[120ms] placeholder:text-[var(--text-3)] focus:border-[var(--accent)] w-full"
          max={10}
          min={1}
          onChange={(event) => onChange({ ...value, maxAttempts: Number(event.target.value) })}
          type="number"
          value={value.maxAttempts}
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--text-3)]">
          Delay Seconds
        </span>
        <input
          className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] outline-none transition-colors duration-[120ms] placeholder:text-[var(--text-3)] focus:border-[var(--accent)] w-full"
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
