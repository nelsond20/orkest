import type { PropsWithChildren, ReactNode } from 'react'

interface PanelProps {
  title?: string
  className?: string
  action?: ReactNode
}

export function Panel({ title, className = '', action, children }: PropsWithChildren<PanelProps>) {
  return (
    <section
      className={`overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] ${className}`}
    >
      {title ? (
        <header className="relative flex items-center justify-between border-b border-[var(--border)] px-4 py-3 before:absolute before:left-0 before:top-0 before:h-full before:w-0.5 before:bg-[var(--accent)]">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-2)]">
            {title}
          </span>
          {action ? <div>{action}</div> : null}
        </header>
      ) : null}
      <div className="p-4">{children}</div>
    </section>
  )
}
