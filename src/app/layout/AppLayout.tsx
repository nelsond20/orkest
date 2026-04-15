import { Link, NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Workflows' },
  { to: '/history', label: 'History' }
]

export function AppLayout() {
  return (
    <div className="flex h-full min-h-screen flex-col bg-app-bg text-slate-100">
      <header className="border-b border-app-border bg-app-panel/80 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <Link className="text-lg font-semibold tracking-tight" to="/">
            OrderFlow Studio
          </Link>
          <nav className="flex items-center gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-sm transition ${isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800'}`
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
