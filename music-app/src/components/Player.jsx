
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Headphones,
} from "lucide-react";
import { usePlayer } from "../store/usePlayer";

const fmt = (s) => {
  const seconds = Number.isFinite(s) ? s : 0;

  return `${Math.floor(seconds / 60)}:${String(
    Math.floor(seconds % 60)
  ).padStart(2, "0")}`;
};

const spin = (playing) => ({
  animationPlayState: playing ? "running" : "paused",
});

// Obtiene el nombre del artista.
function getArtistName(artist) {
  if (typeof artist === "string") {
    return artist || "Artista sin nombre";
  }

  if (artist && typeof artist === "object") {
    return artist.stage_name ?? "Artista sin nombre";
  }

  return "Artista sin nombre";
}

// Obtiene la portada de la canción.
// coverUrl es la URL de la imagen; cover puede ser un fondo CSS.
function getCoverUrl(track) {
  if (track?.coverUrl && /^https?:\/\//i.test(track.coverUrl)) {
    return track.coverUrl;
  }

  if (track?.cover && /^https?:\/\//i.test(track.cover)) {
    return track.cover;
  }

  const match = track?.cover?.match(
    /url\(["']?(https?:\/\/[^"')]+)["']?\)/i
  );

  return match?.[1] ?? null;
}

const fallbackBackground =
  "linear-gradient(135deg, #60432E 0%, #292019 50%, #17120F 100%)";

// Fondo ambiental con colores intensos de la portada.
function AmbientBackground({ track, expanded = false }) {
  const coverUrl = getCoverUrl(track);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Portada ampliada y muy difuminada */}
      {coverUrl ? (
        <motion.img
          key={coverUrl}
          src={coverUrl}
          alt=""
          initial={{ opacity: 0, scale: 1.35 }}
          animate={{
            opacity: expanded ? 0.95 : 0.85,
            scale: expanded ? 1.2 : 1.35,
          }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            filter: expanded
              ? "blur(55px) saturate(1.9) brightness(1.05)"
              : "blur(38px) saturate(1.8) brightness(1.1)",
          }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: track?.cover || fallbackBackground,
            filter: "blur(35px) saturate(1.8)",
            transform: "scale(1.2)",
          }}
        />
      )}

      {/* Capa de color: conserva la intensidad del álbum */}
      <div
        className="absolute inset-0"
        style={{
          background: expanded
            ? `
              linear-gradient(
                180deg,
                rgba(10, 8, 14, 0.08) 0%,
                rgba(10, 8, 14, 0.18) 45%,
                rgba(10, 8, 14, 0.58) 100%
              )
            `
            : `
              linear-gradient(
                90deg,
                rgba(10, 8, 14, 0.16) 0%,
                rgba(10, 8, 14, 0.28) 60%,
                rgba(10, 8, 14, 0.42) 100%
              )
            `,
        }}
      />

      {/* Resplandor central para que los colores se fundan */}
      <div
        className="absolute inset-0"
        style={{
          background: expanded
            ? `
              radial-gradient(
                ellipse at 50% 28%,
                rgba(255, 255, 255, 0.12) 0%,
                transparent 58%
              )
            `
            : `
              radial-gradient(
                ellipse at 25% 50%,
                rgba(255, 255, 255, 0.12) 0%,
                transparent 70%
              )
            `,
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}

// Disco de vinilo.
function Vinyl({ t, playing }) {
  const coverUrl = getCoverUrl(t);

  const grooves =
    "repeating-radial-gradient(circle, #1b1815 0 2px, #0d0c0a 2px 4px)";

  const shine =
    "conic-gradient(rgb(255 255 255 / 0) 0deg, rgb(255 255 255 / .14) 40deg, rgb(255 255 255 / 0) 90deg, rgb(255 255 255 / 0) 180deg, rgb(255 255 255 / .14) 220deg, rgb(255 255 255 / 0) 270deg)";

  return (
    <div
      className="relative mx-auto w-full max-w-md"
      style={{ aspectRatio: "100 / 66" }}
    >
      {/* Disco */}
      <div
        className="absolute right-0 top-1/2 aspect-square w-[64%] -translate-y-1/2 rounded-full"
        style={{
          boxShadow: "0 20px 40px -12px rgb(0 0 0 / .8)",
        }}
      >
        <div
          className="vinyl-spin relative size-full rounded-full"
          style={{
            ...spin(playing),
            background: `${shine}, ${grooves}`,
          }}
        >
          <div
            className="absolute inset-[33%] rounded-full"
            style={{
              background: coverUrl
                ? `url("${coverUrl}") center / cover`
                : t.cover || "#493326",
            }}
          />

          <div className="absolute inset-[47.5%] rounded-full bg-ink" />
        </div>
      </div>

      {/* Portada */}
      <div
        className="puffy absolute left-0 top-1/2 z-10 aspect-square w-[64%] -translate-y-1/2 overflow-hidden rounded-[1.75rem]"
        style={{
          background: t.cover || fallbackBackground,
          boxShadow: "0 18px 45px rgba(0,0,0,0.35)",
        }}
      >
        {coverUrl && (
          <img
            src={coverUrl}
            alt={`Portada de ${t.title || "la canción"}`}
            draggable="false"
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        )}
      </div>

      {/* Brazo del tocadiscos */}
      <div
        className="absolute right-[3%] top-[2%] z-20 h-[52%] w-2.5 origin-top rounded-full bg-gradient-to-b from-sand to-cream transition-transform duration-700 ease-in-out"
        style={{
          transform: `rotate(${playing ? 24 : -10}deg)`,
        }}
      >
        <div className="absolute -bottom-1 -left-1 h-5 w-4 rounded bg-surface ring-1 ring-sand/40" />
      </div>
    </div>
  );
}

export default function Player() {
  const {
    queue,
    index,
    playing,
    pos,
    dur,
    open,
    toggle,
    next,
    prev,
    seek,
    setOpen,
  } = usePlayer();

  const t = queue[index];

  if (!t) return null;

  const PlayIcon = playing ? Pause : Play;
  const artistName = getArtistName(t.artist ?? t.artistName);

  const progress = dur > 0
    ? Math.min((pos / dur) * 100, 100)
    : 0;

  return (
    <>
      {/* MINI REPRODUCTOR */}
      <motion.div
        key={`mini-${t.id}`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        onClick={() => setOpen(true)}
        className="fixed inset-x-3 bottom-24 z-30 flex cursor-pointer items-center gap-3 overflow-hidden rounded-[2rem] border border-white/[0.07] p-2.5 pr-3 text-cream shadow-2xl shadow-black/20 backdrop-blur-2xl md:bottom-4 md:left-[17rem] md:right-6"
        style={{
          background: "rgba(23, 18, 15, 0.76)",
          isolation: "isolate",
        }}
      >
        <AmbientBackground track={t} />

        <div className="relative z-10 flex min-w-0 flex-1 items-center gap-3">
          {/* Mini vinilo */}
          <div
            className="vinyl-spin relative size-14 shrink-0 overflow-hidden rounded-full"
            style={{
              ...spin(playing),
              background: t.cover || fallbackBackground,
              boxShadow: "0 4px 18px rgba(0,0,0,0.3)",
            }}
          >
            {getCoverUrl(t) && (
              <img
                src={getCoverUrl(t)}
                alt=""
                draggable="false"
                className="absolute inset-0 h-full w-full rounded-full object-cover"
              />
            )}

            <div className="absolute inset-[42%] rounded-full border border-white/20 bg-ink" />
          </div>

          {/* Información */}
          <div className="min-w-0 flex-1">
            <p className="truncate font-extrabold">
              {t.title ?? "Sin título"}
            </p>

            <p className="truncate text-sm text-cream/70">
              {artistName}
            </p>

            <div className="mt-1.5 flex items-center gap-1 text-[10px] text-cream/50">
              <Headphones size={11} />
              <span>{playing ? "Reproduciendo" : "En pausa"}</span>
            </div>
          </div>

          {/* Play / pausa */}
          <button
            type="button"
            aria-label={playing ? "Pausar" : "Reproducir"}
            onClick={(e) => {
              e.stopPropagation();
              toggle();
            }}
            className="puffy grid size-12 shrink-0 place-items-center rounded-full bg-cream text-ink transition hover:scale-105 active:scale-90"
          >
            <PlayIcon fill="currentColor" size={22} />
          </button>
        </div>

        {/* Barra de progreso */}
        <div className="absolute inset-x-5 bottom-0.5 z-20 h-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-cream transition-[width] duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </motion.div>

      {/* REPRODUCTOR AMPLIADO */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="expanded-player"
            initial={{ y: "100%", opacity: 0.7 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.7 }}
            transition={{
              type: "spring",
              damping: 28,
              stiffness: 260,
            }}
            className="fixed inset-0 z-40 overflow-y-auto bg-ink font-sans text-cream"
            style={{ isolation: "isolate" }}
          >
            {/* Fondo ambiental dinámico */}
            <AmbientBackground track={t} expanded />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink/30" />

            <div className="relative mx-auto flex min-h-full max-w-md flex-col gap-6 px-6 pb-10 pt-6">
              {/* Cerrar */}
              <button
                type="button"
                aria-label="Cerrar reproductor"
                onClick={() => setOpen(false)}
                className="puffy grid size-12 place-items-center self-start rounded-full border border-white/[0.08] bg-white/[0.07] backdrop-blur-xl transition hover:bg-white/[0.12] active:scale-95"
              >
                <ChevronDown />
              </button>

              {/* Portada y vinilo */}
              <div className="py-2">
                <Vinyl t={t} playing={playing} />
              </div>

              {/* Título y artista */}
              <div className="min-w-0">
                <motion.h2
                  key={`title-${t.id}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="break-words text-3xl font-black tracking-tight drop-shadow-sm"
                >
                  {t.title ?? "Sin título"}
                </motion.h2>

                <p className="mt-1 break-words text-lg text-cream/70">
                  {artistName}
                </p>
              </div>

              {/* Progreso */}
              <div>
                <input
                  type="range"
                  min={0}
                  max={dur || 1}
                  step={0.1}
                  value={Math.min(pos, dur || 1)}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="w-full cursor-pointer accent-[#f1e7d3]"
                  aria-label="Progreso de reproducción"
                />

                <div className="flex justify-between text-sm text-cream/60">
                  <span>{fmt(pos)}</span>
                  <span>{fmt(dur)}</span>
                </div>
              </div>

              {/* Controles */}
              <div className="flex items-center justify-center gap-5 py-1">
                <button
                  type="button"
                  aria-label="Canción anterior"
                  onClick={prev}
                  className="puffy grid size-16 place-items-center rounded-full border border-white/[0.06] bg-white/[0.07] backdrop-blur-xl transition hover:bg-white/[0.12] active:scale-90"
                >
                  <SkipBack fill="currentColor" />
                </button>

                <button
                  type="button"
                  aria-label={playing ? "Pausar" : "Reproducir"}
                  onClick={toggle}
                  className="puffy grid size-24 place-items-center rounded-full bg-cream text-ink shadow-xl shadow-black/20 transition hover:scale-105 active:scale-90"
                >
                  <PlayIcon fill="currentColor" size={38} />
                </button>

                <button
                  type="button"
                  aria-label="Siguiente canción"
                  onClick={next}
                  className="puffy grid size-16 place-items-center rounded-full border border-white/[0.06] bg-white/[0.07] backdrop-blur-xl transition hover:bg-white/[0.12] active:scale-90"
                >
                  <SkipForward fill="currentColor" />
                </button>
              </div>

              {/* Letra */}
              <section className="puffy rounded-[2rem] border border-white/[0.07] bg-white/[0.055] p-5 shadow-xl shadow-black/10 backdrop-blur-xl">
                <h3 className="mb-3 text-sm font-extrabold text-sand">
                  Letra
                </h3>

                <p className="max-h-56 overflow-y-auto whitespace-pre-line text-lg font-bold leading-relaxed">
                  {t.lyrics || "Todavía no hay letra para esta canción."}
                </p>
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
