import {Play} from 'lucide-react'
import {tracks} from '../data/tracks.jsx'
import {usePlayer} from '../store/usePlayer.js'

export default function Home() {
  const play = usePlayer((s) => s.play)
  const hero = tracks[0]
 
  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-black md:text-4xl">Suena hoy</h1>
 
      <button onClick={() => play(tracks, 0)}
        className="puffy relative flex h-56 w-full items-end overflow-hidden rounded-[2.5rem] p-6 text-left transition active:scale-[.98] md:h-72"
        style={{ background: hero.cover }}>
        <div>
          <p className="text-3xl font-black md:text-5xl">{hero.title}</p>
          <p className="mt-1 text-lg text-white/80">{hero.artist}</p>
        </div>
        <span className="puffy absolute bottom-5 right-5 grid size-16 place-items-center rounded-full bg-gold text-ink">
          <Play fill="currentColor" />
        </span>
      </button>
 
      <section>
        <h2 className="mb-4 text-xl font-extrabold">Hits de la semana</h2>
        <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:px-0">
          {tracks.map((t, i) => (
            <button key={t.id} onClick={() => play(tracks, i)}
              className="w-40 shrink-0 snap-start text-left transition active:scale-95 md:w-48">
              <div className="puffy aspect-square rounded-[2rem]" style={{ background: t.cover }} />
              <p className="mt-3 truncate font-extrabold">{t.title}</p>
              <p className="truncate text-sm text-cream/60">{t.artist}</p>
            </button>
          ))}
        </div>
      </section>
 
      <section>
        <h2 className="mb-4 text-xl font-extrabold">Lo más escuchado</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {tracks.map((t, i) => (
            <button key={t.id} onClick={() => play(tracks, i)}
              className="puffy flex items-center gap-3 rounded-3xl bg-wine/60 p-3 text-left transition active:scale-[.98]">
              <div className="puffy size-14 shrink-0 rounded-2xl" style={{ background: t.cover }} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-extrabold">{t.title}</p>
                <p className="truncate text-sm text-cream/60">{t.artist}</p>
              </div>
              <span className="pr-2 text-sm font-bold text-gold">{t.plays}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}