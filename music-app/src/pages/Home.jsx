
import { useEffect, useState, useRef } from "react";
import {
  Music2,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Sparkles,
  Coffee,
  Play,
  Flame,
  Disc3,
} from "lucide-react";

import { supabase } from "../supabase";
import { usePlayer } from "../store/usePlayer";
import LikeButton from "../components/LikeButton";

const AUDIO_BUCKET = "tracks";
const COVER_BUCKET = "covers";

function getPublicUrl(bucket, path) {
  if (!path) return null;

  if (/^https?:\/\//i.test(path)) return path;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl ?? null;
}


function normalizeTrack(track) {
  const artist = Array.isArray(track.artist)
    ? track.artist[0]
    : track.artist;

  const audioUrl = getPublicUrl("tracks", track.audio_path);
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
      : "linear-gradient(135deg, #60432E, #292019, #17120F)",
  };
}

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
      setLoading(false);
    }

    loadTracks();

    return () => {
      active = false;
    };
  }, []);

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
    <main className="min-h-screen overflow-hidden bg-[#17120F] pb-24 text-[#F4E9D8]">
      <div className="mx-auto w-full max-w-[1600px] px-4 pt-5 sm:px-7 sm:pt-8 xl:px-12">

        {/* CABECERA */}
        <header className="mb-8 flex items-center justify-between sm:mb-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D6B58B] text-[#17120F]">
              <Music2 size={24} strokeWidth={2.5} />
            </div>

            <div>
              <h1 className="text-xl font-black tracking-tight sm:text-2xl">
                BeatBoard
              </h1>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-[#BBA68E]">
                YOUR MUSIC SPACE
              </p>
            </div>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#493326] bg-[#292019] text-[#D6B58B]">
            <Headphones size={19} />
          </div>
        </header>

        {/* MENSAJES */}
        {error && (
          <p
            role="status"
            className="mb-5 rounded-xl border border-[#6A4B36] bg-[#292019] px-4 py-3 text-sm text-[#D6B58B]"
          >
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex min-h-60 flex-col items-center justify-center text-center">
            <Music2 size={30} className="mb-4 animate-pulse text-[#D6B58B]" />
            <p className="font-semibold">Preparando tu música...</p>
            <p className="mt-2 text-sm text-[#BBA68E]">
              Un momentito.
            </p>
          </div>
        ) : (
          <div className="space-y-9 sm:space-y-12">

            {/* CARRUSEL DE NOVEDADES */}
            <MusicSection
              title="Hoy suena"
              subtitle="Los lanzamientos más recientes."
              icon="new"
              tracks={recentTracks}
              onPlay={handlePlay}
              emptyMessage="Todavía no hay canciones nuevas."
            />

            {/* CARRUSEL DE POPULARES */}
            <MusicSection
              title="Populares"
              subtitle="Las canciones con más reproducciones."
              icon="popular"
              tracks={popularTracks}
              onPlay={handlePlay}
              emptyMessage="Aún no hay canciones populares."
            />

          </div>
        )}

        <footer className="mt-10 flex items-center justify-center gap-2 text-xs text-[#8F7964]">
          <Coffee size={14} />
          Hecho para escuchar sin prisa.
        </footer>
      </div>
    </main>
  );
}

/* SECCIÓN REUTILIZABLE PARA CADA CARRUSEL */
function MusicSection({
  title,
  subtitle,
  icon,
  tracks,
  onPlay,
  emptyMessage,
}) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#D6B58B]">
            {icon === "popular" ? (
              <Flame size={15} />
            ) : (
              <Sparkles size={15} />
            )}
            {icon === "popular" ? "Lo más escuchado" : "Recién agregadas"}
          </div>

          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
            {title}
          </h2>

          <p className="mt-1 text-sm text-[#BBA68E]">{subtitle}</p>
        </div>

        <span className="shrink-0 rounded-full border border-[#493326] bg-[#292019] px-3 py-2 text-xs text-[#D6B58B]">
          {tracks.length} {tracks.length === 1 ? "track" : "tracks"}
        </span>
      </div>

      <div className="overflow-hidden rounded-[1.7rem] border border-[#493326] bg-[#211A15] py-4 sm:py-5">
        {tracks.length > 0 ? (
          <TrackCarousel tracks={tracks} onPlay={onPlay} />
        ) : (
          <div className="flex min-h-36 flex-col items-center justify-center px-5 text-center">
            <Disc3 size={28} className="mb-3 text-[#D6B58B]" />
            <p className="text-sm text-[#BBA68E]">{emptyMessage}</p>
          </div>
        )}
      </div>
    </section>
  );
}

/* CARRUSEL HORIZONTAL COMPACTO */
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
    <div>
      {/* CONTROLES DEL CARRUSEL */}
      <div className="mb-3 flex items-center justify-between px-4 sm:px-5">
        <p className="text-xs text-[#BBA68E]">
          <span className="font-bold text-[#F4E9D8]">
            {String(activeIndex + 1).padStart(2, "0")}
          </span>
          {" / "}
          {String(tracks.length).padStart(2, "0")}
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Canción anterior"
            disabled={activeIndex === 0}
            onClick={() => goTo(activeIndex - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#5B4030] bg-[#30241B] text-[#D6B58B] transition hover:bg-[#493326] disabled:opacity-30 sm:h-9 sm:w-9"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            aria-label="Siguiente canción"
            disabled={activeIndex >= tracks.length - 1}
            onClick={() => goTo(activeIndex + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#5B4030] bg-[#30241B] text-[#D6B58B] transition hover:bg-[#493326] disabled:opacity-30 sm:h-9 sm:w-9"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* LAS TARJETAS YA NO SON TAN GRANDES */}
      <div
        ref={carouselRef}
        className="flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto overscroll-x-contain px-4 pb-3 pt-1 sm:gap-4 sm:px-5 lg:gap-5"
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
              onClick={() => {
                if (!active) goTo(index);
              }}
              className={`w-[148px] flex-none snap-center overflow-hidden rounded-2xl border transition-all duration-300 sm:w-[178px] lg:w-[196px] xl:w-[210px] ${
                active
                  ? "border-[#8B6748] bg-[#493326] shadow-lg shadow-black/20"
                  : "border-[#493326]/70 bg-[#2A211A] opacity-90 hover:border-[#8B6748]"
              }`}
            >
              {/* PORTADA CUADRADA */}
              <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#60432E] via-[#39281E] to-[#17120F]">
                {track.coverUrl ? (
                  <img
                    src={track.coverUrl}
                    alt={`Portada de ${track.title}`}
                    loading="lazy"
                    draggable="false"
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Music2
                      size={38}
                      strokeWidth={1.4}
                      className="text-[#D6B58B]"
                    />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[#17120F]/70 via-transparent to-transparent" />

                <div
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#17120F]/75 backdrop-blur-sm"
                  onClick={(event) => event.stopPropagation()}
                >
                  <LikeButton trackId={track.id} />
                </div>

                <span className="absolute bottom-2 left-2 rounded-full border border-white/10 bg-[#17120F]/70 px-2 py-1 text-[9px] font-bold text-[#F4E9D8]">
                  {index === 0 && active ? "DESTACADA" : "TRACK"}
                </span>
              </div>

              {/* INFORMACIÓN DE LA CANCIÓN */}
              <div className="p-3">
                <h3
                  title={track.title}
                  className="truncate text-sm font-extrabold text-[#F4E9D8]"
                >
                  {track.title}
                </h3>

                <p
                  title={track.artistName}
                  className="mt-1 truncate text-xs text-[#D6B58B]"
                >
                  {track.artistName}
                </p>

                <div className="mt-2 flex items-center justify-between gap-1 text-[10px] text-[#BBA68E]">
                  <span className="flex min-w-0 items-center gap-1">
                    <Headphones size={12} className="shrink-0" />
                    <span className="truncate">
                      {track.plays_count ?? 0} plays
                    </span>
                  </span>

                  {track.likes_count > 0 && (
                    <span className="shrink-0">
                      ♥ {track.likes_count}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setActiveIndex(index);
                    onPlay(track, tracks);
                  }}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-[#D6B58B] px-2 py-2.5 text-xs font-extrabold text-[#211811] transition hover:bg-[#F4E9D8] active:scale-[0.97]"
                >
                  <Play size={13} fill="currentColor" />
                  Escuchar
                </button>
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
              aria-label={`Ir a ${track.title}`}
              onClick={() => goTo(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? "w-6 bg-[#D6B58B]"
                  : "w-1.5 bg-[#6A4B36]"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
