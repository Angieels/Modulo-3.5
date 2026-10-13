import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { supabase } from '../supabase'

export default function LikeButton({
  trackId,
  className = '',
  onChange,
}) {
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    let alive = true

    async function loadLike() {
      setLoading(true)

      const { data: { user }, error: authError } =
        await supabase.auth.getUser()

      if (authError) {
        console.error('Error de sesión:', authError)
      }

      if (!alive) return

      setUserId(user?.id ?? null)

      if (!user || !trackId) {
        setLiked(false)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('likes')
        .select('track_id')
        .eq('user_id', user.id)
        .eq('track_id', trackId)
        .maybeSingle()

      if (error) {
        console.error('Error al consultar favorito:', error)
      }

      if (alive) {
        setLiked(Boolean(data))
        setLoading(false)
      }
    }

    loadLike()

    return () => {
      alive = false
    }
  }, [trackId])

  async function toggleLike(event) {
    event?.stopPropagation()

    if (busy || loading) return

    if (!userId) {
      alert('Inicia sesión para guardar canciones en Me gustan.')
      return
    }

    setBusy(true)

    try {
      if (liked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', userId)
          .eq('track_id', trackId)

        if (error) throw error

        setLiked(false)
        onChange?.(trackId, false)
      } else {
        const { error } = await supabase
          .from('likes')
          .insert({
            user_id: userId,
            track_id: trackId,
          })

        if (error) throw error

        setLiked(true)
        onChange?.(trackId, true)
      }
    } catch (error) {
      console.error('No se pudo actualizar el favorito:', error)
      alert('No se pudo guardar el cambio. Inténtalo de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={toggleLike}
      disabled={loading || busy || !trackId}
      aria-label={liked ? 'Quitar de Me gustan' : 'Añadir a Me gustan'}
      aria-pressed={liked}
      title={liked ? 'Quitar de Me gustan' : 'Añadir a Me gustan'}
      className={`grid size-11 shrink-0 place-items-center rounded-full
        text-amber-400 transition hover:bg-white/10
        active:scale-90 disabled:opacity-50 ${className}`}
    >
      <Heart
        size={21}
        fill={liked ? 'currentColor' : 'none'}
        strokeWidth={liked ? 2.5 : 1.8}
      />
    </button>
  )
}