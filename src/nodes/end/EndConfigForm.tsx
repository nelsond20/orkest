import type { NodeConfigFormProps } from '../shared/config-form.types'
import type { EndConfig } from './end.types'

export function EndConfigForm({ value, onChange }: NodeConfigFormProps<EndConfig>) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--text-3)]">
        Final Result
      </span>
      <select
        className="w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] outline-none transition-colors duration-[120ms] focus:border-[var(--accent)] cursor-pointer"
        onChange={(event) => onChange({ ...value, result: event.target.value as EndConfig['result'] })}
        value={value.result}
      >
        <option value="completed">completed</option>
        <option value="failed">failed</option>
        <option value="manual_review">manual_review</option>
      </select>
    </label>
  )
}
