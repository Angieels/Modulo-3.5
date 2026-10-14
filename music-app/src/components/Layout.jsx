
import { NavLink, Outlet } from "react-router-dom";
import {
  House,
  Search,
  UserRound,
  Library,
} from "lucide-react";
import Player from "./Player";

const items = [
  { to: "/", label: "Inicio", Icon: House },
  { to: "/buscar", label: "Buscar", Icon: Search },
  { to: "/biblioteca", label: "Biblioteca", Icon: Library },
  { to: "/perfil", label: "Perfil", Icon: UserRound },
];

export default function Layout() {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-2xl px-4 py-3 font-bold
    transition-all duration-200 ${
      isActive
        ? "puffy bg-cream text-ink shadow-sm"
        : "text-cream/60 hover:bg-surface hover:text-cream"
    }`;

  return (
    <div className="min-h-dvh bg-ink font-sans text-cream md:pl-64">
      {/* Navegación de escritorio */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col gap-2 border-r border-white/5 bg-ink p-4 md:flex">
        <NavLink
          to="/"
          className="puffy mb-4 rounded-3xl bg-surface px-5 py-4 text-2xl font-black tracking-tight transition hover:bg-surface/80"
        >
          BeatBoard
          <span className="ml-1 text-amber-400">.</span>
        </NavLink>

        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={linkClass}
          >
            <Icon size={21} strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}

        {/* Detalle decorativo */}
        <div className="mt-auto rounded-3xl border border-white/5 bg-surface/60 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
            Tu rincón musical
          </p>
          <p className="mt-2 text-sm leading-relaxed text-cream/55">
            Música, recuerdos y buenos momentos.
          </p>
        </div>
      </aside>

      {/* Contenido de cada página */}
      <main className="mx-auto min-h-dvh max-w-5xl px-4 pb-48 pt-6 md:px-8 md:pb-36">
        <Outlet />
      </main>

      {/* Reproductor global */}
      <Player />

      {/* Navegación móvil */}
      <nav className="puffy fixed inset-x-3 bottom-3 z-40 flex gap-1 rounded-[2rem] border border-white/10 bg-surface/95 p-2 shadow-2xl shadow-black/30 backdrop-blur-xl md:hidden">
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex min-w-0 flex-1 flex-col items-center justify-center
              gap-1 rounded-3xl py-2 transition-all duration-200 ${
                isActive
                  ? "puffy bg-cream text-ink shadow-sm"
                  : "text-cream/60 hover:bg-white/5 hover:text-cream"
              }`
            }
          >
            <Icon size={21} strokeWidth={2} />
            <span className="truncate text-[11px] font-bold">
              {label}
            </span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
