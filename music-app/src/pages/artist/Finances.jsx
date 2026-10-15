
import { useCallback, useEffect, useState } from "react";
import { CalendarDays, CircleDollarSign, Clock3, Wallet } from "lucide-react";

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
  input,
  money,
  useAction,
} from "./ui.jsx";

function PayForm({ id, onDone }) {
  const { busy, msg, run } = useAction();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const submit = (event) => {
    event.preventDefault();

    run(async () => {
      const value = Number(amount);

      if (!Number.isFinite(value) || value <= 0) {
        throw new Error("Ingresa un monto válido mayor que cero.");
      }

      const { error } = await supabase.from("payments").insert({
        participation_id: id,
        amount: value,
        note: note.trim() || null,
      });

      if (error) throw error;

      setAmount("");
      setNote("");
      await onDone();
    }, "Pago registrado correctamente.");
  };

  return (
    <form onSubmit={submit} className="mt-4 space-y-3 rounded-2xl bg-[var(--bb-soft)] p-3 sm:p-4">
      <p className="text-sm font-black">Registrar un pago</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Monto ($)">
          <input
            type="number"
            min="0.01"
            step="0.01"
            required
            placeholder="0.00"
            className={input}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </Field>

        <Field label="Nota (opcional)">
          <input
            maxLength={250}
            placeholder="Ej. Anticipo"
            className={input}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </Field>
      </div>

      <Msg text={msg} />

      <button className={`${btn} w-full sm:w-auto`} disabled={busy}>
        <CircleDollarSign size={17} />
        {busy ? "Registrando..." : "Registrar pago"}
      </button>
    </form>
  );
}

export default function Finances() {
  const { user, artist } = useArtist();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const load = useCallback(async () => {
    setLoadError("");

    const { data, error } = await supabase
      .from("participations")
      .select("id, agreed_amount, paid_amount, payment_status, events(name, starts_at, organizer_id), payments(id, amount, paid_at, note)")
      .eq("artist_id", artist.id)
      .eq("confirmed", true);

    if (error) {
      setLoadError(error.message || "No se pudieron cargar las finanzas.");
      setLoading(false);
      return;
    }

    setRows(
      (data ?? [])
        .filter((row) => row.events)
        .sort(
          (a, b) =>
            new Date(b.events.starts_at) - new Date(a.events.starts_at)
        )
    );

    setLoading(false);
  }, [artist.id]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const total = (key) =>
    rows.reduce((sum, row) => sum + Number(row[key] || 0), 0);

  const agreed = total("agreed_amount");
  const paid = total("paid_amount");
  const due = agreed - paid;

  const summary = [
    { label: "Total acordado", value: agreed, icon: CircleDollarSign },
    { label: "Total cobrado", value: paid, icon: Wallet },
    { label: "Por cobrar", value: due, icon: Clock3 },
  ];

  return (
    <div className="space-y-6">
      <PageTitle
        title="Finanzas"
        text="Controla los pagos de tus presentaciones y revisa cuánto te falta por cobrar."
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {summary.map(({ label, value, icon: Icon }) => (
          <article key={label} className={`${card} min-w-0 !p-4 sm:!p-5`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-[var(--bb-muted)]">{label}</p>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--bb-soft)] text-[var(--bb-accent)]">
                <Icon size={20} />
              </span>
            </div>
            <p className="mt-3 break-words text-2xl font-black">{money(value)}</p>
          </article>
        ))}
      </section>

      <section className={card}>
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--bb-soft)] text-[var(--bb-accent)]">
            <CalendarDays size={20} />
          </span>
          <div>
            <h2 className="font-black">Resumen de cobros</h2>
            <p className="mt-1 text-sm text-[var(--bb-muted)]">
              {agreed > 0
                ? `${Math.min(100, Math.max(0, (paid / agreed) * 100)).toFixed(0)}% del monto acordado ha sido cobrado.`
                : "Todavía no hay montos acordados para calcular el progreso."}
            </p>
          </div>
        </div>

        <div
          className="mt-4 h-3 overflow-hidden rounded-full bg-[var(--bb-soft)]"
          role="progressbar"
          aria-label="Porcentaje de pagos cobrados"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={agreed > 0 ? Math.min(100, Math.max(0, (paid / agreed) * 100)) : 0}
        >
          <div
            className="h-full rounded-full bg-[var(--bb-accent)] transition-all"
            style={{
              width: `${agreed > 0 ? Math.min(100, Math.max(0, (paid / agreed) * 100)) : 0}%`,
            }}
          />
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-black">Pagos por evento</h2>
          <p className="mt-1 text-sm text-[var(--bb-muted)]">
            Consulta los importes y registra pagos cuando corresponda.
          </p>
        </div>

        {loading ? (
          <div className={`${card} text-sm text-[var(--bb-muted)]`}>
            Cargando tus movimientos...
          </div>
        ) : loadError ? (
          <div className={`${card} space-y-3`}>
            <p className="text-sm text-[var(--bb-muted)]">{loadError}</p>
            <button className={btn} onClick={() => { setLoading(true); load(); }}>
              Volver a intentar
            </button>
          </div>
        ) : rows.length === 0 ? (
          <Empty>
            Cuando tengas eventos confirmados, podrás consultar aquí los pagos acordados.
          </Empty>
        ) : (
          <ul className="space-y-3">
            {rows.map((row) => {
              const agreedAmount = Number(row.agreed_amount || 0);
              const paidAmount = Number(row.paid_amount || 0);
              const remaining = agreedAmount - paidAmount;
              const percentage =
                agreedAmount > 0
                  ? Math.min(100, Math.max(0, (paidAmount / agreedAmount) * 100))
                  : 0;

              return (
                <li key={row.id} className={`${card} min-w-0 !p-4 sm:!p-5`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="break-words font-black">{row.events.name}</h3>
                      <p className="mt-1 text-xs text-[var(--bb-muted)]">
                        {dateTime(row.events.starts_at)}
                      </p>
                    </div>

                    <span className="rounded-full bg-[var(--bb-soft)] px-3 py-1 text-xs font-bold capitalize">
                      {row.payment_status || "pendiente"}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-[var(--bb-soft)] p-3">
                      <p className="text-xs font-bold text-[var(--bb-muted)]">Cobrado</p>
                      <p className="mt-1 break-words font-black">{money(paidAmount)}</p>
                    </div>
                    <div className="rounded-xl bg-[var(--bb-soft)] p-3">
                      <p className="text-xs font-bold text-[var(--bb-muted)]">Pendiente</p>
                      <p className="mt-1 break-words font-black">{money(remaining)}</p>
                    </div>
                  </div>

                  <div
                    className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--bb-soft)]"
                    role="progressbar"
                    aria-label={`Progreso de cobro de ${row.events.name}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={percentage}
                  >
                    <div
                      className="h-full rounded-full bg-[var(--bb-accent)]"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  {row.payments?.length > 0 && (
                    <div className="mt-4 border-t border-[var(--bb-border)] pt-3">
                      <h4 className="text-sm font-black">Historial de pagos</h4>
                      <ul className="mt-2 space-y-2">
                        {row.payments.map((payment) => (
                          <li
                            key={payment.id}
                            className="flex flex-wrap justify-between gap-2 text-sm"
                          >
                            <span className="text-[var(--bb-muted)]">
                              {dateTime(payment.paid_at)}
                              {payment.note ? ` · ${payment.note}` : ""}
                            </span>
                            <span className="font-bold">{money(payment.amount)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {row.events.organizer_id === user.id &&
                    row.payment_status !== "pagado" &&
                    remaining > 0 && (
                      <PayForm id={row.id} onDone={load} />
                    )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
