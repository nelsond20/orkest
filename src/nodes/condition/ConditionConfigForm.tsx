import type { NodeConfigFormProps } from '../shared/config-form.types'
import type { ConditionConfig } from './condition.types'

function parseInputValue(raw: string): ConditionConfig['value'] {
  if (raw === 'true') {
    return true
  }

  if (raw === 'false') {
    return false
  }

  if (!Number.isNaN(Number(raw)) && raw.trim() !== '') {
    return Number(raw)
  }

  if (raw.includes(',')) {
    return raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return raw
}

export function ConditionConfigForm({ value, onChange }: NodeConfigFormProps<ConditionConfig>) {
  return (
    <div className="space-y-3">
      <label className="block space-y-1.5">
        <span className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--text-3)]">
          Field
        </span>
        <input
          className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] outline-none transition-colors duration-[120ms] placeholder:text-[var(--text-3)] focus:border-[var(--accent)] w-full"
          onChange={(event) => onChange({ ...value, field: event.target.value })}
          value={value.field}
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--text-3)]">
          Operator
        </span>
        <select
          className="w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] outline-none transition-colors duration-[120ms] focus:border-[var(--accent)] cursor-pointer"
          onChange={(event) => onChange({ ...value, operator: event.target.value as ConditionConfig['operator'] })}
          value={value.operator}
        >
          <option value=">">&gt;</option>
          <option value="<">&lt;</option>
          <option value="==">==</option>
          <option value="in">in</option>
        </select>
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--text-3)]">
          Value
        </span>
        <input
          className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] outline-none transition-colors duration-[120ms] placeholder:text-[var(--text-3)] focus:border-[var(--accent)] w-full"
          onChange={(event) => onChange({ ...value, value: parseInputValue(event.target.value) })}
          value={Array.isArray(value.value) ? value.value.join(', ') : String(value.value)}
        />
      </label>
    </div>
  )
}
