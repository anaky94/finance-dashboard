import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', icon: '📊', label: 'Dashboard' },
  { to: '/depenses', icon: '💸', label: 'Dépenses' },
  { to: '/revenus', icon: '💰', label: 'Revenus' },
  { to: '/bourse', icon: '📈', label: 'Bourse' },
]

export default function Sidebar() {
  return (
    <aside className="w-56 min-h-screen bg-slate-900 border-r border-slate-700 flex flex-col">
      <div className="p-5 border-b border-slate-700">
        <h1 className="text-lg font-bold text-white">💰 Mes Finances</h1>
        <p className="text-xs text-slate-400 mt-0.5">ANAKY Konan</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <span>{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
