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
        ? "puffy shadow-sm"
        : "hover:bg-[var(--bb-soft)]"
    }`;

  const linkStyle = ({ isActive }) => ({
    backgroundColor: isActive ? "var(--bb-primary)" : "transparent",
    color: isActive ? "var(--bb-text)" : "var(--bb-muted)",
  });

  return (
    <div
      className="min-h-dvh font-sans transition-colors duration-300 md:pl-64"
      style={{
        backgroundColor: "var(--bb-page)",
        color: "var(--bb-text)",
      }}
    >
      {/* Navegación de escritorio */}
      <aside
        className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col gap-2 border-r p-4 transition-colors duration-300 md:flex"
        style={{
          backgroundColor: "var(--bb-page)",
          borderColor: "var(--bb-border)",
        }}
      >
        <NavLink
          to="/"
          className="puffy mb-4 rounded-3xl px-5 py-4 text-2xl font-black tracking-tight transition-colors duration-300"
          style={{
            backgroundColor: "var(--bb-card)",
            color: "var(--bb-text)",
          }}
        >
          BeatBoard
          <span
            className="ml-1"
            style={{ color: "var(--bb-accent)" }}
          >
            .
          </span>
        </NavLink>

        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={linkClass}
            style={linkStyle}
          >
            <Icon size={21} strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}

        {/* Detalle decorativo */}
        <div
          className="mt-auto rounded-3xl border p-4 transition-colors duration-300"
          style={{
            backgroundColor: "var(--bb-card)",
            borderColor: "var(--bb-border)",
          }}
        >
          <p
            className="text-xs font-bold uppercase tracking-[0.2em]"
            style={{ color: "var(--bb-accent)" }}
          >
            Tu rincón musical
          </p>

          <p
            className="mt-2 text-sm leading-relaxed"
            style={{ color: "var(--bb-muted)" }}
          >
            Música, recuerdos y buenos momentos.
          </p>
        </div>
      </aside>

      {/* Contenido de cada página */}
      <main
        className="mx-auto min-h-dvh max-w-5xl px-4 pb-48 pt-6 md:px-8 md:pb-36"
      >
        <Outlet />
      </main>

      {/* Reproductor global */}
      <Player />

      {/* Navegación móvil */}
      <nav
        className="puffy fixed inset-x-3 bottom-3 z-40 flex gap-1 rounded-[2rem] border p-2 shadow-2xl backdrop-blur-xl transition-colors duration-300 md:hidden"
        style={{
          backgroundColor: "var(--bb-card)",
          borderColor: "var(--bb-border)",
          boxShadow: "0 20px 50px -20px rgb(0 0 0 / 45%)",
        }}
      >
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex min-w-0 flex-1 flex-col items-center justify-center
              gap-1 rounded-3xl py-2 transition-all duration-200 ${
                isActive ? "puffy shadow-sm" : ""
              }`
            }
            style={linkStyle}
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