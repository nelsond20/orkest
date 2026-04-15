import type { PropsWithChildren } from 'react'

interface PanelProps {
  title?: string
  className?: string
}

export function Panel({ title, className = '', children }: PropsWithChildren<PanelProps>) {
  return (
    <section className={`rounded-lg border border-slate-800 bg-slate-900/70 ${className}`}>
      {title ? <header className="border-b border-slate-800 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</header> : null}
      <div className="p-3">{children}</div>
    </section>
  )
}
