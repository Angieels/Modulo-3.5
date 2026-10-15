
import { useCallback, useEffect, useState } from "react";
import { CalendarDays, MapPin, Plus, Ticket, XCircle } from "lucide-react";

import { supabase } from "../../supabase";
import { useArtist } from "../../context/ArtistContext.jsx";
import {
  Empty,
  Field,
  Msg,
  PageTitle,
  btn,
  card,
  dateTime,
  ghost,
  input,
  money,
  useAction,
} from "./ui.jsx";

const types = [
  ["concierto", "Concierto"],
  ["festival", "Festival"],
  ["presentacion_escolar", "Presentación escolar"],
  ["gig", "Gig"],
  ["otro", "Otro"],
];

const blank = {
  name: "",
  starts_at: "",
  venue: "",
  event_type: "concierto",
  capacity: "",
  agreed_amount: "",
};

export default function Events() {
  const { user, artist } = useArtist();
  const { busy, msg, run } = useAction();
  const [rows, setRows] = useState([]);
  const [f, setF] = useState(blank);
  const [loadError, setLoadError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const set = (key) => (event) =>
    setF((previous) => ({ ...previous, [key]: event.target.value }));

  const load = useCallback(async () => {
    setLoadError("");

    const { data, error } = await supabase
      .from("participations")
      .select("id, agreed_amount, events(id, name, starts_at, venue, event_type, organizer_id)")
      .eq("artist_id", artist.id)
      .eq("confirmed", true);

    if (error) {
      setLoadError(error.message || "No se pudieron cargar los eventos.");
      return;
    }

    setRows(
      (data ?? [])
        .filter((row) => row.events)
        .sort(
          (a, b) =>
            new Date(a.events.starts_at) - new Date(b.events.starts_at)
        )
    );
  }, [artist.id]);

  useEffect(() => {
    load();
  }, [load]);

  const create = (event) => {
    event.preventDefault();

    run(async () => {
      const startDate = new Date(f.starts_at);

      if (Number.isNaN(startDate.getTime()) || startDate <= new Date()) {
        throw new Error("Selecciona una fecha futura válida.");
      }

      const { data: ev, error } = await supabase
        .from("events")
        .insert({
          name: f.name.trim(),
          starts_at: startDate.toISOString(),
          venue: f.venue.trim(),
          event_type: f.event_type,
          capacity: f.capacity ? Number(f.capacity) : null,
          organizer_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const { error: participationError } = await supabase
        .from("participations")
        .insert({
          artist_id: artist.id,
          event_id: ev.id,
          agreed_amount: Number(f.agreed_amount) || 0,
          confirmed: true,
        });

      if (participationError) throw participationError;

      setF(blank);
      setShowForm(false);
      await load();
    }, "¡Evento creado y agregado a tu agenda!");
  };

  const cancel = (row) => {
    const reason = window.prompt("¿Por qué se cancela?");

    if (reason === null) return;

    run(async () => {
      const { error } = await supabase
        .from("participations")
        .update({ confirmed: false, cancel_reason: reason.trim() })
        .eq("id", row.id);

      if (error) throw error;
      await load();
    }, "Evento cancelado de tu agenda.");
  };

  const now = new Date();
  const upcoming = rows.filter((row) => new Date(row.events.starts_at) >= now);
  const previous = rows
    .filter((row) => new Date(row.events.starts_at) < now)
    .reverse();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageTitle
          title="Mis eventos"
          text="Organiza tus presentaciones y mantén tu agenda al día."
        />
        <button
          type="button"
          className={btn}
          onClick={() => setShowForm((value) => !value)}
        >
          <Plus size={18} />
          {showForm ? "Cerrar formulario" : "Crear evento"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className={`${card} space-y-5`}>
          <div>
            <h2 className="text-lg font-black">Nuevo evento</h2>
            <p className="mt-1 text-sm text-[var(--bb-muted)]">
              Completa los datos de tu próxima presentación.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre del evento *">
              <input
                className={input}
                required
                maxLength={150}
                value={f.name}
                onChange={set("name")}
                placeholder="Ej. Noche de música en vivo"
              />
            </Field>

            <Field label="Fecha y hora *">
              <input
                type="datetime-local"
                className={input}
                required
                min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                  .toISOString()
                  .slice(0, 16)}
                value={f.starts_at}
                onChange={set("starts_at")}
              />
            </Field>

            <Field label="Lugar *">
              <input
                className={input}
                required
                maxLength={200}
                value={f.venue}
                onChange={set("venue")}
                placeholder="Nombre del lugar o recinto"
              />
            </Field>

            <Field label="Tipo de evento">
              <select
                className={input}
                value={f.event_type}
                onChange={set("event_type")}
              >
                {types.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </Field>

            <Field label="Aforo estimado">
              <input
                type="number"
                min="1"
                className={input}
                value={f.capacity}
                onChange={set("capacity")}
                placeholder="Ej. 200"
              />
            </Field>

            <Field label="Pago acordado ($)">
              <input
                type="number"
                min="0"
                step="0.01"
                className={input}
                value={f.agreed_amount}
                onChange={set("agreed_amount")}
                placeholder="0.00"
              />
            </Field>
          </div>

          <Msg text={msg} />
          <div className="flex flex-wrap gap-3">
            <button className={btn} disabled={busy}>
              <Plus size={18} />
              {busy ? "Creando evento..." : "Guardar evento"}
            </button>
            <button
              type="button"
              className={ghost}
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className={`${card} !p-4`}>
          <p className="text-xs font-bold text-[var(--bb-muted)]">Próximos</p>
          <p className="mt-1 text-2xl font-black">{upcoming.length}</p>
        </div>
        <div className={`${card} !p-4`}>
          <p className="text-xs font-bold text-[var(--bb-muted)]">Anteriores</p>
          <p className="mt-1 text-2xl font-black">{previous.length}</p>
        </div>
      </div>

      {loadError && (
        <div className={`${card} space-y-3`}>
          <p className="text-sm text-[var(--bb-muted)]">{loadError}</p>
          <button type="button" className={ghost} onClick={load}>
            Volver a intentar
          </button>
        </div>
      )}

      {!loadError && rows.length === 0 && (
        <Empty>
          Aún no tienes eventos agendados. Crea el primero para organizar tu próxima presentación.
        </Empty>
      )}

      {[
        { title: "Próximos eventos", items: upcoming, upcoming: true },
        { title: "Eventos anteriores", items: previous, upcoming: false },
      ].map(({ title, items, upcoming: isUpcoming }) =>
        items.length > 0 ? (
          <section key={title} className="space-y-3">
            <h2 className="text-lg font-black">{title}</h2>
            <ul className="grid gap-3 xl:grid-cols-2">
              {items.map((row) => (
                <li key={row.id} className={`${card} min-w-0 !p-4 sm:!p-5`}>
                  <div className="flex items-start gap-3">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--bb-soft)] text-[var(--bb-accent)]">
                      <CalendarDays size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="break-words font-black">{row.events.name}</h3>
                        <span className="rounded-full bg-[var(--bb-soft)] px-2.5 py-1 text-xs font-bold text-[var(--bb-muted)]">
                          {types.find(([value]) => value === row.events.event_type)?.[1] || "Otro"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-[var(--bb-muted)]">
                        {dateTime(row.events.starts_at)}
                      </p>
                      <p className="mt-1 flex items-start gap-1.5 text-sm text-[var(--bb-muted)]">
                        <MapPin size={16} className="mt-0.5 shrink-0" />
                        <span>{row.events.venue}</span>
                      </p>
                      <p className="mt-3 flex items-center gap-2 text-sm font-black">
                        <Ticket size={16} className="text-[var(--bb-accent)]" />
                        {money(row.agreed_amount)}
                      </p>
                    </div>
                  </div>

                  {isUpcoming && row.events.organizer_id === user.id && (
                    <div className="mt-4 border-t border-[var(--bb-border)] pt-3">
                      <button
                        type="button"
                        className={`${ghost} !py-2 text-sm`}
                        onClick={() => cancel(row)}
                      >
                        <XCircle size={16} />
                        Cancelar evento
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ) : null
      )}
    </div>
  );
}
