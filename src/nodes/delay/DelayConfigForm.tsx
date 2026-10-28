import type { NodeConfigFormProps } from '../shared/config-form.types'
import type { DelayConfig } from './delay.types'

export function DelayConfigForm({ value, onChange }: NodeConfigFormProps<DelayConfig>) {
  return (
    <div className="space-y-3">
      <label className="block space-y-1.5">
        <span className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--text-3)]">
          Duration
        </span>
        <input
          className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] outline-none transition-colors duration-[120ms] placeholder:text-[var(--text-3)] focus:border-[var(--accent)] w-full"
          min={1}
          onChange={(event) => onChange({ ...value, duration: Number(event.target.value) })}
          type="number"
          value={value.duration}
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--text-3)]">
          Unit
        </span>
        <select
          className="w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] outline-none transition-colors duration-[120ms] focus:border-[var(--accent)] cursor-pointer"
          onChange={(event) => onChange({ ...value, unit: event.target.value as DelayConfig['unit'] })}
          value={value.unit}
        >
          <option value="seconds">seconds</option>
          <option value="minutes">minutes</option>
        </select>
      </label>
    </div>
  )
}
