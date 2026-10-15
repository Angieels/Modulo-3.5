
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  CalendarDays,
  CircleDollarSign,
  Disc3,
  Heart,
  Music2,
  Play,
  Star,
  Users,
  Wallet,
  ArrowUpRight,
  Sparkles,
  MessageCircle,
} from "lucide-react";

import { supabase } from "../../supabase";
import { useArtist } from "../../context/ArtistContext.jsx";
import { Empty, btn, card, ghost, money } from "./ui.jsx";

const sum = (items, key) =>
  items.reduce((total, item) => total + Number(item[key] || 0), 0);

const statItems = [
  { key: "plays", label: "Reproducciones", icon: Play, format: (v) => Number(v).toLocaleString("es-SV") },
  { key: "likes", label: "Me gusta", icon: Heart, format: (v) => Number(v).toLocaleString("es-SV") },
  { key: "followers", label: "Seguidores", icon: Users, format: (v) => Number(v).toLocaleString("es-SV") },
  { key: "songs", label: "Canciones", icon: Music2, format: (v) => v },
  { key: "upcoming", label: "Próximos eventos", icon: CalendarDays, format: (v) => v },
  { key: "paid", label: "Cobrado", icon: CircleDollarSign, format: money },
  { key: "due", label: "Por cobrar", icon: Wallet, format: money },
  { key: "rating", label: "Valoración", icon: Star, format: (v) => v ? `${v}/5` : "—" },
];


export default function Dashboard() {
  const { artist } = useArtist();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setData(null);
      setError("");

      try {
        const [tracksResult, partsResult, ratingResult] = await Promise.all([
          supabase
            .from("tracks")
            .select("id, title, plays_count, likes_count")
            .eq("artist_id", artist.id)
            .order("plays_count", { ascending: false }),
          supabase
            .from("participations")
            .select("agreed_amount, paid_amount, events(starts_at)")
            .eq("artist_id", artist.id)
            .eq("confirmed", true),
          supabase
            .from("artist_ratings")
            .select("avg_rating")
            .eq("artist_id", artist.id)
            .maybeSingle(),
        ]);

        if (tracksResult.error) throw tracksResult.error;
        if (partsResult.error) throw partsResult.error;
        if (ratingResult.error) throw ratingResult.error;

        const tracks = tracksResult.data ?? [];
        const parts = partsResult.data ?? [];
        const now = new Date();

        const paid = sum(parts, "paid_amount");
        const agreed = sum(parts, "agreed_amount");

        if (!active) return;

        setData({
          tracks,
          plays: sum(tracks, "plays_count"),
          likes: sum(tracks, "likes_count"),
          upcoming: parts.filter(
            (item) =>
              item.events?.starts_at &&
              new Date(item.events.starts_at) >= now
          ).length,
          paid,
          due: agreed - paid,
          rating: ratingResult.data?.avg_rating ?? null,
        });
      } catch (err) {
        if (active) setError(err.message || "No se pudieron cargar tus estadísticas.");
      }
    }

    loadDashboard();
    return () => {
      active = false;
    };
  }, [artist.id]);

  if (error) {
    return (
      <div className={`${card} space-y-3`}>
        <p className="font-bold">No pudimos cargar tus estadísticas</p>
        <p className="text-sm text-[var(--bb-muted)]">{error}</p>
        <button className={ghost} onClick={() => setData(null)}>
          Actualizar la página para volver a intentarlo
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`${card} flex items-center gap-3`}>
        <Activity className="animate-pulse text-[var(--bb-accent)]" size={22} />
        <p className="text-sm text-[var(--bb-muted)]">Cargando tus números...</p>
      </div>
    );
  }

  const stats = {
    plays: data.plays,
    likes: data.likes,
    followers: artist.followers_count ?? 0,
    songs: data.tracks.length,
    upcoming: data.upcoming,
    paid: data.paid,
    due: data.due,
    rating: data.rating,
  };

  return (
    <div className="space-y-6">
      <header className="relative isolate overflow-hidden rounded-[1.75rem] border border-[var(--bb-border)] bg-[var(--bb-card)] p-5 sm:rounded-[2rem] sm:p-7 lg:p-8">
        {/* Decoración de fondo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-16 -z-10 size-48 rounded-full bg-[var(--bb-accent)] opacity-10 blur-3xl sm:size-64"
        />

        <div className="relative flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
          {/* Avatar circular de Melody */}
          <div className="flex shrink-0 items-center gap-4 sm:block">
            <div className="relative grid size-[76px] shrink-0 place-items-center rounded-full border-2 border-[var(--bb-accent)] bg-[var(--bb-soft)] shadow-lg shadow-[var(--bb-accent)]/10 sm:size-24">
              <div className="grid size-[62px] place-items-center rounded-full bg-[var(--bb-primary)] text-[var(--bb-button-text)] sm:size-20">
                <Music2 size={32} strokeWidth={1.7} />
              </div>

              <span className="absolute bottom-0 right-0 grid size-6 place-items-center rounded-full border-2 border-[var(--bb-card)] bg-[var(--bb-accent)] text-[var(--bb-page)]">
                <Sparkles size={12} />
              </span>
            </div>

            <div className="sm:hidden">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--bb-accent)]">
                Tu asistente musical
              </p>
              <p className="mt-1 text-lg font-black">Melody</p>
              <p className="text-xs text-[var(--bb-muted)]">
                Aquí estoy para ayudarte 🎵
              </p>
            </div>
          </div>

          {/* Mensaje personalizado */}
          <div className="min-w-0 flex-1">
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--bb-accent)]">
                Melody te da la bienvenida
              </span>
              <Sparkles size={15} className="text-[var(--bb-accent)]" />
            </div>

            <h1 className="mt-1 break-words text-2xl font-black leading-tight tracking-tight sm:text-3xl lg:text-4xl">
              ¡Hola, {artist.stage_name || "artista"}! 💜
            </h1>

            <p className="mt-2 text-sm font-semibold text-[var(--bb-text)] sm:text-base">
              Este es tu panel de hoy.
            </p>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--bb-muted)]">
              Soy Melody, tu compañera musical. Desde aquí puedes seguir el
              crecimiento de tus canciones, organizar tus próximos eventos y
              revisar la actividad de tu proyecto.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/artista/panel/canciones" className={btn}>
                <Music2 size={18} />
                Subir canción
              </Link>

              <Link to="/artista/panel/eventos" className={ghost}>
                <CalendarDays size={18} />
                Ver eventos
              </Link>
            </div>
          </div>
        </div>

        {/* Invitación a conversar con Melody */}
        <button
          type="button"
          onClick={() =>
            window.dispatchEvent(new Event("beatboard:open-melody"))
          }
          className="mt-5 flex w-full items-center gap-3 rounded-2xl border border-[var(--bb-border)] bg-[var(--bb-soft)] p-3 text-left transition hover:border-[var(--bb-accent)] sm:ml-[120px] sm:w-[calc(100%-120px)] lg:ml-[120px] lg:w-[calc(100%-120px)]"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--bb-primary)] text-[var(--bb-button-text)]">
            <MessageCircle size={19} />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold">
              ¿Necesitas una mano?
            </span>
            <span className="mt-0.5 block text-xs text-[var(--bb-muted)]">
              Pregúntale a Melody sobre BeatBoard.
            </span>
          </span>

          <Sparkles
            size={18}
            className="shrink-0 text-[var(--bb-accent)]"
          />
        </button>
      </header>


      <section>
        <div className="mb-3">
          <h2 className="text-lg font-black">Resumen de tu actividad</h2>
          <p className="mt-1 text-sm text-[var(--bb-muted)]">
            Tus números más importantes, de un vistazo.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {statItems.map(({ key, label, icon: Icon, format }) => (
            <article
              key={key}
              className={`${card} min-w-0 !p-4 transition duration-200 hover:-translate-y-0.5 sm:!p-5`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 text-xs font-bold text-[var(--bb-muted)] sm:text-sm">
                  {label}
                </span>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--bb-soft)] text-[var(--bb-accent)]">
                  <Icon size={18} />
                </span>
              </div>
              <p className="mt-3 break-words text-xl font-black tracking-tight sm:text-2xl">
                {format(stats[key])}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className={card}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">Tus canciones más escuchadas</h2>
            <p className="mt-1 text-sm text-[var(--bb-muted)]">
              Las canciones con más reproducciones.
            </p>
          </div>
          <Link
            to="/artista/canciones"
            className="inline-flex items-center gap-1 text-sm font-bold text-[var(--bb-accent)]"
          >
            Ver canciones <ArrowUpRight size={16} />
          </Link>
        </div>

        {data.tracks.length === 0 ? (
          <Empty>
            Todavía no tienes canciones. ¡Sube la primera y comienza a compartir tu música!
          </Empty>
        ) : (
          <ol className="space-y-2">
            {data.tracks.slice(0, 5).map((track, index) => (
              <li
                key={track.id}
                className="flex min-w-0 items-center gap-3 rounded-2xl border border-[var(--bb-border)] p-3"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--bb-soft)] text-sm font-black text-[var(--bb-accent)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--bb-soft)]">
                  <Disc3 size={20} className="text-[var(--bb-accent)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{track.title}</p>
                  <p className="mt-0.5 text-xs text-[var(--bb-muted)]">
                    {Number(track.likes_count || 0).toLocaleString("es-SV")} me gusta
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-black">
                    {Number(track.plays_count || 0).toLocaleString("es-SV")}
                  </p>
                  <p className="text-xs text-[var(--bb-muted)]">reproducciones</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
