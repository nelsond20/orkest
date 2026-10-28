import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
}

const variantMap: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-[var(--accent)] text-black font-semibold hover:bg-[var(--accent-hover)] active:scale-[0.97]',
  secondary:
    'border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-2)] hover:border-[var(--accent-border)] hover:text-[var(--text)] hover:bg-[var(--surface-3)]',
  ghost:
    'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]',
  danger:
    'border border-[var(--destructive-border)] bg-[var(--destructive-bg)] text-[var(--destructive)] hover:bg-[var(--destructive-bg-hover)] hover:border-[var(--destructive)]',
}

const sizeMap: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3.5 py-2 text-sm',
}

export function Button({
  children,
  className = '',
  variant = 'secondary',
  size = 'md',
  ...rest
}: PropsWithChildren<ButtonProps>) {
  return (
    <button
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded font-medium transition-all duration-[120ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg)] disabled:cursor-not-allowed disabled:opacity-40 ${sizeMap[size]} ${variantMap[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
