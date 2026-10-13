
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Pause,
  Play,
  SkipBack,
  SkipForward,
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

// Obtiene el nombre del artista, incluso si viene como objeto de Supabase.
function getArtistName(artist) {
  if (typeof artist === "string") {
    return artist || "Artista sin nombre";
  }

  if (artist && typeof artist === "object") {
    return artist.stage_name ?? "Artista sin nombre";
  }

  return "Artista sin nombre";
}

// Disco de vinilo.
function Vinyl({ t, playing }) {
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
        style={{ boxShadow: "0 20px 40px -12px rgb(0 0 0 / .8)" }}
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
            style={{ background: t.cover || "#493326" }}
          />
          <div className="absolute inset-[47.5%] rounded-full bg-ink" />
        </div>
      </div>

      {/* Portada */}
      <div
        className="puffy absolute left-0 top-1/2 z-10 aspect-square w-[64%] -translate-y-1/2 rounded-[1.75rem]"
        style={{
          background:
            t.cover ||
            "linear-gradient(135deg, #60432E, #292019, #17120F)",
        }}
      />

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

  // CORRECCIÓN: t.artist puede ser texto u objeto.
  const artistName = getArtistName(t.artist ?? t.artistName);

  return (
    <>
      {/* Mini reproductor */}
      <div
        onClick={() => setOpen(true)}
        className="puffy fixed inset-x-3 bottom-24 z-30 flex cursor-pointer items-center gap-3 rounded-[2rem] bg-surface/90 p-2.5 pr-3 text-cream backdrop-blur-xl md:bottom-4 md:left-[17rem] md:right-6"
      >
        {/* Mini vinilo */}
        <div
          className="vinyl-spin puffy relative size-14 shrink-0 rounded-full"
          style={{
            ...spin(playing),
            background:
              t.cover ||
              "linear-gradient(135deg, #60432E, #292019, #17120F)",
          }}
        >
          <div className="absolute inset-[42%] rounded-full bg-ink" />
        </div>

        {/* Información de la canción */}
        <div className="min-w-0 flex-1">
          <p className="truncate font-extrabold">
            {t.title ?? "Sin título"}
          </p>

          <p className="truncate text-sm text-cream/60">
            {artistName}
          </p>
        </div>

        {/* Play / pausa */}
        <button
          type="button"
          aria-label={playing ? "Pausar" : "Reproducir"}
          onClick={(e) => {
            e.stopPropagation();
            toggle();
          }}
          className="puffy grid size-12 shrink-0 place-items-center rounded-full bg-cream text-ink transition active:scale-90"
        >
          <PlayIcon fill="currentColor" size={22} />
        </button>

        {/* Barra de progreso */}
        <div className="absolute inset-x-8 bottom-1 h-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-cream transition-[width]"
            style={{
              width: `${dur > 0 ? Math.min((pos / dur) * 100, 100) : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Reproductor ampliado */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed inset-0 z-40 overflow-y-auto bg-ink font-sans text-cream"
          >
            {/* Fondo ambiental */}
            <div
              className="pointer-events-none absolute inset-0 opacity-30 blur-3xl"
              style={{
                background:
                  t.cover || "linear-gradient(135deg, #60432E, #17120F)",
              }}
            />

            <div className="relative mx-auto flex min-h-full max-w-md flex-col gap-6 p-6 pb-10">
              <button
                type="button"
                aria-label="Cerrar reproductor"
                onClick={() => setOpen(false)}
                className="puffy grid size-12 place-items-center self-start rounded-full bg-surface/80"
              >
                <ChevronDown />
              </button>

              <Vinyl t={t} playing={playing} />

              {/* Título y artista */}
              <div>
                <h2 className="break-words text-3xl font-black">
                  {t.title ?? "Sin título"}
                </h2>

                <p className="mt-1 break-words text-lg text-cream/70">
                  {artistName}
                </p>
              </div>

              {/* Progreso de reproducción */}
              <div>
                <input
                  type="range"
                  min={0}
                  max={dur || 1}
                  step={0.1}
                  value={Math.min(pos, dur || 1)}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="w-full accent-[#f1e7d3]"
                  aria-label="Progreso de reproducción"
                />

                <div className="flex justify-between text-sm text-cream/60">
                  <span>{fmt(pos)}</span>
                  <span>{fmt(dur)}</span>
                </div>
              </div>

              {/* Controles */}
              <div className="flex items-center justify-center gap-5">
                <button
                  type="button"
                  aria-label="Canción anterior"
                  onClick={prev}
                  className="puffy grid size-16 place-items-center rounded-full bg-surface transition active:scale-90"
                >
                  <SkipBack fill="currentColor" />
                </button>

                <button
                  type="button"
                  aria-label={playing ? "Pausar" : "Reproducir"}
                  onClick={toggle}
                  className="puffy grid size-24 place-items-center rounded-full bg-cream text-ink transition active:scale-90"
                >
                  <PlayIcon fill="currentColor" size={38} />
                </button>

                <button
                  type="button"
                  aria-label="Siguiente canción"
                  onClick={next}
                  className="puffy grid size-16 place-items-center rounded-full bg-surface transition active:scale-90"
                >
                  <SkipForward fill="currentColor" />
                </button>
              </div>

              {/* Letra */}
              <section className="puffy rounded-[2rem] bg-surface/80 p-5">
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
