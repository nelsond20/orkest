import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
}

const variantMap: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-500',
  secondary: 'bg-slate-700 text-slate-100 hover:bg-slate-600',
  ghost: 'bg-transparent text-slate-300 hover:bg-slate-800'
}

export function Button({ children, className = '', variant = 'secondary', ...rest }: PropsWithChildren<ButtonProps>) {
  return (
    <button
      className={`rounded-md px-3 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variantMap[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
