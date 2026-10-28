import { Link, NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Workflows' },
  { to: '/history', label: 'History' }
]

export function AppLayout() {
  return (
    <div className="flex h-full min-h-screen flex-col text-[var(--text)]">
      <header className="relative z-10 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6">
          <Link className="flex items-center gap-3 py-4" to="/">
            <span className="flex h-[22px] w-[22px] items-center justify-center rounded border border-[var(--accent-border)] bg-[var(--accent-bg)] text-[9px] font-bold text-[var(--accent)]">
              ▸
            </span>
            <div className="flex items-baseline gap-2.5">
              <span className="text-sm font-bold uppercase tracking-[0.1em] text-[var(--text)]">
                Orkest
              </span>
              <span className="hidden text-xs font-medium uppercase tracking-[0.12em] text-[var(--text-3)] sm:block">
                workflow studio
              </span>
            </div>
          </Link>

          <nav className="flex items-center">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                className={({ isActive }) =>
                  `relative flex h-[57px] items-center px-4 text-[11px] tracking-wide transition-colors duration-[120ms] ${
                    isActive
                      ? 'text-[var(--text)] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[var(--accent)]'
                      : 'text-[var(--text-2)] hover:text-[var(--text)]'
                  }`
                }
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col p-6">
        <Outlet />
      </main>
    </div>
  )
}
