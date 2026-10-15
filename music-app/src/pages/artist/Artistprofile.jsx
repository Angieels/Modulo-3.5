
import { useEffect, useState } from "react";
import { Camera, ImagePlus, Music2, Save, UserRound } from "lucide-react";

import { supabase } from "../../supabase";
import { useArtist } from "../../context/ArtistContext.jsx";
import {
  Field,
  GenreSelect,
  Msg,
  PageTitle,
  btn,
  card,
  checkImage,
  input,
  publicUrl,
  uploadFile,
  useAction,
} from "./ui.jsx";

function InstagramIcon({ size = 18, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const social = [
  { key: "instagram", label: "Instagram", icon: InstagramIcon, placeholder: "Tu usuario o enlace" },
  { key: "tiktok", label: "TikTok", icon: Music2, placeholder: "Tu usuario o enlace" },
  { key: "youtube", label: "YouTube", icon: Music2, placeholder: "Tu canal o enlace" },
];

const empty = (value) => (value ?? "").trim() || null;

export default function ArtistProfile() {
  const { user, artist, reload } = useArtist();
  const { busy, msg, run } = useAction();

  const [f, setF] = useState({
    stage_name: artist.stage_name ?? "",
    genre_id: artist.genre_id ?? "",
    bio: artist.bio ?? "",
    instagram: artist.instagram ?? "",
    tiktok: artist.tiktok ?? "",
    youtube: artist.youtube ?? "",
    real_name: "",
    phone: "",
  });

  const [avatar, setAvatar] = useState(null);
  const [cover, setCover] = useState(null);

  const set = (key) => (event) => {
    setF((previous) => ({ ...previous, [key]: event.target.value }));
  };

  useEffect(() => {
    let active = true;

    setF({
      stage_name: artist.stage_name ?? "",
      genre_id: artist.genre_id ?? "",
      bio: artist.bio ?? "",
      instagram: artist.instagram ?? "",
      tiktok: artist.tiktok ?? "",
      youtube: artist.youtube ?? "",
      real_name: "",
      phone: "",
    });

    setAvatar(null);
    setCover(null);

    async function loadPrivateInfo() {
      const { data, error } = await supabase
        .from("artist_private")
        .select("real_name, phone")
        .eq("artist_id", artist.id)
        .maybeSingle();

      if (active && !error && data) {
        setF((previous) => ({
          ...previous,
          real_name: data.real_name ?? "",
          phone: data.phone ?? "",
        }));
      }
    }

    loadPrivateInfo();

    return () => {
      active = false;
    };
  }, [artist.id]);

  const save = (event) => {
    event.preventDefault();

    run(async () => {
      const patch = {
        stage_name: f.stage_name.trim(),
        genre_id: f.genre_id ? Number(f.genre_id) : null,
        bio: empty(f.bio),
        instagram: empty(f.instagram),
        tiktok: empty(f.tiktok),
        youtube: empty(f.youtube),
      };

      if (!patch.stage_name) {
        throw new Error("El nombre artístico es obligatorio.");
      }

      if (avatar) {
        checkImage(avatar);
        const path = await uploadFile("avatars", user.id, avatar);
        patch.avatar_url = publicUrl("avatars", path);
      }

      if (cover) {
        checkImage(cover);
        const path = await uploadFile("covers", user.id, cover);
        patch.cover_url = publicUrl("covers", path);
      }

      const { error } = await supabase
        .from("artists")
        .update(patch)
        .eq("id", artist.id);

      if (error) throw error;

      const { error: privateError } = await supabase
        .from("artist_private")
        .upsert({
          artist_id: artist.id,
          real_name: empty(f.real_name),
          phone: empty(f.phone),
        });

      if (privateError) throw privateError;

      setAvatar(null);
      setCover(null);
      await reload();
    }, "¡Perfil actualizado correctamente! ✨");
  };

  return (
    <div className="space-y-6">
      <PageTitle
        title="Mi perfil artístico"
        text="Dale personalidad a tu espacio y comparte tu música con el mundo."
      />

      <form onSubmit={save} className="space-y-6">
        <section className={`${card} space-y-5`}>
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--bb-soft)] text-[var(--bb-accent)]">
              <UserRound size={22} />
            </span>
            <div>
              <h3 className="font-black">Información pública</h3>
              <p className="mt-1 text-sm text-[var(--bb-muted)]">
                Estos datos podrán aparecer en tu perfil artístico.
              </p>
            </div>
          </div>

          <Field label="Nombre artístico *">
            <input
              className={input}
              required
              maxLength={100}
              value={f.stage_name}
              onChange={set("stage_name")}
              placeholder="¿Cómo te conoce tu público?"
            />
          </Field>

          <Field label="Género musical">
            <GenreSelect
              value={String(f.genre_id ?? "")}
              onChange={(value) =>
                setF((previous) => ({ ...previous, genre_id: value }))
              }
            />
          </Field>

          <Field label="Biografía">
            <textarea
              className={`${input} min-h-28 resize-y`}
              rows={4}
              maxLength={300}
              value={f.bio}
              onChange={set("bio")}
              placeholder="Cuéntale al público tu historia, tu estilo y tu música..."
            />
            <p className="mt-1 text-right text-xs text-[var(--bb-muted)]">
              {f.bio.length}/300 caracteres
            </p>
          </Field>
        </section>

        <section className={`${card} space-y-5`}>
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--bb-soft)] text-[var(--bb-accent)]">
              <Camera size={22} />
            </span>
            <div>
              <h3 className="font-black">Imágenes del perfil</h3>
              <p className="mt-1 text-sm text-[var(--bb-muted)]">
                Usa imágenes JPG, PNG o WEBP de hasta 5 MB.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Foto de perfil">
              <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--bb-border)] bg-[var(--bb-soft)] p-4 text-center transition hover:brightness-95">
                <Camera size={24} className="text-[var(--bb-accent)]" />
                <span className="text-sm font-bold">
                  {avatar?.name || "Elegir fotografía"}
                </span>
                <span className="text-xs text-[var(--bb-muted)]">JPG, PNG o WEBP</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(event) => setAvatar(event.target.files?.[0] ?? null)}
                />
              </label>
            </Field>

            <Field label="Imagen de portada">
              <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--bb-border)] bg-[var(--bb-soft)] p-4 text-center transition hover:brightness-95">
                <ImagePlus size={24} className="text-[var(--bb-accent)]" />
                <span className="text-sm font-bold">
                  {cover?.name || "Elegir portada"}
                </span>
                <span className="text-xs text-[var(--bb-muted)]">JPG, PNG o WEBP</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(event) => setCover(event.target.files?.[0] ?? null)}
                />
              </label>
            </Field>
          </div>
        </section>

        <section className={`${card} space-y-5`}>
          <div>
            <h3 className="font-black">Redes sociales</h3>
            <p className="mt-1 text-sm text-[var(--bb-muted)]">
              Invita a tu público a encontrarte en otras plataformas.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {social.map(({ key, label, icon: Icon, placeholder }) => (
              <Field key={key} label={label}>
                <div className="relative">
                  <Icon
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bb-muted)]"
                  />
                  <input
                    className={`${input} pl-10`}
                    value={f[key]}
                    onChange={set(key)}
                    placeholder={placeholder}
                  />
                </div>
              </Field>
            ))}
          </div>
        </section>

        <section className={`${card} space-y-5`}>
          <div>
            <h3 className="font-black">Información privada</h3>
            <p className="mt-1 text-sm text-[var(--bb-muted)]">
              Estos datos se guardan en tu registro privado y no se muestran
              como información pública del perfil.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre real">
              <input
                className={input}
                autoComplete="name"
                value={f.real_name}
                onChange={set("real_name")}
                placeholder="Tu nombre completo"
              />
            </Field>

            <Field label="Teléfono">
              <input
                className={input}
                type="tel"
                autoComplete="tel"
                value={f.phone}
                onChange={set("phone")}
                placeholder="Tu número de contacto"
              />
            </Field>
          </div>
        </section>

        <div className="space-y-3">
          <Msg text={msg} />
          <button className={`${btn} w-full sm:w-auto`} disabled={busy}>
            <Save size={18} />
            {busy ? "Guardando cambios..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
