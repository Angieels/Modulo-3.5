
import { useCallback, useEffect, useState } from "react";
import { Disc3, ImagePlus, CalendarDays, Trash2, Music2 } from "lucide-react";

import { supabase } from "../../supabase";
import { useArtist } from "../../context/ArtistContext.jsx";
import {
  Empty,
  Field,
  Msg,
  PageTitle,
  btn,
  card,
  checkImage,
  ghost,
  input,
  publicUrl,
  uploadFile,
  useAction,
} from "./ui.jsx";

const kinds = [
  ["single", "Sencillo"],
  ["ep", "EP"],
  ["album", "Álbum"],
];

const blank = {
  title: "",
  kind: "single",
  release_date: "",
};

export default function Albums() {
  const { user, artist } = useArtist();
  const { busy, msg, run } = useAction();

  const [albums, setAlbums] = useState([]);
  const [f, setF] = useState(blank);
  const [cover, setCover] = useState(null);

  const set = (key) => (event) => {
    setF((previous) => ({
      ...previous,
      [key]: event.target.value,
    }));
  };

  const load = useCallback(async () => {
    if (!artist?.id) return;

    const { data, error } = await supabase
      .from("albums")
      .select("*")
      .eq("artist_id", artist.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    setAlbums(data ?? []);
  }, [artist?.id]);

  useEffect(() => {
    load().catch((error) => {
      console.error("Error cargando álbumes:", error);
    });
  }, [load]);

  const submit = (event) => {
    event.preventDefault();

    const form = event.currentTarget;

    run(async () => {
      if (!artist?.id || !user?.id) {
        throw new Error("No encontramos tu sesión de artista.");
      }

      if (!f.title.trim()) {
        throw new Error("Escribe el título del lanzamiento.");
      }

      if (cover) checkImage(cover);

      const cover_path = cover
        ? await uploadFile("covers", user.id, cover)
        : null;

      const { error } = await supabase.from("albums").insert({
        artist_id: artist.id,
        title: f.title.trim(),
        kind: f.kind,
        release_date: f.release_date || null,
        cover_path,
      });

      if (error) throw error;

      form.reset();
      setF({ ...blank });
      setCover(null);

      await load();
    }, "¡Lanzamiento creado con éxito!");
  };

  const remove = (album) => {
    if (
      !window.confirm(
        `¿Borrar "${album.title}"? Sus canciones se quedan como sencillos.`
      )
    ) {
      return;
    }

    run(async () => {
      const { error } = await supabase
        .from("albums")
        .delete()
        .eq("id", album.id);

      if (error) throw error;

      await load();
    }, "Lanzamiento eliminado.");
  };

  const [coverPreview, setCoverPreview] = useState("");

  useEffect(() => {
    if (!cover) {
      setCoverPreview("");
      return;
    }

    const url = URL.createObjectURL(cover);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [cover]);

  return (
    <main className="min-w-0 space-y-6 pb-8 sm:space-y-8">
      <PageTitle
        title="Mis álbumes"
        text="Cada lanzamiento tiene su propio espacio. Organiza tus sencillos, EPs y álbumes."
      />

      {/* FORMULARIO */}
      <form
        onSubmit={submit}
        className={`${card} min-w-0 space-y-5 !p-4 sm:!p-6 lg:!p-7`}
      >
        <div className="flex items-start gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--bb-soft)] text-[var(--bb-accent)] sm:size-12">
            <Disc3 size={23} />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-black sm:text-xl">
              Nuevo lanzamiento
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-[var(--bb-muted)]">
              Dale forma a tu próxima publicación musical.
            </p>
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          <Field label="Título del lanzamiento *">
            <input
              className={input}
              required
              maxLength={120}
              placeholder="Ej. Noches de verano"
              value={f.title}
              onChange={set("title")}
            />
          </Field>

          <Field label="Tipo de lanzamiento">
            <select
              className={input}
              value={f.kind}
              onChange={set("kind")}
            >
              {kinds.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Fecha de lanzamiento">
            <input
              type="date"
              className={input}
              value={f.release_date}
              onChange={set("release_date")}
            />
          </Field>

          <Field label="Portada del lanzamiento">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className={`${input} cursor-pointer !px-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--bb-soft)] file:px-3 file:py-2 file:font-bold file:text-[var(--bb-text)]`}
              onChange={(event) =>
                setCover(event.target.files?.[0] ?? null)
              }
            />
            <p className="mt-2 text-xs leading-relaxed text-[var(--bb-muted)]">
              JPG, PNG o WEBP. Máximo 5 MB.
            </p>
          </Field>
        </div>

        {cover && (
          <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-[var(--bb-border)] bg-[var(--bb-soft)] p-3">
            <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-[var(--bb-card)]">
              {cover.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(cover)}
                  alt="Vista previa de la portada"
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImagePlus size={20} />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{cover.name}</p>
              <p className="text-xs text-[var(--bb-muted)]">
                {(cover.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>

            <button
              type="button"
              className={`${ghost} !rounded-full !px-3 !py-2 text-sm`}
              onClick={() => setCover(null)}
            >
              Quitar
            </button>
          </div>
        )}

        <div className="space-y-3 border-t border-[var(--bb-border)] pt-4">
          <Msg text={msg} />

          <button
            type="submit"
            className={`${btn} w-full sm:w-auto sm:min-w-48`}
            disabled={busy}
          >
            <Disc3 size={18} />
            {busy ? "Guardando..." : "Crear lanzamiento"}
          </button>
        </div>
      </form>

      {/* LANZAMIENTOS EXISTENTES */}
      <section className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-black sm:text-2xl">
              Tu colección
            </h3>
            <p className="mt-1 text-sm text-[var(--bb-muted)]">
              Tus lanzamientos, siempre a mano.
            </p>
          </div>

          <span className="rounded-full border border-[var(--bb-border)] bg-[var(--bb-card)] px-3 py-2 text-xs font-bold text-[var(--bb-accent)]">
            {albums.length} {albums.length === 1 ? "lanzamiento" : "lanzamientos"}
          </span>
        </div>

        {albums.length === 0 ? (
          <div className={`${card} flex flex-col items-center !py-10 text-center sm:!py-14`}>
            <div className="mb-4 grid size-16 place-items-center rounded-full bg-[var(--bb-soft)] text-[var(--bb-accent)]">
              <Music2 size={29} />
            </div>

            <Empty>
              Todavía no tienes lanzamientos. Crea el primero y empieza a
              organizar tu música.
            </Empty>
          </div>
        ) : (
          <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {albums.map((album) => {
              const kindLabel =
                kinds.find(([value]) => value === album.kind)?.[1] ??
                "Lanzamiento";

              return (
                <article
                  key={album.id}
                  className={`${card} group flex min-w-0 flex-col !p-3 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:!p-4`}
                >
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-[var(--bb-soft)]">
                    {album.cover_path ? (
                      <img
                        src={publicUrl("covers", album.cover_path)}
                        alt={`Portada de ${album.title}`}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[var(--bb-accent)]">
                        <Disc3 size={38} strokeWidth={1.4} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          BeatBoard
                        </span>
                      </div>
                    )}

                    <span className="absolute left-2 top-2 max-w-[calc(100%-1rem)] truncate rounded-full border border-[var(--bb-border)] bg-[var(--bb-card)]/90 px-2.5 py-1 text-[10px] font-bold text-[var(--bb-text)] backdrop-blur-sm sm:text-xs">
                      {kindLabel}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col pt-3">
                    <h4
                      title={album.title}
                      className="break-words text-sm font-black leading-snug text-[var(--bb-text)] sm:text-base"
                    >
                      {album.title}
                    </h4>

                    <p className="mt-2 flex items-center gap-1.5 text-xs leading-relaxed text-[var(--bb-muted)]">
                      <CalendarDays size={13} className="shrink-0" />
                      <span>
                        {album.release_date
                          ? new Date(
                              `${album.release_date}T12:00:00`
                            ).toLocaleDateString("es-SV", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Fecha por definir"}
                      </span>
                    </p>

                    <div className="mt-auto flex justify-end pt-3">
                      <button
                        type="button"
                        aria-label={`Borrar ${album.title}`}
                        title="Borrar lanzamiento"
                        className={`${ghost} !size-10 !shrink-0 !rounded-xl !p-0 text-[var(--bb-muted)] hover:!text-red-500`}
                        onClick={() => remove(album)}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
