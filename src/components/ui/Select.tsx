import { useEffect, useRef, useState } from 'react'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
}

export function Select({ value, onChange, options, placeholder = 'Select...', className = '' }: SelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selectedLabel = options.find((o) => o.value === value)?.label

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', keyHandler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', keyHandler)
    }
  }, [open])

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] transition-colors duration-[120ms] hover:border-[var(--accent-border)] focus:border-[var(--accent)] focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <span className={selectedLabel ? 'text-[var(--text)]' : 'text-[var(--text-3)]'}>
          {selectedLabel ?? placeholder}
        </span>
        <span
          className={`shrink-0 text-[var(--text-3)] transition-transform duration-[120ms] ${open ? 'rotate-180' : ''}`}
        >
          ▾
        </span>
      </button>

      {open ? (
        <div
          aria-label="Options"
          className="animate-slide-up absolute left-0 top-full z-20 mt-1 w-full overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface-2)] shadow-lg shadow-black/40"
          role="listbox"
        >
          {options.map((option) => (
            <button
              aria-selected={option.value === value}
              className={`w-full cursor-pointer px-3 py-2 text-left text-sm transition-colors duration-[100ms] ${
                option.value === value
                  ? 'bg-[var(--accent-bg)] text-[var(--accent)]'
                  : 'text-[var(--text-2)] hover:bg-[var(--surface-3)] hover:text-[var(--text)]'
              }`}
              key={option.value}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
              role="option"
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
