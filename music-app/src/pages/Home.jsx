import { useEffect, useState, useRef } from "react";
import {
  Music2,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Sparkles,
  Coffee,
  Flame,
  Disc3,
} from "lucide-react";

import { supabase } from "../supabase";
import { usePlayer } from "../store/usePlayer";
import LikeButton from "../components/LikeButton";

/* =========================================
   UTILIDADES
========================================= */

// Obtiene la URL pública de un archivo de Supabase Storage.
function getPublicUrl(bucket, path) {
  if (!path) return null;

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return data?.publicUrl ?? null;
}

// Abrevia números: 1200 -> 1,2 mil; 1500000 -> 1,5 M.
function formatCount(value) {
  const number = Number(value) || 0;

  if (number >= 1_000_000_000) {
    return `${(number / 1_000_000_000).toLocaleString("es-SV", {
      maximumFractionDigits: 1,
    })} mil M`;
  }

  if (number >= 1_000_000) {
    return `${(number / 1_000_000).toLocaleString("es-SV", {
      maximumFractionDigits: 1,
    })} M`;
  }

  if (number >= 1_000) {
    return `${(number / 1_000).toLocaleString("es-SV", {
      maximumFractionDigits: 1,
    })} mil`;
  }

  return number.toLocaleString("es-SV");
}

// Normaliza las canciones que llegan de Supabase.
function normalizeTrack(track) {
  const artist = Array.isArray(track.artist)
    ? track.artist[0]
    : track.artist;

  // Todos los archivos MP3 se obtienen del bucket "audio".
  const audioUrl = getPublicUrl("audio", track.audio_path);

  // Las portadas siguen obteniéndose del bucket "covers".
  const coverUrl = getPublicUrl("covers", track.cover_path);

  return {
    ...track,
    artistName: artist?.stage_name ?? "Artista sin nombre",
    artist: artist?.stage_name ?? "Artista sin nombre",
    artistAvatar: artist?.avatar_url ?? null,
    audioUrl,
    src: audioUrl,
    coverUrl,
    cover: coverUrl
      ? `url("${coverUrl}") center / cover no-repeat`
      : "linear-gradient(135deg, var(--bb-primary), var(--bb-card), var(--bb-page))",
  };
}

/* =========================================
   ESTILOS DINÁMICOS
========================================= */

const cardStyle = {
  backgroundColor: "var(--bb-card)",
  borderColor: "var(--bb-border)",
  color: "var(--bb-text)",
};

const softStyle = {
  backgroundColor: "var(--bb-soft)",
  borderColor: "var(--bb-border)",
};

const mutedTextStyle = {
  color: "var(--bb-muted)",
};

const accentTextStyle = {
  color: "var(--bb-accent)",
};

/* =========================================
   PÁGINA PRINCIPAL
========================================= */

export default function Home() {
  const [recentTracks, setRecentTracks] = useState([]);
  const [popularTracks, setPopularTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const play = usePlayer((state) => state.play);

  useEffect(() => {
    let active = true;

    async function loadTracks() {
      setLoading(true);
      setError("");

      try {
        const selectTracks = `
          *,
          artist:artists!tracks_artist_id_fkey (
            id,
            stage_name,
            avatar_url
          )
        `;

        const [recentResult, popularResult] = await Promise.all([
          supabase
            .from("tracks")
            .select(selectTracks)
            .eq("is_public", true)
            .order("created_at", { ascending: false })
            .limit(12),

          supabase
            .from("tracks")
            .select(selectTracks)
            .eq("is_public", true)
            .order("plays_count", { ascending: false })
            .order("likes_count", { ascending: false })
            .order("created_at", { ascending: false })
            .limit(12),
        ]);

        if (!active) return;

        if (recentResult.error || popularResult.error) {
          console.error(
            "Error cargando canciones:",
            recentResult.error ?? popularResult.error
          );

          setError("No pudimos cargar algunas canciones.");
        }

        setRecentTracks((recentResult.data ?? []).map(normalizeTrack));
        setPopularTracks((popularResult.data ?? []).map(normalizeTrack));
      } catch (err) {
        console.error("Error inesperado al cargar canciones:", err);

        if (active) {
          setError("Ocurrió un error al cargar la música.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadTracks();

    return () => {
      active = false;
    };
  }, []);

  // Reproduce la canción y conserva la cola.
  function handlePlay(track, queue) {
    if (!track.src) {
      setError(`No encontramos el audio de "${track.title}".`);
      return;
    }

    setError("");

    const index = queue.findIndex((item) => item.id === track.id);

    play(queue, Math.max(index, 0));
  }

  return (
    <main
      className="min-h-screen overflow-hidden pb-32 transition-colors duration-300"
      style={{
        backgroundColor: "var(--bb-page)",
        color: "var(--bb-text)",
      }}
    >
      <div className="mx-auto w-full max-w-[1600px] px-4 pt-5 sm:px-7 sm:pt-8 lg:px-10 xl:px-14">
        {/* CABECERA */}
        <header className="mb-9 flex items-center justify-between sm:mb-12">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg shadow-black/10"
              style={{
                backgroundColor: "var(--bb-accent)",
                color: "var(--bb-page)",
              }}
            >
              <Music2 size={25} strokeWidth={2.5} />
            </div>

            <div>
              <h1 className="text-xl font-black tracking-tight sm:text-2xl">
                BeatBoard
              </h1>

              <p
                className="mt-0.5 text-[10px] font-semibold tracking-[0.2em]"
                style={mutedTextStyle}
              >
                YOUR MUSIC SPACE
              </p>
            </div>
          </div>

          <div
            className="flex h-11 w-11 items-center justify-center rounded-full border"
            style={{
              backgroundColor: "var(--bb-card)",
              borderColor: "var(--bb-border)",
              color: "var(--bb-accent)",
            }}
            aria-label="Música"
          >
            <Headphones size={20} />
          </div>
        </header>

        {/* MENSAJES */}
        {error && (
          <p
            role="status"
            className="mb-6 rounded-2xl border px-4 py-3 text-sm"
            style={{
              ...cardStyle,
              color: "var(--bb-accent)",
            }}
          >
            {error}
          </p>
        )}

        {/* CONTENIDO */}
        {loading ? (
          <div className="flex min-h-72 flex-col items-center justify-center text-center">
            <Music2
              size={34}
              className="mb-4 animate-pulse"
              style={accentTextStyle}
            />

            <p className="font-semibold">Preparando tu música...</p>

            <p className="mt-2 text-sm" style={mutedTextStyle}>
              Un momentito.
            </p>
          </div>
        ) : (
          <div className="space-y-12 sm:space-y-16">
            <MusicSection
              title="Hoy suena"
              subtitle="Descubre lo último que llegó a BeatBoard."
              icon="new"
              tracks={recentTracks}
              onPlay={handlePlay}
              layout="carousel"
              emptyMessage="Todavía no hay canciones nuevas."
            />

            <MusicSection
              title="Populares"
              subtitle="Los temas que están sonando más."
              icon="popular"
              tracks={popularTracks.slice(0, 6)}
              onPlay={handlePlay}
              layout="grid"
              emptyMessage="Aún no hay canciones populares."
            />
          </div>
        )}

        {/* PIE DE PÁGINA */}
        <footer
          className="mt-14 flex items-center justify-center gap-2 border-t pt-6 text-xs"
          style={{
            borderColor: "var(--bb-border)",
            color: "var(--bb-muted)",
          }}
        >
          <Coffee size={15} />
          Hecho para escuchar sin prisa.
        </footer>
      </div>
    </main>
  );
}

/* =========================================
   SECCIÓN REUTILIZABLE
========================================= */

function MusicSection({
  title,
  subtitle,
  icon,
  tracks,
  onPlay,
  layout,
  emptyMessage,
}) {
  return (
    <section className="min-w-0">
      <div className="mb-5 flex items-end justify-between gap-3 sm:mb-6">
        <div className="min-w-0">
          <div
            className="mb-2.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] sm:text-xs"
            style={accentTextStyle}
          >
            {icon === "popular" ? (
              <Flame size={16} />
            ) : (
              <Sparkles size={16} />
            )}

            {icon === "popular" ? "Lo más escuchado" : "Recién agregadas"}
          </div>

          <h2 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
            {title}
          </h2>

          <p
            className="mt-1.5 text-sm leading-relaxed sm:text-base"
            style={mutedTextStyle}
          >
            {subtitle}
          </p>
        </div>

        <span
          className="shrink-0 rounded-full border px-3 py-2 text-[11px] sm:px-4 sm:text-xs"
          style={{
            ...cardStyle,
            color: "var(--bb-accent)",
          }}
        >
          {tracks.length} {tracks.length === 1 ? "canción" : "canciones"}
        </span>
      </div>

      {tracks.length > 0 ? (
        layout === "grid" ? (
          <PopularGrid tracks={tracks} onPlay={onPlay} />
        ) : (
          <TrackCarousel tracks={tracks} onPlay={onPlay} />
        )
      ) : (
        <div
          className="flex min-h-44 flex-col items-center justify-center rounded-3xl border px-5 text-center"
          style={cardStyle}
        >
          <Disc3
            size={32}
            className="mb-3"
            style={accentTextStyle}
          />

          <p className="text-sm" style={mutedTextStyle}>
            {emptyMessage}
          </p>
        </div>
      )}
    </section>
  );
}

/* =========================================
   CARRUSEL DE NOVEDADES
========================================= */

function TrackCarousel({ tracks, onPlay }) {
  const carouselRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function updateActiveIndex() {
    const container = carouselRef.current;
    if (!container) return;

    const cards = Array.from(container.children);
    if (!cards.length) return;

    const center =
      container.getBoundingClientRect().left + container.clientWidth / 2;

    let closestIndex = 0;
    let closestDistance = Infinity;

    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const distance = Math.abs(center - (rect.left + rect.width / 2));

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveIndex(closestIndex);
  }

  function goTo(index) {
    const container = carouselRef.current;
    if (!container) return;

    const cards = Array.from(container.children);
    if (!cards.length) return;

    const safeIndex = Math.max(0, Math.min(index, cards.length - 1));

    cards[safeIndex].scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });

    setActiveIndex(safeIndex);
  }

  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;

    updateActiveIndex();

    container.addEventListener("scroll", updateActiveIndex, {
      passive: true,
    });

    window.addEventListener("resize", updateActiveIndex);

    return () => {
      container.removeEventListener("scroll", updateActiveIndex);
      window.removeEventListener("resize", updateActiveIndex);
    };
  }, [tracks.length]);

  return (
    <div
      className="overflow-hidden rounded-3xl border py-4 transition-colors duration-300 sm:py-5 lg:py-6"
      style={cardStyle}
    >
      {/* NAVEGACIÓN */}
      <div className="mb-4 flex items-center justify-between px-4 sm:px-6">
        <p className="text-xs" style={mutedTextStyle}>
          <span className="font-bold" style={{ color: "var(--bb-text)" }}>
            {String(activeIndex + 1).padStart(2, "0")}
          </span>
          {" / "}
          {String(tracks.length).padStart(2, "0")}
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Desplazar a la canción anterior"
            disabled={activeIndex === 0}
            onClick={() => goTo(activeIndex - 1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border transition hover:brightness-110 disabled:opacity-30"
            style={{
              ...softStyle,
              color: "var(--bb-accent)",
            }}
          >
            <ChevronLeft size={19} />
          </button>

          <button
            type="button"
            aria-label="Desplazar a la siguiente canción"
            disabled={activeIndex >= tracks.length - 1}
            onClick={() => goTo(activeIndex + 1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border transition hover:brightness-110 disabled:opacity-30"
            style={{
              ...softStyle,
              color: "var(--bb-accent)",
            }}
          >
            <ChevronRight size={19} />
          </button>
        </div>
      </div>

      {/* TARJETAS */}
      <div
        ref={carouselRef}
        className="flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto overscroll-x-contain px-4 pb-4 pt-1 sm:gap-5 sm:px-6 lg:gap-6"
        style={{
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {tracks.map((track, index) => {
          const active = index === activeIndex;

          return (
            <article
              key={track.id}
              role="button"
              tabIndex={0}
              aria-label={`Reproducir ${track.title} de ${track.artistName}`}
              onClick={() => {
                setActiveIndex(index);
                onPlay(track, tracks);
              }}
              onKeyDown={(event) => {
                if (
                  event.target !== event.currentTarget ||
                  (event.key !== "Enter" && event.key !== " ")
                ) {
                  return;
                }

                event.preventDefault();
                setActiveIndex(index);
                onPlay(track, tracks);
              }}
              className={`group w-[min(66vw,220px)] flex-none snap-center cursor-pointer overflow-hidden rounded-2xl border text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 sm:w-[220px] lg:w-[240px] xl:w-[250px] ${
                active ? "shadow-md" : "hover:brightness-110"
              }`}
              style={{
                backgroundColor: active ? "var(--bb-primary)" : "var(--bb-soft)",
                borderColor: active ? "var(--bb-accent)" : "var(--bb-border)",
                color: "var(--bb-text)",
                "--tw-ring-color": "var(--bb-accent)",
              }}
            >
              {/* PORTADA */}
              <div
                className="relative aspect-square overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, var(--bb-primary), var(--bb-card), var(--bb-page))",
                }}
              >
                {track.coverUrl ? (
                  <img
                    src={track.coverUrl}
                    alt={`Portada de ${track.title}`}
                    loading="lazy"
                    draggable="false"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Music2
                      size={44}
                      strokeWidth={1.4}
                      style={accentTextStyle}
                    />
                  </div>
                )}

                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, color-mix(in srgb, var(--bb-page) 80%, transparent), transparent 65%)",
                  }}
                />

                {/* FAVORITOS */}
                <div
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--bb-page) 88%, transparent)",
                  }}
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                  onKeyUp={(event) => event.stopPropagation()}
                >
                  <LikeButton trackId={track.id} />
                </div>

                <span
                  className="absolute bottom-3 left-3 rounded-full border border-white/10 px-2.5 py-1.5 text-[9px] font-bold tracking-wider"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--bb-page) 85%, transparent)",
                    color: "var(--bb-text)",
                  }}
                >
                  {index === 0 ? "NOVEDAD" : "BEATBOARD"}
                </span>
              </div>

              {/* INFORMACIÓN */}
              <div className="p-3.5 sm:p-4">
                <h3
                  title={track.title}
                  className="truncate text-sm font-extrabold sm:text-base"
                  style={{ color: "var(--bb-text)" }}
                >
                  {track.title || "Sin título"}
                </h3>

                <p
                  title={track.artistName}
                  className="mt-1.5 truncate text-xs sm:text-sm"
                  style={accentTextStyle}
                >
                  {track.artistName}
                </p>

                <div
                  className="mt-3 flex items-center gap-1.5 text-[11px]"
                  style={mutedTextStyle}
                >
                  <Headphones size={13} className="shrink-0" />
                  <span>{formatCount(track.plays_count)} reproducciones</span>
                </div>

                <p
                  className="mt-3 text-[10px] font-bold uppercase tracking-wider transition-colors"
                  style={accentTextStyle}
                >
                  Toca para reproducir ↗
                </p>
              </div>
            </article>
          );
        })}
      </div>

      {/* INDICADORES */}
      {tracks.length > 1 && (
        <div className="mt-1 flex justify-center gap-1.5 px-4">
          {tracks.map((track, index) => (
            <button
              key={track.id}
              type="button"
              aria-label={`Desplazarse a ${track.title}`}
              onClick={() => goTo(index)}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: index === activeIndex ? "24px" : "6px",
                backgroundColor:
                  index === activeIndex
                    ? "var(--bb-accent)"
                    : "var(--bb-border)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================
   LISTA DE CANCIONES POPULARES
========================================= */

function PopularGrid({ tracks, onPlay }) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {tracks.map((track, index) => (
        <article
          key={track.id}
          role="button"
          tabIndex={0}
          aria-label={`Reproducir ${track.title} de ${track.artistName}`}
          onClick={() => onPlay(track, tracks)}
          onKeyDown={(event) => {
            if (
              event.target !== event.currentTarget ||
              (event.key !== "Enter" && event.key !== " ")
            ) {
              return;
            }

            event.preventDefault();
            onPlay(track, tracks);
          }}
          className="group flex min-w-0 cursor-pointer items-center gap-3 rounded-2xl border p-3 transition duration-300 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 sm:gap-4 sm:rounded-3xl sm:p-4"
          style={{
            ...cardStyle,
            "--tw-ring-color": "var(--bb-accent)",
          }}
        >
          {/* POSICIÓN */}
          <span
            className="w-5 flex-none text-center text-xs font-bold tabular-nums sm:w-7 sm:text-sm"
            style={mutedTextStyle}
          >
            {String(index + 1).padStart(2, "0")}
          </span>

          {/* PORTADA */}
          <div
            className="relative h-[68px] w-[68px] flex-none overflow-hidden rounded-xl sm:h-[84px] sm:w-[84px] sm:rounded-2xl"
            style={{
              background:
                "linear-gradient(135deg, var(--bb-primary), var(--bb-card), var(--bb-page))",
            }}
          >
            {track.coverUrl ? (
              <img
                src={track.coverUrl}
                alt={`Portada de ${track.title}`}
                loading="lazy"
                draggable="false"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Music2
                  size={30}
                  strokeWidth={1.5}
                  style={accentTextStyle}
                />
              </div>
            )}
          </div>

          {/* INFORMACIÓN */}
          <div className="min-w-0 flex-1">
            <h3
              title={track.title}
              className="truncate text-sm font-extrabold sm:text-base"
              style={{ color: "var(--bb-text)" }}
            >
              {track.title || "Sin título"}
            </h3>

            <p
              title={track.artistName}
              className="mt-1 truncate text-xs sm:text-sm"
              style={accentTextStyle}
            >
              {track.artistName}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:mt-3 sm:gap-2">
              <span
                title={`${Number(track.plays_count) || 0} reproducciones`}
                className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-medium sm:text-xs"
                style={{
                  ...softStyle,
                  color: "var(--bb-accent)",
                }}
              >
                <Headphones size={12} />
                {formatCount(track.plays_count)}
              </span>

              <span
                title={`${Number(track.likes_count) || 0} likes`}
                className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-medium sm:text-xs"
                style={{
                  ...softStyle,
                  color: "var(--bb-accent)",
                }}
              >
                <span aria-hidden="true">♥</span>
                {formatCount(track.likes_count)}
              </span>
            </div>
          </div>

          {/* FAVORITO */}
          <div
            className="flex h-9 w-9 flex-none items-center justify-center rounded-full transition hover:brightness-110 sm:h-10 sm:w-10"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
            onKeyUp={(event) => event.stopPropagation()}
          >
            <LikeButton trackId={track.id} />
          </div>
        </article>
      ))}
    </div>
  );
}