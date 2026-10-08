import { AnimatePresence, motion } from 'framer-motion'
import {ChevronDown, Pause, Play, SkipBack, SkipForward} from "lucide-react";
import {usePlayer} from '../store/usePlayer.js';

const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
 
export default function Player() {
  const { queue, index, playing, pos, dur, open, toggle, next, prev, seek, setOpen } = usePlayer()
  const t = queue[index]
  if (!t) return null
  const PlayIcon = playing ? Pause : Play
 
  return (
    <>
      {/* Mini reproductor: píldora flotante sobre la barra de pestañas */}
      <div onClick={() => setOpen(true)}
        className="puffy fixed inset-x-3 bottom-24 z-20 flex cursor-pointer items-center gap-3 rounded-[2rem] bg-wine/90 p-2.5 pr-3 backdrop-blur-xl md:bottom-4 md:left-[17rem] md:right-6">
        <div className="puffy size-14 shrink-0 rounded-2xl" style={{ background: t.cover }} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-extrabold">{t.title}</p>
          <p className="truncate text-sm text-cream/60">{t.artist}</p>
        </div>
        <button aria-label={playing ? 'Pausar' : 'Reproducir'}
          onClick={(e) => { e.stopPropagation(); toggle() }}
          className="puffy grid size-12 place-items-center rounded-full bg-gold text-ink transition active:scale-90">
          <PlayIcon fill="currentColor" size={22} />
        </button>
        <div className="absolute inset-x-8 bottom-1 h-1 rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gold" style={{ width: `${dur ? (pos / dur) * 100 : 0}%` }} />
        </div>
      </div>
 
      {/* Reproductor completo: hoja que sube desde abajo */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed inset-0 z-40 overflow-y-auto bg-ink font-sans text-cream">
            <div className="absolute inset-0 opacity-40 blur-3xl" style={{ background: t.cover }} />
            <div className="relative mx-auto flex min-h-full max-w-md flex-col gap-6 p-6 pb-10">
              <button aria-label="Cerrar" onClick={() => setOpen(false)}
                className="puffy grid size-12 place-items-center self-start rounded-full bg-wine/80">
                <ChevronDown />
              </button>
              <div className="puffy aspect-square w-full rounded-[3rem]" style={{ background: t.cover }} />
              <div>
                <h2 className="text-3xl font-black">{t.title}</h2>
                <p className="text-lg text-cream/70">{t.artist}</p>
              </div>
              <div>
                <input type="range" min={0} max={dur || 1} step={0.1} value={pos}
                  onChange={(e) => seek(+e.target.value)} className="w-full accent-[#f4c97a]" aria-label="Progreso" />
                <div className="flex justify-between text-sm text-cream/60"><span>{fmt(pos)}</span><span>{fmt(dur)}</span></div>
              </div>
              <div className="flex items-center justify-center gap-5">
                <button aria-label="Anterior" onClick={prev} className="puffy grid size-16 place-items-center rounded-full bg-wine transition active:scale-90"><SkipBack fill="currentColor" /></button>
                <button aria-label={playing ? 'Pausar' : 'Reproducir'} onClick={toggle} className="puffy grid size-24 place-items-center rounded-full bg-gold text-ink transition active:scale-90"><PlayIcon fill="currentColor" size={38} /></button>
                <button aria-label="Siguiente" onClick={next} className="puffy grid size-16 place-items-center rounded-full bg-wine transition active:scale-90"><SkipForward fill="currentColor" /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}