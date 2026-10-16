
import { useEffect, useMemo, useState } from "react";
import {
  Search as SearchIcon,
  Music2,
  Headphones,
  Disc3,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { supabase } from "../supabase";
import { usePlayer } from "../store/usePlayer";
import LikeButton from "../components/LikeButton";

function getPublicUrl(bucket, path) {
  if (!path) return null;

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl ?? null;
}

function normalizeTrack(track) {
  const artist = Array.isArray(track.artist)
    ? track.artist[0]
    : track.artist;

  const genre = Array.isArray(track.genre)
    ? track.genre[0]
    : track.genre;

  const audioUrl = getPublicUrl("audio", track.audio_path);
  const coverUrl = getPublicUrl("covers", track.cover_path);

  return {
    ...track,
    artistName: artist?.stage_name ?? "Artista sin nombre",
    artistAvatar: artist?.avatar_url ?? null,
    genreName: genre?.name ?? "Sin género",
    audioUrl,
    src: audioUrl,
    coverUrl,
  };
}

const cardStyle = {
  backgroundColor: "var(--bb-card)",
  borderColor: "var(--bb-border)",
  color: "var(--bb-text)",
};

const mutedStyle = {
  color: "var(--bb-muted)",
};

const accentStyle = {
  color: "var(--bb-accent)",
};

export default function Search() {
  const [tracks, setTracks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const play = usePlayer((state) => state.play);

  useEffect(() => {
    let active = true;

    async function loadSearchData() {
      setLoading(true);
      setError("");

      try {
        const [genresResult, tracksResult] = await Promise.all([
          supabase
            .from("genres")
            .select("id, name")
            .order("name", { ascending: true }),

          supabase
            .from("tracks")
            .select(`
              *,
              artist:artists!tracks_artist_id_fkey (
                id,
                stage_name,
                avatar_url
              ),
              genre:genres!tracks_genre_id_fkey (
                id,
                name
              )
            `)
            .eq("is_public", true)
            .order("created_at", { ascending: false })
            .limit(300),
        ]);

        if (!active) return;

        if (genresResult.error) {
          throw genresResult.error;
        }

        if (tracksResult.error) {
          throw tracksResult.error;
        }

        setGenres(genresResult.data ?? []);
        setTracks((tracksResult.data ?? []).map(normalizeTrack));
      } catch (err) {
        console.error("Error cargando la búsqueda:", err);

        if (active) {
          setError(
            "No pudimos cargar la música. Inténtalo de nuevo."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadSearchData();

    return () => {
      active = false;
    };
  }, []);

  const filteredTracks = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    return tracks.filter((track) => {
      const matchesGenre =
        selectedGenre === "all" ||
        String(track.genre_id ?? "") === selectedGenre;

      const searchableText = [
        track.title,
        track.artistName,
        track.genreName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase();

      const matchesQuery =
        !normalizedQuery ||
        searchableText.includes(normalizedQuery);

      return matchesGenre && matchesQuery;
    });
  }, [tracks, query, selectedGenre]);

  function handlePlay(track) {
    if (!track.src) {
      setError(`No encontramos el audio de "${track.title}".`);
      return;
    }

    setError("");

    const index = filteredTracks.findIndex(
      (item) => item.id === track.id
    );

    play(filteredTracks, Math.max(index, 0));
  }

  function clearFilters() {
    setQuery("");
    setSelectedGenre("all");
  }

  return (
    <main
      className="min-h-screen pb-32 transition-colors duration-300"
      style={{
        backgroundColor: "var(--bb-page)",
        color: "var(--bb-text)",
      }}
    >
      <div className="mx-auto w-full max-w-6xl px-4 pt-5 sm:px-7 sm:pt-8 lg:px-10">
        {/* Encabezado */}
        <header className="mb-8 sm:mb-10">
          <div
            className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: "var(--bb-accent)",
              color: "var(--bb-page)",
            }}
          >
            <SearchIcon size={24} strokeWidth={2.5} />
          </div>

          <p
            className="mb-2 text-xs font-bold uppercase tracking-[0.2em]"
            style={accentStyle}
          >
            Explora tu próximo favorito
          </p>

          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Buscar música
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-relaxed sm:text-base" style={mutedStyle}>
            Encuentra canciones y artistas según tu estilo musical.
          </p>
        </header>

        {/* Buscador */}
        <section className="mb-8">
          <label
            htmlFor="music-search"
            className="mb-2 block text-sm font-bold"
          >
            ¿Qué quieres escuchar?
          </label>

          <div
            className="flex items-center gap-3 rounded-2xl border px-4 py-3 transition focus-within:ring-2"
            style={{
              ...cardStyle,
              "--tw-ring-color": "var(--bb-accent)",
            }}
          >
            <SearchIcon size={20} className="shrink-0" style={accentStyle} />

            <input
              id="music-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Canción, artista o género..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:opacity-60 sm:text-base"
              style={{ color: "var(--bb-text)" }}
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Borrar búsqueda"
                className="rounded-full p-1 transition hover:opacity-70"
                style={mutedStyle}
              >
                <X size={18} />
              </button>
            )}
          </div>
        </section>

        {/* Filtros por género */}
        <section className="mb-9">
          <div className="mb-3 flex items-center gap-2">
            <SlidersHorizontal size={17} style={accentStyle} />
            <h2 className="text-base font-extrabold sm:text-lg">
              Explorar por género
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedGenre("all")}
              className="rounded-full border px-4 py-2.5 text-sm font-bold transition hover:brightness-110"
              style={{
                backgroundColor:
                  selectedGenre === "all"
                    ? "var(--bb-primary)"
                    : "var(--bb-card)",
                borderColor:
                  selectedGenre === "all"
                    ? "var(--bb-accent)"
                    : "var(--bb-border)",
                color: "var(--bb-text)",
              }}
            >
              Todos
            </button>

            {genres.map((genre) => {
              const isSelected =
                selectedGenre === String(genre.id);

              return (
                <button
                  key={genre.id}
                  type="button"
                  onClick={() =>
                    setSelectedGenre(String(genre.id))
                  }
                  className="rounded-full border px-4 py-2.5 text-sm font-bold transition hover:brightness-110"
                  style={{
                    backgroundColor: isSelected
                      ? "var(--bb-primary)"
                      : "var(--bb-card)",
                    borderColor: isSelected
                      ? "var(--bb-accent)"
                      : "var(--bb-border)",
                    color: isSelected
                      ? "var(--bb-text)"
                      : "var(--bb-muted)",
                  }}
                >
                  {genre.name}
                </button>
              );
            })}
          </div>
        </section>

        {/* Resultados */}
        <section>
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-black sm:text-2xl">
                {query || selectedGenre !== "all"
                  ? "Resultados"
                  : "Todas las canciones"}
              </h2>

              <p className="mt-1 text-sm" style={mutedStyle}>
                {loading
                  ? "Buscando música..."
                  : `${filteredTracks.length} ${
                      filteredTracks.length === 1
                        ? "canción encontrada"
                        : "canciones encontradas"
                    }`}
              </p>
            </div>

            {(query || selectedGenre !== "all") && (
              <button
                type="button"
                onClick={clearFilters}
                className="shrink-0 rounded-full px-3 py-2 text-xs font-bold transition hover:brightness-110"
                style={{
                  backgroundColor: "var(--bb-soft)",
                  color: "var(--bb-accent)",
                }}
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-2xl border p-4 text-sm"
              style={{
                ...cardStyle,
                color: "var(--bb-accent)",
              }}
            >
              {error}
            </div>
          )}

          {loading ? (
            <div
              className="flex min-h-52 flex-col items-center justify-center rounded-3xl border"
              style={cardStyle}
            >
              <Music2
                size={34}
                className="mb-3 animate-pulse"
                style={accentStyle}
              />
              <p className="font-semibold">Buscando tus sonidos...</p>
              <p className="mt-1 text-sm" style={mutedStyle}>
                Un momentito.
              </p>
            </div>
          ) : filteredTracks.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredTracks.map((track, index) => (
                <article
                  key={track.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Reproducir ${track.title} de ${track.artistName}`}
                  onClick={() => handlePlay(track)}
                  onKeyDown={(event) => {
                    if (
                      event.target !== event.currentTarget ||
                      (event.key !== "Enter" && event.key !== " ")
                    ) {
                      return;
                    }

                    event.preventDefault();
                    handlePlay(track);
                  }}
                  className="group flex min-w-0 cursor-pointer items-center gap-3 rounded-2xl border p-3 text-left transition duration-200 hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 sm:gap-4 sm:p-4"
                  style={{
                    ...cardStyle,
                    "--tw-ring-color": "var(--bb-accent)",
                  }}
                >
                  {/* Portada */}
                  <div
                    className="relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-xl sm:h-[88px] sm:w-[88px]"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--bb-primary), var(--bb-card), var(--bb-page))",
                    }}
                  >
                    {track.coverUrl ? (
                      <img
                        src={track.coverUrl}
                        alt={`Portada de ${track.title}`}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Music2 size={30} style={accentStyle} />
                      </div>
                    )}

                    <div
                      className="absolute bottom-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: "var(--bb-page)",
                        color: "var(--bb-accent)",
                      }}
                    >
                      <Headphones size={14} />
                    </div>
                  </div>

                  {/* Datos */}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-extrabold sm:text-base">
                      {track.title || "Sin título"}
                    </h3>

                    <p
                      className="mt-1 truncate text-xs sm:text-sm"
                      style={accentStyle}
                    >
                      {track.artistName}
                    </p>

                    <span
                      className="mt-2 inline-block max-w-full truncate rounded-full px-2.5 py-1 text-[10px] font-bold sm:text-xs"
                      style={{
                        backgroundColor: "var(--bb-soft)",
                        color: "var(--bb-muted)",
                      }}
                    >
                      {track.genreName}
                    </span>
                  </div>

                  {/* Favorito */}
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                    onKeyUp={(event) => event.stopPropagation()}
                  >
                    <LikeButton trackId={track.id} />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div
              className="flex min-h-60 flex-col items-center justify-center rounded-3xl border px-5 text-center"
              style={cardStyle}
            >
              <Disc3 size={40} className="mb-4" style={accentStyle} />

              <h3 className="text-lg font-extrabold">
                No encontramos canciones
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-relaxed" style={mutedStyle}>
                Prueba con otro nombre o selecciona un género diferente.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-full px-4 py-2.5 text-sm font-bold transition hover:brightness-110"
                style={{
                  backgroundColor: "var(--bb-primary)",
                  color: "var(--bb-text)",
                }}
              >
                Ver toda la música
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
