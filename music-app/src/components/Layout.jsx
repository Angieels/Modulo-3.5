
import { NavLink, Outlet } from 'react-router-dom'
import {
  House,
  Search,
  UserRound,
  Library,
} from 'lucide-react'
import Player from './Player'

const items = [
  { to: '/', label: 'Inicio', Icon: House },
  { to: '/buscar', label: 'Buscar', Icon: Search },
  { to: '/perfil', label: 'Perfil', Icon: UserRound },
  { to: '/biblioteca', label: 'Biblioteca', Icon: Library },
]

export default function Layout() {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-2xl px-4 py-3 font-bold
    transition ${
      isActive
        ? 'puffy bg-cream text-ink'
        : 'text-cream/60 hover:bg-surface hover:text-cream'
    }`

  return (
    <div className="min-h-dvh bg-ink font-sans text-cream md:pl-64">
      {/* Navegación para escritorio */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col gap-2 border-r border-white/5 bg-ink p-4 md:flex">
        <div className="puffy mb-4 rounded-3xl bg-surface px-5 py-4 text-2xl font-black">
          BeatBoard
        </div>

        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={linkClass}
          >
            <Icon size={22} />
            {label}
          </NavLink>
        ))}
      </aside>

      {/* Contenido principal */}
      <main className="mx-auto min-h-dvh max-w-5xl px-4 pb-48 pt-6 md:px-8 md:pb-36">
        <Outlet />
      </main>

      <Player />

      {/* Navegación para móviles */}
      <nav className="puffy fixed inset-x-3 bottom-3 z-40 flex gap-1 rounded-[2rem] border border-white/10 bg-surface/90 p-2 shadow-2xl backdrop-blur-xl md:hidden">
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex min-w-0 flex-1 flex-col items-center justify-center
              gap-1 rounded-3xl py-2 text-[11px] font-bold transition ${
                isActive
                  ? 'puffy bg-cream text-ink'
                  : 'text-cream/60 hover:text-cream'
              }`
            }
          >
            <Icon size={21} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}