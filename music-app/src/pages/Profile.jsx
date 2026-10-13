import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { UserRound, Heart, LogOut } from 'lucide-react'
import { supabase } from '../supabase'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true

    async function loadProfile() {
      const { data: { user }, error } =
        await supabase.auth.getUser()

      if (error) console.error(error)

      if (!alive) return

      setUser(user ?? null)

      if (user) {
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('username, display_name, avatar_url, role')
          .eq('id', user.id)
          .maybeSingle()

        if (profileError) console.error(profileError)
        if (alive) setProfile(data ?? null)
      }

      if (alive) setLoading(false)
    }

    loadProfile()

    return () => {
      alive = false
    }
  }, [])

  async function signOut() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('No se pudo cerrar sesión:', error)
      alert('No se pudo cerrar la sesión.')
    } else {
      setUser(null)
      setProfile(null)
    }
  }

  if (loading) {
    return <p className="py-10 text-center text-cream/50">Cargando perfil...</p>
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
          Tu espacio musical
        </p>
        <h1 className="mt-2 text-3xl font-black text-cream md:text-4xl">
          Mi perfil
        </h1>
      </header>

      <div className="puffy rounded-[2rem] border border-white/10 bg-surface p-6 sm:p-8">
        <div className="flex items-center gap-4">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              className="size-20 rounded-full border border-white/10 object-cover"
            />
          ) : (
            <div className="grid size-20 shrink-0 place-items-center rounded-full bg-cream text-ink">
              <UserRound size={34} />
            </div>
          )}

          <div className="min-w-0">
            <h2 className="truncate text-xl font-black text-cream">
              {profile?.display_name ||
                profile?.username ||
                user?.email?.split('@')[0] ||
                'Oyente'}
            </h2>
            <p className="truncate text-sm text-cream/50">
              {user?.email || 'Sesión no iniciada'}
            </p>
            {profile?.role && (
              <span className="mt-2 inline-block rounded-full bg-amber-400/10 px-3 py-1 text-xs font-bold capitalize text-amber-400">
                {profile.role}
              </span>
            )}
          </div>
        </div>

        <div className="my-6 border-t border-white/10" />

        <Link
          to="/biblioteca"
          className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-4 transition hover:bg-white/[0.08]"
        >
          <Heart className="text-amber-400" />
          <span className="flex-1 font-bold">Mi biblioteca</span>
          <span className="text-sm text-cream/50">Me gustan →</span>
        </Link>

        {user && (
          <button
            type="button"
            onClick={signOut}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 font-bold text-cream/70 transition hover:bg-white/5 hover:text-cream"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        )}
      </div>

      {!user && (
        <p className="text-sm text-cream/50">
          Inicia sesión para acceder a tus favoritos y guardar tu música.
        </p>
      )}
    </section>
  )
} 