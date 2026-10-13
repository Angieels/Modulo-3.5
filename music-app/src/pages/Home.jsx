import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Play,
  Disc3,
  ChevronLeft,
  ChevronRight,
  Music2,
} from 'lucide-react'
import { supabase } from '../supabase'
import { usePlayer } from '../store/usePlayer'
import LikeButton from '../components/LikeButton'

const CARD = 'min(68vw, 18rem)'

function Carousel({ tracks, onPlay }) {
  const ref = useRef(null)
  const [active, setActive] = useState(0)

  const update = useCallback(() => {
    const el = ref.current
    if (!el) return

    const center = el.scrollLeft + el.clientWidth / 2
    let best = 0
    let bestDistance = Infinity

    Array.from(el.children).forEach((card, i) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2
      const distance = Math.abs(cardCenter - center)
      const factor = Math.min(distance / card.offsetWidth, 1)

      card.style.transform = `scale(${1 - factor * 0.16})`
      card.style.opacity = String(1 - factor * 0.4)

      if (distance < bestDistance) {
        bestDistance = distance
        best = i
      }
    })

    setActive(best)
  }, [])

  const scrollToIndex = useCallback((index) => {
    const el = ref.current
    if (!el || index < 0 || index >= el.children.length) return

    const card = el.children[index]
    const left =
      card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2

    el.scrollTo({ left, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el || !tracks.length) return

    const frame = requestAnimationFrame(update)
    const observer = new ResizeObserver(update)

    observer.observe(el)
    window.addEventListener('resize', update)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [tracks, update])

  useEffect(() => {
    setActive(0)
    ref.current?.scrollTo({ left: 0 })
  }, [tracks])

  if (!tracks.length) {
    return (
      <div className="py-12 text-center text-cream/50">
        <Music2 className="mx-auto mb-3 text-amber-400" size={32} />
        <p>No hay canciones disponibles todavía.</p>
      </div>
    )
  }

  const track = tracks[active] ?? tracks[0]

  return (
    <div className="min-w-0">
      <div className="relative">
        <div
          ref={ref}
          onScroll={update}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            paddingInline: `max(0px, calc((100% - ${CARD}) / 2))`,
            scrollPaddingInline: `calc((100% - ${CARD}) / 2)`,
          }}
        >
          {tracks.map((item, index) => (
            <div
              key={item.id}
              className="relative shrink-0 snap-center transition-transform duration-200"
              style={{ width: CARD }}
            >
              <button
                type="button"
                onClick={() => {
                  if (index === active) onPlay(index)
                  else scrollToIndex(index)
                }}
                aria-label={`Seleccionar ${item.title}`}
                className="puffy relative aspect-square w-full overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-900 shadow-2xl"
              >
                {item.cover_url ? (
                  <img
                    src={item.cover_url}
                    alt={`Portada de ${item.title}`}
                    draggable="false"
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="grid size-full place-items-center bg-gradient-to-br from-zinc-800 to-zinc-950">
                    <Disc3 className="text-amber-500" size={48} />
                  </div>
                )}
              </button>

              <div className="absolute right-2 top-2 rounded-full bg-black/50 backdrop-blur-sm">
                <LikeButton trackId={item.id} />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          aria-label="Canción anterior"
          disabled={active === 0}
          onClick={() => scrollToIndex(active - 1)}
          className="absolute left-1 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-surface/90 text-cream shadow-lg transition hover:bg-cream hover:text-ink disabled:opacity-30 md:grid"
        >
          <ChevronLeft />
        </button>

        <button
          type="button"
          aria-label="Canción siguiente"
          disabled={active === tracks.length - 1}
          onClick={() => scrollToIndex(active + 1)}
          className="absolute right-1 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-surface/90 text-cream shadow-lg transition hover:bg-cream hover:text-ink disabled:opacity-30 md:grid"
        >
          <ChevronRight />
        </button>
      </div>

      <div className="flex min-w-0 items-center justify-between gap-3 px-1">
        <div className="min-w-0 flex-1">
          <p className="truncate text-2xl font-black text-cream">
            {track.title}
          </p>
          <p className="truncate text-cream/60">{track.artist}</p>
        </div>

        <LikeButton trackId={track.id} />

        <button
          type="button"
          onClick={() => onPlay(active)}
          aria-label={`Reproducir ${track.title}`}
          className="puffy grid size-14 shrink-0 place-items-center rounded-full bg-cream text-ink shadow-lg transition active:scale-90"
        >
          <Play fill="currentColor" />
        </button>
      </div>
    </div>
  )
}

export default function Home() {
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const play = usePlayer((s) => s.play)

  useEffect(() => {
    let alive = true

    async function loadTracks() {
      setLoading(true)
      setError('')

      try {
        const { data, error: queryError } = await supabase
          .from('tracks')
          .select(`
            id,
            title,
            audio_path,
            cover_path,
            plays_count,
            artist:artists (stage_name)
          `)

        if (queryError) throw queryError

        const formatted = (data ?? []).map((track) => {
          const { data: audio } = supabase.storage
            .from('tracks')
            .getPublicUrl(track.audio_path)

          let coverUrl = null

          if (track.cover_path) {
            const { data: cover } = supabase.storage
              .from('covers')
              .getPublicUrl(track.cover_path)

            coverUrl = cover.publicUrl
          }

          return {
            ...track,
            src: audio.publicUrl,
            cover_url: coverUrl,
            artist:
              track.artist?.stage_name || 'Artista independiente',
          }
        })

        if (alive) setTracks(formatted)
      } catch (err) {
        console.error('Error cargando canciones:', err)
        if (alive) {
          setError('No se pudieron cargar las canciones. Inténtalo de nuevo.')
        }
      } finally {
        if (alive) setLoading(false)
      }
    }

    loadTracks()

    return () => {
      alive = false
    }
  }, [])

  return (
    <section className="space-y-7 pb-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
          Tu música, tu espacio
        </p>
        <h1 className="mt-2 text-4xl font-black text-cream md:text-5xl">
          BeatBoard
        </h1>
        <p className="mt-2 text-cream/50">
          Descubre y disfruta de tu próxima canción favorita.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-extrabold text-cream">
          Música para ti
        </h2>

        {loading ? (
          <p className="py-12 text-center text-sm text-cream/50">
            Cargando música desde Supabase...
          </p>
        ) : error ? (
          <div className="rounded-2xl border border-red-400/20 p-5 text-center">
            <p className="text-sm text-red-300">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 rounded-full bg-cream px-4 py-2 text-sm font-bold text-ink"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <Carousel
            tracks={tracks}
            onPlay={(index) => play(tracks, index)}
          />
        )}
      </section>
    </section>
  )
}