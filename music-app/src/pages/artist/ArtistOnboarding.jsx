import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";
import { useArtist } from "../../context/ArtistContext.jsx";
import {
  Field,
  GenreSelect,
  Msg,
  btn,
  card,
  input,
  useAction,
} from "./ui.jsx";

const social = [
  ["instagram", "Instagram", "@tuartista"],
  ["tiktok", "TikTok", "@tuartista"],
  ["youtube", "YouTube", "youtube.com/tucanal"],
];

const empty = (value) => (value ?? "").trim() || null;

export default function ArtistOnboarding() {
  const { user, artist, loading, reload } = useArtist();
  const nav = useNavigate();
  const { busy, msg, run } = useAction();

  const [f, setF] = useState({
    stage_name: "",
    genre_id: "",
    bio: "",
    instagram: "",
    tiktok: "",
    youtube: "",
    real_name: "",
    phone: "",
  });

  const set = (key) => (event) => {
    setF((previous) => ({
      ...previous,
      [key]: event.target.value,
    }));
  };

  if (loading) return null;
  if (!user) return <Navigate to="/artista" replace />;
  if (artist) return <Navigate to="/artista/panel" replace />;

  const submit = (event) => {
    event.preventDefault();

    run(async () => {
      const stageName = f.stage_name.trim();

      if (!stageName) {
        throw new Error("El nombre artístico es obligatorio.");
      }

      const { data, error } = await supabase
        .from("artists")
        .insert({
          stage_name: stageName,
          genre_id: f.genre_id ? Number(f.genre_id) : null,
          bio: empty(f.bio),
          instagram: empty(f.instagram),
          tiktok: empty(f.tiktok),
          youtube: empty(f.youtube),
        })
        .select()
        .single();

      if (error) throw error;

      if (f.real_name.trim() || f.phone.trim()) {
        const { error: privateError } = await supabase
          .from("artist_private")
          .insert({
            artist_id: data.id,
            real_name: empty(f.real_name),
            phone: empty(f.phone),
          });

        if (privateError) throw privateError;
      }

      await reload();
      nav("/artista/panel", { replace: true });
    });
  };

  return (
    <form
      onSubmit={submit}
      className={`${card} mx-auto max-w-xl space-y-4`}
    >
      <h1 className="text-2xl font-black">
        Crea tu perfil artístico
      </h1>

      <Field label="Nombre artístico *">
        <input
          className={input}
          required
          maxLength={60}
          value={f.stage_name}
          onChange={set("stage_name")}
          placeholder="¿Cómo te conoce tu público?"
        />
      </Field>

      <Field label="Género principal">
        <GenreSelect
          value={String(f.genre_id)}
          onChange={(value) =>
            setF((previous) => ({
              ...previous,
              genre_id: value,
            }))
          }
        />
      </Field>

      <Field label="Biografía">
        <textarea
          className={input}
          rows={3}
          maxLength={300}
          value={f.bio}
          onChange={set("bio")}
          placeholder="Cuéntale al público quién eres"
        />
      </Field>

      {social.map(([key, label, placeholder]) => (
        <Field key={key} label={label}>
          <input
            className={input}
            value={f[key]}
            onChange={set(key)}
            placeholder={placeholder}
          />
        </Field>
      ))}

      <div className="rounded-2xl bg-[var(--bb-soft)] p-4">
        <p className="mb-3 text-sm text-[var(--bb-muted)]">
          Información privada: estos datos no aparecen en tu perfil público.
        </p>

        <div className="space-y-3">
          <Field label="Nombre real">
            <input
              className={input}
              autoComplete="name"
              value={f.real_name}
              onChange={set("real_name")}
            />
          </Field>

          <Field label="Teléfono">
            <input
              className={input}
              type="tel"
              autoComplete="tel"
              value={f.phone}
              onChange={set("phone")}
            />
          </Field>
        </div>
      </div>

      <Msg text={msg} />

      <button className={`${btn} w-full`} disabled={busy}>
        {busy ? "Creando..." : "Crear mi perfil y entrar al panel"}
      </button>
    </form>
  );
}