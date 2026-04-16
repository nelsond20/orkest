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
    <div className="space-y-2 text-xs text-slate-300">
      <label className="block">
        Field
        <input
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-2"
          onChange={(event) => onChange({ ...value, field: event.target.value })}
          value={value.field}
        />
      </label>

      <label className="block">
        Operator
        <select
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-2"
          onChange={(event) => onChange({ ...value, operator: event.target.value as ConditionConfig['operator'] })}
          value={value.operator}
        >
          <option value=">">&gt;</option>
          <option value="<">&lt;</option>
          <option value="==">==</option>
          <option value="in">in</option>
        </select>
      </label>

      <label className="block">
        Value
        <input
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-2"
          onChange={(event) => onChange({ ...value, value: parseInputValue(event.target.value) })}
          value={Array.isArray(value.value) ? value.value.join(', ') : String(value.value)}
        />
      </label>
    </div>
  )
}
