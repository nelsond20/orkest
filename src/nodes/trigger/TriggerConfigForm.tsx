import type { NodeConfigFormProps } from '../shared/config-form.types'
import type { TriggerConfig } from './trigger.types'

export function TriggerConfigForm({ value, onChange }: NodeConfigFormProps<TriggerConfig>) {
  return (
    <label className="block text-xs text-slate-300">
      Event Type
      <select
        className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-2 text-xs"
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
