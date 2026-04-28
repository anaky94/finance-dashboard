import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const links = [
  { to: '/', icon: '📊', label: 'Dashboard' },
  { to: '/depenses', icon: '💸', label: 'Dépenses' },
  { to: '/revenus', icon: '💰', label: 'Revenus' },
  { to: '/bourse', icon: '📈', label: 'Bourse' },
]

export default function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-4 py-3">
        <Link to="/" onClick={() => setOpen(false)} className="text-white font-bold active:text-indigo-400">💰 Mes Finances</Link>
        <button onClick={() => setOpen(o => !o)} className="text-slate-400 hover:text-white text-2xl leading-none">
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setOpen(false)}>
          <nav className="absolute top-0 left-0 w-56 h-full bg-slate-900 pt-16 p-3 space-y-1" onClick={e => e.stopPropagation()}>
            {links.map(l => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'} onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`
                }>
                <span className="text-lg">{l.icon}</span>{l.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 min-h-screen bg-slate-900 border-r border-slate-700 flex-col">
        <div className="p-5 border-b border-slate-700">
          <h1 className="text-lg font-bold text-white">💰 Mes Finances</h1>
          <p className="text-xs text-slate-400 mt-0.5">ANAKY Konan</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`
              }>
              <span>{l.icon}</span>{l.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
