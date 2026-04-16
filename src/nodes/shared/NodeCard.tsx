import type { ReactNode } from 'react'

interface NodeCardProps {
  title: string
  subtitle: string
  accentClassName: string
  children?: ReactNode
}

export function NodeCard({ title, subtitle, accentClassName, children }: NodeCardProps) {
  return (
    <div className="relative min-w-[180px] rounded-md border border-[var(--border)] bg-[var(--surface)] p-3 shadow-lg shadow-black/40">
      <div className={`mb-2.5 h-0.5 w-10 rounded-full ${accentClassName}`} />
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-3)]">{title}</p>
      <p className="mt-1 text-sm font-medium text-[var(--text)]">{subtitle}</p>
      {children}
    </div>
  )
}
