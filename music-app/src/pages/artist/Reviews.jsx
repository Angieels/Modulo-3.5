
import { useEffect, useState } from "react";
import { MessageSquareText, Star } from "lucide-react";

import { supabase } from "../../supabase";
import { useArtist } from "../../context/ArtistContext.jsx";
import { Empty, PageTitle, card } from "./ui.jsx";

function Stars({ rating, size = 17 }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((number) => (
        <Star
          key={number}
          size={size}
          className={number <= rating ? "text-[var(--bb-accent)]" : "text-[var(--bb-border)]"}
          fill={number <= rating ? "currentColor" : "none"}
        />
      ))}
    </span>
  );
}

export default function Reviews() {
  const { artist } = useArtist();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadReviews() {
      setRows(null);
      setError("");

      const { data, error: queryError } = await supabase
        .from("reviews")
        .select("id, rating, comment, created_at, events(name), profiles(display_name)")
        .eq("artist_id", artist.id)
        .order("created_at", { ascending: false });

      if (!active) return;

      if (queryError) {
        setError(queryError.message || "No se pudieron cargar las reseñas.");
        setRows([]);
        return;
      }

      setRows(data ?? []);
    }

    loadReviews();

    return () => {
      active = false;
    };
  }, [artist.id]);

  const average = rows?.length
    ? rows.reduce((sum, review) => sum + Number(review.rating || 0), 0) / rows.length
    : 0;

  return (
    <div className="space-y-6">
      <PageTitle
        title="Reseñas"
        text="Descubre qué piensa el público de tus presentaciones."
      />

      {rows === null ? (
        <div className={`${card} text-sm text-[var(--bb-muted)]`}>
          Cargando reseñas...
        </div>
      ) : error ? (
        <div className={`${card} text-sm text-[var(--bb-muted)]`}>
          {error}
        </div>
      ) : (
        <>
          <section className={`${card} relative overflow-hidden !p-5 sm:!p-7`}>
            <div className="pointer-events-none absolute -right-8 -top-10 size-36 rounded-full bg-[var(--bb-accent)] opacity-10 blur-3xl" />
            <div className="relative grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
              <div className="flex size-20 flex-col items-center justify-center rounded-3xl bg-[var(--bb-soft)]">
                <Star
                  size={22}
                  fill="currentColor"
                  className="text-[var(--bb-accent)]"
                />
                <span className="mt-1 text-xl font-black">
                  {rows.length ? average.toFixed(1) : "—"}
                </span>
              </div>

              <div>
                <h2 className="text-xl font-black">
                  {rows.length ? "Tu valoración" : "Aún no tienes valoraciones"}
                </h2>
                <div className="mt-2">
                  {rows.length > 0 && <Stars rating={Math.round(average)} />}
                </div>
                <p className="mt-2 text-sm text-[var(--bb-muted)]">
                  {rows.length
                    ? `${rows.length} ${rows.length === 1 ? "reseña recibida" : "reseñas recibidas"} de tu público.`
                    : "Las reseñas aparecerán aquí cuando el público valore tus presentaciones."}
                </p>
              </div>
            </div>
          </section>

          {rows.length === 0 ? (
            <Empty>
              Todavía no hay reseñas para mostrar. ¡Sigue compartiendo tu música!
            </Empty>
          ) : (
            <section className="space-y-3">
              <h2 className="text-lg font-black">Lo que dice tu público</h2>

              <ul className="grid gap-3 xl:grid-cols-2">
                {rows.map((review) => (
                  <li key={review.id} className={`${card} min-w-0 !p-4 sm:!p-5`}>
                    <div className="flex items-start gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--bb-soft)] font-black text-[var(--bb-accent)]">
                        {(review.profiles?.display_name || "O").trim().charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="break-words font-black">
                            {review.profiles?.display_name || "Oyente"}
                          </p>
                          <Stars rating={Number(review.rating || 0)} size={15} />
                        </div>

                        <p className="mt-1 text-xs text-[var(--bb-muted)]">
                          {review.events?.name || "Presentación"}
                          {review.created_at &&
                            ` · ${new Date(review.created_at).toLocaleDateString("es-SV", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}`}
                        </p>
                      </div>
                    </div>

                    {review.comment ? (
                      <blockquote className="mt-4 rounded-2xl bg-[var(--bb-soft)] p-4 text-sm leading-6">
                        <MessageSquareText
                          size={17}
                          className="mb-2 text-[var(--bb-accent)]"
                        />
                        {review.comment}
                      </blockquote>
                    ) : (
                      <p className="mt-4 text-sm italic text-[var(--bb-muted)]">
                        El público dejó una valoración sin comentario.
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
