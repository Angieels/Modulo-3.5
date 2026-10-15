
import { Link, Navigate } from "react-router-dom";
import {
  Mic,
  Music2,
  ArrowRight,
  Headphones,
  Sparkles,
} from "lucide-react";

import { useArtist } from "../../context/ArtistContext.jsx";
import { btn, ghost } from "./ui.jsx";

export default function ArtistEntry() {
  const { user, artist, loading } = useArtist();

  if (loading) {
    return (
      <div className="mx-auto flex min-h-64 max-w-xl flex-col items-center justify-center gap-3 px-4 text-center">
        <div className="grid size-14 place-items-center rounded-2xl bg-[var(--bb-soft)] text-[var(--bb-accent)]">
          <Music2 size={26} className="animate-pulse" />
        </div>
        <p className="text-sm text-[var(--bb-muted)]">
          Preparando tu espacio musical...
        </p>
      </div>
    );
  }

  if (artist) {
    return <Navigate to="/artista/panel" replace />;
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
      <section className="relative isolate overflow-hidden rounded-[2rem] border border-[var(--bb-border)] bg-[var(--bb-card)] px-5 py-9 text-center shadow-sm sm:rounded-[2.5rem] sm:px-10 sm:py-14 lg:px-16 lg:py-16">
        {/* Decoración ambiental: utiliza los colores del tema actual */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 -z-10 size-64 rounded-full bg-[var(--bb-primary)] opacity-40 blur-3xl sm:size-80"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-20 -z-10 size-64 rounded-full bg-[var(--bb-soft)] opacity-80 blur-3xl"
        />

        <div className="mx-auto flex max-w-2xl flex-col items-center">
          <div className="mb-5 grid size-20 place-items-center rounded-[1.75rem] border border-[var(--bb-border)] bg-[var(--bb-soft)] text-[var(--bb-accent)] shadow-sm sm:mb-7 sm:size-24 sm:rounded-[2rem]">
            <Mic size={38} strokeWidth={1.6} />
          </div>

          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--bb-border)] bg-[var(--bb-soft)] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--bb-accent)] sm:text-xs">
            <Sparkles size={14} />
            Tu espacio creativo
          </span>

          <h1 className="max-w-xl text-3xl font-black leading-tight tracking-tight text-[var(--bb-text)] sm:text-4xl lg:text-5xl">
            ¿La música es lo tuyo?
            <span className="mt-1 block text-[var(--bb-accent)]">
              Este espacio es para ti.
            </span>
          </h1>

          <p className="mt-5 max-w-lg text-sm leading-7 text-[var(--bb-muted)] sm:text-base sm:leading-8">
            Publica tus canciones, organiza tus lanzamientos, gestiona tus
            presentaciones y conecta con las personas que disfrutan de tu
            música. Todo desde un solo lugar.
          </p>

          <div className="mt-8 grid w-full max-w-lg grid-cols-1 gap-3 text-left sm:mt-10 sm:grid-cols-3">
            <Feature
              icon={Music2}
              title="Tu música"
              description="Organiza tus lanzamientos."
            />
            <Feature
              icon={Headphones}
              title="Tu público"
              description="Conecta con oyentes."
            />
            <Feature
              icon={Sparkles}
              title="Tu proyecto"
              description="Haz crecer tu perfil."
            />
          </div>

          {user ? (
            <div className="mt-8 flex w-full max-w-lg flex-col gap-3 sm:mt-10 sm:flex-row">
              <Link
                to="/artista/registro"
                className={`${btn} min-h-12 flex-1 !rounded-2xl`}
              >
                Crear perfil artístico
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/perfil"
                className={`${ghost} min-h-12 flex-1 !rounded-2xl`}
              >
                Seguir escuchando
              </Link>
            </div>
          ) : (
            <div className="mt-8 w-full max-w-md sm:mt-10">
              <p className="mb-4 text-sm leading-relaxed text-[var(--bb-muted)]">
                Inicia sesión o crea tu cuenta para abrir tu propio estudio
                de artista.
              </p>

              <Link
                to="/perfil"
                className={`${btn} min-h-12 w-full !rounded-2xl`}
              >
                Iniciar sesión o registrarme
                <ArrowRight size={18} />
              </Link>
            </div>
          )}

          <p className="mt-6 text-xs text-[var(--bb-muted)]">
            BeatBoard · Un espacio para crear, compartir y escuchar.
          </p>
        </div>
      </section>
    </main>
  );
}

function Feature({ icon: Icon, title, description }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[var(--bb-border)] bg-[var(--bb-soft)]/70 p-3.5 sm:flex-col sm:items-start sm:p-4">
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--bb-card)] text-[var(--bb-accent)]">
        <Icon size={19} />
      </div>

      <div className="min-w-0">
        <h2 className="text-sm font-black text-[var(--bb-text)]">
          {title}
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-[var(--bb-muted)]">
          {description}
        </p>
      </div>
    </div>
  );
}
