import { NavLink, Outlet } from 'react-router-dom'
import { House, Search, Disc3, Library } from 'lucide-react'
import Player from './Player'

const items = [
  { to: '/', label: 'Inicio', Icon: House },
  { to: '/buscar', label: 'Buscar', Icon: Search },
  { to: '/estudio', label: 'Estudio', Icon: Disc3 },
  { to: '/biblioteca', label: 'Biblioteca', Icon: Library },
]

export default function Layout() {
  return (
    <div className="min-h-dvh bg-ink font-sans text-cream md:pl-64">
      {/* Escritorio: barra lateral */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col gap-2 p-4 md:flex">
        <div className="puffy mb-4 rounded-3xl bg-wine px-5 py-4 text-2xl font-black text-gold">BeatBoard</div>
        {items.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} end
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 font-bold transition ${isActive ? 'puffy bg-rose text-white' : 'text-cream/60 hover:bg-wine/60'}`}>
            <Icon size={22} /> {label}
          </NavLink>
        ))}
      </aside>

      <main className="mx-auto max-w-5xl px-4 pb-48 pt-6 md:px-8 md:pb-32">
        <Outlet />
      </main>

      <Player />

      {/* Celular: barra de pestañas flotante */}
      <nav className="puffy fixed inset-x-3 bottom-3 z-30 flex gap-1 rounded-[2rem] bg-wine/80 p-2 backdrop-blur-xl md:hidden">
        {items.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} end
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 rounded-3xl py-2 text-xs font-bold transition ${isActive ? 'puffy bg-rose text-white' : 'text-cream/60'}`}>
            <Icon size={22} /> {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}