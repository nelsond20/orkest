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
    <div className="space-y-3">
      <label className="block space-y-1.5">
        <span className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--text-3)]">
          Branch A Label
        </span>
        <input
          className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] outline-none transition-colors duration-[120ms] placeholder:text-[var(--text-3)] focus:border-[var(--accent)] w-full"
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

      <label className="block space-y-1.5">
        <span className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--text-3)]">
          Branch B Label
        </span>
        <input
          className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] outline-none transition-colors duration-[120ms] placeholder:text-[var(--text-3)] focus:border-[var(--accent)] w-full"
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
