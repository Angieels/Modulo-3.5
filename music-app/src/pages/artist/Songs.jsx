
import { useCallback, useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  FileAudio,
  Music2,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";

import { supabase } from "../../supabase";
import { useArtist } from "../../context/ArtistContext.jsx";
import {
  Empty,
  Field,
  GenreSelect,
  Msg,
  PageTitle,
  audioDuration,
  btn,
  card,
  checkImage,
  ghost,
  input,
  publicUrl,
  uploadFile,
  useAction,
} from "./ui.jsx";

const blank = {
  title: "",
  genre_id: "",
  album_id: "",
  lyrics: "",
  is_public: true,
};

const AUDIO_TYPES = ["audio/mpeg", "audio/mp4", "audio/wav"];

export default function Songs() {
  const { user, artist } = useArtist();
  const { busy, msg, run } = useAction();

  const [tracks, setTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [f, setF] = useState(blank);
  const [audio, setAudio] = useState(null);
  const [cover, setCover] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const set = (key) => (event) => {
    setF((previous) => ({ ...previous, [key]: event.target.value }));
  };

  const load = useCallback(async () => {
    setLoadError("");

    const [tracksResult, albumsResult] = await Promise.all([
      supabase
        .from("tracks")
        .select("id, title, audio_path, cover_path, plays_count, likes_count, is_public, created_at")
        .eq("artist_id", artist.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("albums")
        .select("id, title")
        .eq("artist_id", artist.id)
        .order("title"),
    ]);

    if (tracksResult.error || albumsResult.error) {
      setLoadError(
        tracksResult.error?.message ||
        albumsResult.error?.message ||
        "No se pudieron cargar tus canciones."
      );
      setLoading(false);
      return;
    }

    setTracks(tracksResult.data ?? []);
    setAlbums(albumsResult.data ?? []);
    setLoading(false);
  }, [artist.id]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const submit = (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;

    run(async () => {
      if (!audio) {
        throw new Error("Selecciona el archivo de audio.");
      }

      if (!AUDIO_TYPES.includes(audio.type)) {
        throw new Error("El audio debe ser MP3, M4A o WAV.");
      }

      if (audio.size > 15 * 1024 * 1024) {
        throw new Error("El audio pesa más de 15 MB.");
      }

      if (!f.title.trim()) {
        throw new Error("El título de la canción es obligatorio.");
      }

      if (cover) checkImage(cover);

      const audioPath = await uploadFile("audio", user.id, audio);
      const coverPath = cover
        ? await uploadFile("covers", user.id, cover)
        : null;

      const duration = await audioDuration(audio);

      const { error } = await supabase.from("tracks").insert({
        artist_id: artist.id,
        album_id: f.album_id || null,
        title: f.title.trim(),
        genre_id: f.genre_id ? Number(f.genre_id) : null,
        audio_path: audioPath,
        cover_path: coverPath,
        duration_seconds: duration,
        is_public: f.is_public,
        lyrics: f.lyrics.trim() || null,
      });

      if (error) {
        // Evita dejar archivos huérfanos si la inserción de la canción falla.
        await supabase.storage.from("audio").remove([audioPath]);
        if (coverPath) {
          await supabase.storage.from("covers").remove([coverPath]);
        }
        throw error;
      }

      setF(blank);
      setAudio(null);
      setCover(null);
      setShowForm(false);
      formElement.reset();

      await load();
    }, "¡Canción subida correctamente! 🎶");
  };

  const toggle = (track) => {
    run(async () => {
      const { error } = await supabase
        .from("tracks")
        .update({ is_public: !track.is_public })
        .eq("id", track.id)
        .eq("artist_id", artist.id);

      if (error) throw error;

      await load();
    }, "Visibilidad actualizada.");
  };

  const remove = (track) => {
    if (
      !window.confirm(
        `¿Borrar "${track.title}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    run(async () => {
      const { error } = await supabase
        .from("tracks")
        .delete()
        .eq("id", track.id)
        .eq("artist_id", artist.id);

      if (error) throw error;

      // Los archivos se eliminan después de borrar el registro.
      await supabase.storage.from("audio").remove([track.audio_path]);

      if (track.cover_path) {
        await supabase.storage.from("covers").remove([track.cover_path]);
      }

      await load();
    }, "Canción eliminada.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageTitle
          title="Mis canciones"
          text="Administra tu catálogo musical y comparte tus mejores temas."
        />

        <button
          type="button"
          className={btn}
          onClick={() => setShowForm((value) => !value)}
        >
          <Plus size={18} />
          {showForm ? "Cerrar formulario" : "Subir canción"}
        </button>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className={`${card} !p-4`}>
          <p className="text-xs font-bold text-[var(--bb-muted)]">Canciones</p>
          <p className="mt-1 text-2xl font-black">{tracks.length}</p>
        </div>
        <div className={`${card} !p-4`}>
          <p className="text-xs font-bold text-[var(--bb-muted)]">Públicas</p>
          <p className="mt-1 text-2xl font-black">
            {tracks.filter((track) => track.is_public).length}
          </p>
        </div>
        <div className={`${card} col-span-2 !p-4 sm:col-span-1`}>
          <p className="text-xs font-bold text-[var(--bb-muted)]">Reproducciones</p>
          <p className="mt-1 text-2xl font-black">
            {tracks
              .reduce((total, track) => total + Number(track.plays_count || 0), 0)
              .toLocaleString("es-SV")}
          </p>
        </div>
      </section>

      {showForm && (
        <form onSubmit={submit} className={`${card} space-y-5`}>
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--bb-soft)] text-[var(--bb-accent)]">
              <Upload size={22} />
            </span>
            <div>
              <h2 className="text-lg font-black">Subir nueva canción</h2>
              <p className="mt-1 text-sm text-[var(--bb-muted)]">
                Audio de hasta 15 MB en formato MP3, M4A o WAV.
              </p>
            </div>
          </div>

          <Field label="Título de la canción *">
            <input
              className={input}
              required
              maxLength={150}
              value={f.title}
              onChange={set("title")}
              placeholder="Nombre de tu canción"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Género musical">
              <GenreSelect
                value={f.genre_id}
                onChange={(value) =>
                  setF((previous) => ({ ...previous, genre_id: value }))
                }
              />
            </Field>

            <Field label="Álbum">
              <select
                className={input}
                value={f.album_id}
                onChange={set("album_id")}
              >
                <option value="">Sencillo (sin álbum)</option>
                {albums.map((album) => (
                  <option key={album.id} value={album.id}>
                    {album.title}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Archivo de audio *">
              <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--bb-border)] bg-[var(--bb-soft)] p-4 text-center transition hover:brightness-95">
                <FileAudio size={27} className="text-[var(--bb-accent)]" />
                <span className="break-all text-sm font-bold">
                  {audio?.name || "Elegir archivo de audio"}
                </span>
                <span className="text-xs text-[var(--bb-muted)]">
                  MP3, M4A o WAV · Máximo 15 MB
                </span>
                <input
                  type="file"
                  required={!audio}
                  accept=".mp3,.m4a,.wav,audio/mpeg,audio/mp4,audio/wav"
                  className="sr-only"
                  onChange={(event) =>
                    setAudio(event.target.files?.[0] ?? null)
                  }
                />
              </label>
            </Field>

            <Field label="Portada (opcional)">
              <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--bb-border)] bg-[var(--bb-soft)] p-4 text-center transition hover:brightness-95">
                <Music2 size={27} className="text-[var(--bb-accent)]" />
                <span className="break-all text-sm font-bold">
                  {cover?.name || "Elegir portada"}
                </span>
                <span className="text-xs text-[var(--bb-muted)]">
                  JPG, PNG o WEBP · Máximo 5 MB
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(event) =>
                    setCover(event.target.files?.[0] ?? null)
                  }
                />
              </label>
            </Field>
          </div>

          <Field label="Letra (opcional)">
            <textarea
              className={`${input} min-h-28 resize-y`}
              rows={4}
              maxLength={10000}
              value={f.lyrics}
              onChange={set("lyrics")}
              placeholder="Escribe la letra si es tuya o tienes permiso para publicarla..."
            />
          </Field>

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-[var(--bb-soft)] p-4">
            <input
              type="checkbox"
              className="mt-1 size-4 accent-[var(--bb-accent)]"
              checked={f.is_public}
              onChange={(event) =>
                setF((previous) => ({
                  ...previous,
                  is_public: event.target.checked,
                }))
              }
            />
            <span>
              <span className="block text-sm font-bold">Canción pública</span>
              <span className="mt-1 block text-xs text-[var(--bb-muted)]">
                Si la activas, tu canción podrá mostrarse públicamente según
                las reglas de visibilidad de BeatBoard.
              </span>
            </span>
          </label>

          <Msg text={msg} />

          <div className="flex flex-wrap gap-3">
            <button className={btn} disabled={busy}>
              <Upload size={18} />
              {busy ? "Subiendo canción..." : "Guardar canción"}
            </button>
            <button
              type="button"
              className={ghost}
              disabled={busy}
              onClick={() => {
                setShowForm(false);
                setF(blank);
                setAudio(null);
                setCover(null);
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-black">Tu catálogo</h2>
          <p className="mt-1 text-sm text-[var(--bb-muted)]">
            {tracks.length} {tracks.length === 1 ? "canción registrada" : "canciones registradas"}
          </p>
        </div>

        {loading ? (
          <div className={`${card} text-sm text-[var(--bb-muted)]`}>
            Cargando tu catálogo...
          </div>
        ) : loadError ? (
          <div className={`${card} space-y-3`}>
            <p className="text-sm text-[var(--bb-muted)]">{loadError}</p>
            <button
              className={ghost}
              onClick={() => {
                setLoading(true);
                load();
              }}
            >
              Volver a intentar
            </button>
          </div>
        ) : tracks.length === 0 ? (
          <Empty>
            Todavía no tienes canciones. Sube tu primer tema para comenzar a crear tu catálogo.
          </Empty>
        ) : (
          <ul className="grid gap-3 xl:grid-cols-2">
            {tracks.map((track) => (
              <li
                key={track.id}
                className={`${card} flex min-w-0 items-center gap-3 !p-3 sm:gap-4 sm:!p-4`}
              >
                {track.cover_path ? (
                  <img
                    src={publicUrl("covers", track.cover_path)}
                    alt={`Portada de ${track.title}`}
                    loading="lazy"
                    className="size-16 shrink-0 rounded-2xl object-cover sm:size-20"
                  />
                ) : (
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--bb-soft)] text-[var(--bb-accent)] sm:size-20">
                    <Music2 size={26} />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate font-black">{track.title}</p>
                  <p className="mt-1 text-xs text-[var(--bb-muted)]">
                    {Number(track.plays_count || 0).toLocaleString("es-SV")} reproducciones
                  </p>
                  <p className="mt-1 text-xs text-[var(--bb-muted)]">
                    {Number(track.likes_count || 0).toLocaleString("es-SV")} me gusta
                  </p>
                  <span className="mt-2 inline-flex rounded-full bg-[var(--bb-soft)] px-2.5 py-1 text-xs font-bold">
                    {track.is_public ? "Pública" : "Privada"}
                  </span>
                </div>

                <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    aria-label={track.is_public ? "Hacer privada" : "Hacer pública"}
                    title={track.is_public ? "Hacer privada" : "Hacer pública"}
                    className={`${ghost} !p-2.5`}
                    disabled={busy}
                    onClick={() => toggle(track)}
                  >
                    {track.is_public ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>

                  <button
                    type="button"
                    aria-label={`Eliminar ${track.title}`}
                    title="Eliminar canción"
                    className={`${ghost} !p-2.5`}
                    disabled={busy}
                    onClick={() => remove(track)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Msg text={msg} />
      </section>
    </div>
  );
}
