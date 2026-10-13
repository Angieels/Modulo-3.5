import { useCallback, useEffect, useState } from 'react'
import { Heart, Disc3, Play, Music2 } from 'lucide-react'
import { supabase } from '../supabase'
import { usePlayer } from '../store/usePlayer'
import LikeButton from '../components/LikeButton'

export default function Library() {
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const play = usePlayer((s) => s.play)

  const loadFavorites = useCallback(async () => {
    setLoading(true)

    const { data: { user }, error: authError } =
      await supabase.auth.getUser()

    if (authError) {
      console.error(authError)
    }

    setUser(user ?? null)

    if (!user) {
      setTracks([])
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('likes')
      .select(`
        created_at,
        track:tracks (
          id,
          title,
          audio_path,
          cover_path,
          plays_count,
          artist:artists (stage_name)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error cargando Me gustan:', error)
      setTracks([])
      setLoading(false)
      return
    }

    const formatted = (data ?? [])
      .filter((item) => item.track)
      .map(({ track }) => {
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
          artist: track.artist?.stage_name || 'Artista independiente',
        }
      })

    setTracks(formatted)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  return (
    <section className="space-y-7 pb-8">
      <header className="flex items-center gap-4">
        <div className="puffy grid size-20 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-amber-300 to-amber-700 text-ink shadow-xl">
          <Heart size={35} fill="currentColor" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
            Tu colección
          </p>
          <h1 className="text-3xl font-black text-cream md:text-4xl">
            Me gustan
          </h1>
          <p className="mt-1 text-sm text-cream/50">
            {tracks.length} canciones guardadas
          </p>
        </div>
      </header>

      {!user && !loading && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center">
          <Heart className="mx-auto mb-3 text-amber-400" size={32} />
          <h2 className="font-bold">Tu música favorita te espera</h2>
          <p className="mt-2 text-sm text-cream/60">
            Inicia sesión para guardar canciones y escucharlas aquí.
          </p>
        </div>
      )}

      {loading && (
        <p className="py-10 text-center text-sm text-cream/50">
          Cargando tus canciones...
        </p>
      )}

      {!loading && user && tracks.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <Music2 className="mx-auto mb-3 text-amber-400" size={32} />
          <h2 className="font-bold">Tu biblioteca está esperando</h2>
          <p className="mt-2 text-sm text-cream/60">
            Pulsa el corazón de una canción para añadirla a Me gustan.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {tracks.map((track, index) => (
          <div
            key={track.id}
            className="puffy flex min-w-0 items-center gap-3 rounded-3xl border border-white/5 bg-white/[0.03] p-3 transition hover:bg-white/[0.06]"
          >
            <span className="w-5 shrink-0 text-center text-xs text-cream/40">
              {index + 1}
            </span>

            <div className="size-14 shrink-0 overflow-hidden rounded-2xl bg-zinc-900">
              {track.cover_url ? (
                <img
                  src={track.cover_url}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <div className="grid size-full place-items-center">
                  <Disc3 className="text-amber-400" size={24} />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => play(tracks, index)}
              className="min-w-0 flex-1 text-left"
            >
              <span className="block truncate font-extrabold text-cream">
                {track.title}
              </span>
              <span className="block truncate text-sm text-cream/50">
                {track.artist}
              </span>
            </button>

            <LikeButton trackId={track.id} />

            <button
              type="button"
              onClick={() => play(tracks, index)}
              aria-label={`Reproducir ${track.title}`}
              className="grid size-10 shrink-0 place-items-center rounded-full bg-cream text-ink transition hover:scale-105 active:scale-90"
            >
              <Play size={17} fill="currentColor" />
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}