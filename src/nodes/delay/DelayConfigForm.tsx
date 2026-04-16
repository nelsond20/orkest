import type { NodeConfigFormProps } from '../shared/config-form.types'
import type { DelayConfig } from './delay.types'

export function DelayConfigForm({ value, onChange }: NodeConfigFormProps<DelayConfig>) {
  return (
    <div className="space-y-2 text-xs text-slate-300">
      <label className="block">
        Duration
        <input
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-2"
          min={1}
          onChange={(event) => onChange({ ...value, duration: Number(event.target.value) })}
          type="number"
          value={value.duration}
        />
      </label>

      <label className="block">
        Unit
        <select
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-2"
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
