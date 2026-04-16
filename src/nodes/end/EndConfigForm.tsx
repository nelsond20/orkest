import type { NodeConfigFormProps } from '../shared/config-form.types'
import type { EndConfig } from './end.types'

export function EndConfigForm({ value, onChange }: NodeConfigFormProps<EndConfig>) {
  return (
    <label className="block text-xs text-slate-300">
      Final Result
      <select
        className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-2"
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
