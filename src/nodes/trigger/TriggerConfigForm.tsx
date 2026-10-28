import type { NodeConfigFormProps } from '../shared/config-form.types'
import type { TriggerConfig } from './trigger.types'

export function TriggerConfigForm({ value, onChange }: NodeConfigFormProps<TriggerConfig>) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--text-3)]">
        Event Type
      </span>
      <select
        className="w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] outline-none transition-colors duration-[120ms] focus:border-[var(--accent)] cursor-pointer"
        onChange={(event) => onChange({ ...value, eventType: event.target.value as TriggerConfig['eventType'] })}
        value={value.eventType}
      >
        <option value="order.created">order.created</option>
        <option value="appointment.created">appointment.created</option>
        <option value="manual">manual</option>
      </select>
    </label>
  )
}
