import { useEffect, type PropsWithChildren } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  maxWidth?: string
}

export function Modal({
  isOpen,
  onClose,
  title,
  maxWidth = 'max-w-lg',
  children,
}: PropsWithChildren<ModalProps>) {
  useEffect(() => {
    if (!isOpen) return

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div
      aria-modal="true"
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
    >
      <div
        className={`animate-scale-in w-full ${maxWidth} overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl`}
      >
        {title ? (
          <header className="relative flex items-center justify-between border-b border-[var(--border)] px-5 py-4 before:absolute before:left-0 before:top-0 before:h-full before:w-0.5 before:rounded-tl-xl before:bg-[var(--accent)]">
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-3)]">
              {title}
            </h2>
            <button
              aria-label="Close"
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-base text-[var(--text-2)] leading-none transition-colors duration-[120ms] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
              onClick={onClose}
              type="button"
            >
              ×
            </button>
          </header>
        ) : null}
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body
  )
}
