import { NavLink, Navigate, Outlet, Link } from "react-router-dom";
import {
  UserRound,
  Music2,
  ArrowUpRight,
  ArrowLeft,
} from "lucide-react";

import { useArtist } from "../../context/ArtistContext.jsx";

const tabs = [
  { to: "panel", label: "Panel", short: "Panel" },
  { to: "canciones", label: "Canciones", short: "Música" },
  { to: "albumes", label: "Álbumes", short: "Álbumes" },
  { to: "eventos", label: "Eventos", short: "Eventos" },
  { to: "finanzas", label: "Finanzas", short: "Finanzas" },
  { to: "resenas", label: "Reseñas", short: "Reseñas" },
  { to: "perfil", label: "Mi perfil", short: "Perfil" },
];

export default function ArtistLayout() {
  const { artist, loading } = useArtist();

  if (loading) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-4 text-center">
        <div className="grid size-14 place-items-center rounded-2xl bg-[var(--bb-soft)] text-[var(--bb-accent)]">
          <Music2 size={26} className="animate-pulse" />
        </div>

        <p className="text-sm text-[var(--bb-muted)]">
          Preparando tu estudio de artista...
        </p>
      </div>
    );
  }

  if (!artist) {
    return <Navigate to="/artista" replace />;
  }

  const initials = (artist.stage_name || "Artista")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <main className="mx-auto w-full min-w-0 max-w-[1600px] space-y-5 pb-10 sm:space-y-7">
      {/* CABECERA */}
      <header className="relative isolate overflow-hidden rounded-[1.75rem] border border-[var(--bb-border)] bg-[var(--bb-card)] p-4 sm:rounded-[2rem] sm:p-6 lg:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-24 -z-10 size-56 rounded-full bg-[var(--bb-primary)] opacity-40 blur-3xl sm:size-72"
        />

        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <div className="relative shrink-0">
            {artist.avatar_url ? (
              <img
                src={artist.avatar_url}
                alt={`Foto de ${artist.stage_name || "artista"}`}
                className="size-16 rounded-2xl border border-[var(--bb-border)] object-cover sm:size-20 sm:rounded-3xl lg:size-24"
              />
            ) : (
              <div className="grid size-16 place-items-center rounded-2xl border border-[var(--bb-border)] bg-[var(--bb-soft)] text-[var(--bb-accent)] sm:size-20 sm:rounded-3xl lg:size-24">
                <UserRound size={32} strokeWidth={1.5} />
              </div>
            )}

            <span
              aria-hidden="true"
              className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full border-2 border-[var(--bb-card)] bg-[var(--bb-accent)] text-[var(--bb-page)] sm:size-7"
            >
              <Music2 size={12} />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--bb-accent)] sm:text-xs sm:tracking-[0.2em]">
                Estudio de artista
              </span>

              <span className="rounded-full border border-[var(--bb-border)] bg-[var(--bb-soft)] px-2 py-1 text-[9px] font-bold text-[var(--bb-muted)] sm:text-[10px]">
                MI ESPACIO
              </span>
            </div>

            <h1 className="break-words text-xl font-black leading-tight tracking-tight text-[var(--bb-text)] sm:text-2xl lg:text-3xl">
              {artist.stage_name || initials}
            </h1>

            <p className="mt-1.5 text-xs leading-relaxed text-[var(--bb-muted)] sm:text-sm">
              Tu música, tus lanzamientos y tu comunidad.
            </p>
          </div>
        </div>

        {/* BOTÓN PARA VOLVER AL REPRODUCTOR */}
        <div className="mt-5">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--bb-border)] bg-[var(--bb-soft)] px-4 py-2.5 text-sm font-bold text-[var(--bb-text)] transition hover:border-[var(--bb-accent)] hover:text-[var(--bb-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bb-accent)]"
          >
            <ArrowLeft size={18} />
            Volver al reproductor
          </Link>
        </div>
      </header>

      {/* NAVEGACIÓN */}
      <nav
        aria-label="Navegación del estudio de artista"
        className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
        style={{
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div className="flex w-max min-w-full gap-2 rounded-2xl border border-[var(--bb-border)] bg-[var(--bb-card)] p-2 sm:w-fit sm:min-w-0 sm:flex-wrap sm:rounded-full">
          {tabs.map(({ to, label, short }) => {
            const destination =
              to === "panel" ? "/artista/panel" : `/artista/panel/${to}`;

            return (
              <NavLink
                key={to}
                to={destination}
                end
                aria-label={label}
                className={({ isActive }) =>
                  [
                    "inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-200 sm:rounded-full sm:px-4 sm:text-sm",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bb-accent)]",
                    isActive
                      ? "bg-[var(--bb-primary)] text-[var(--bb-button-text)] shadow-sm"
                      : "text-[var(--bb-muted)] hover:bg-[var(--bb-soft)] hover:text-[var(--bb-text)]",
                  ].join(" ")
                }
              >
                <span className="sm:hidden">{short}</span>
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* CONTENIDO */}
      <section className="min-w-0">
        <Outlet />
      </section>

      {/* PIE DEL ESTUDIO */}
      <footer className="flex flex-wrap items-center justify-center gap-2 border-t border-[var(--bb-border)] pt-5 text-center text-xs text-[var(--bb-muted)] sm:justify-between sm:pt-6">
        <span className="flex items-center gap-2">
          <Music2 size={14} className="text-[var(--bb-accent)]" />
          Tu espacio creativo en BeatBoard.
        </span>

        <span className="inline-flex items-center gap-1">
          Hecho para escuchar sin prisa.
          <ArrowUpRight size={13} />
        </span>
      </footer>
    </main>
  );
}