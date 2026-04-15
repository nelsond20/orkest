import type { ReactNode } from 'react'

interface NodeCardProps {
  title: string
  subtitle: string
  accentClassName: string
  children?: ReactNode
}

export function NodeCard({ title, subtitle, accentClassName, children }: NodeCardProps) {
  return (
    <div className="min-w-[180px] rounded-md border border-slate-700 bg-slate-900/95 p-3 shadow-lg">
      <div className={`mb-2 h-1 w-12 rounded-full ${accentClassName}`} />
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
      <p className="mt-1 text-xs text-slate-200">{subtitle}</p>
      {children}
    </div>
  )
}
