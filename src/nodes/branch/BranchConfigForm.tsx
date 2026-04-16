import type { NodeConfigFormProps } from '../shared/config-form.types'
import { defaultBranchConfig } from './branch.config'
import type { BranchConfig } from './branch.types'

export function BranchConfigForm({ value, onChange }: NodeConfigFormProps<BranchConfig>) {
  const options =
    Array.isArray(value?.options) && value.options.length >= 2
      ? value.options
      : defaultBranchConfig.options

  const [first, second] = options
  const normalizedValue: BranchConfig = {
    ...value,
    options: [first, second]
  }

  return (
    <div className="space-y-2 text-xs text-slate-300">
      <label className="block">
        Branch A Label
        <input
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-2"
          onChange={(event) =>
            onChange({
              ...normalizedValue,
              options: [
                { ...first, label: event.target.value },
                second
              ]
            })
          }
          value={first.label}
        />
      </label>

      <label className="block">
        Branch B Label
        <input
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-2"
          onChange={(event) =>
            onChange({
              ...normalizedValue,
              options: [
                first,
                { ...second, label: event.target.value }
              ]
            })
          }
          value={second.label}
        />
      </label>
    </div>
  )
}
