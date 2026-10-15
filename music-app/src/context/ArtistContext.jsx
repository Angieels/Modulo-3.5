import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase";

const Ctx = createContext(null);
export const useArtist = () => useContext(Ctx);

// Carga el usuario y su perfil de artista (si ya creó uno)
export function ArtistProvider({ children }) {
  const [state, setState] = useState({ user: null, artist: null, loading: true });

  const reload = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user ?? null;
    let artist = null;
    if (user) {
      const { data } = await supabase.from("artists").select("*")
        .eq("owner_id", user.id).order("created_at").limit(1).maybeSingle();
      artist = data;
    }
    setState({ user, artist, loading: false });
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return <Ctx.Provider value={{ ...state, reload }}>{children}</Ctx.Provider>;
}