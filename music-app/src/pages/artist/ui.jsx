import { useEffect, useState } from "react";
import { supabase } from "../../supabase";

export const input = "w-full rounded-xl border border-[var(--bb-border)] bg-[var(--bb-input)] px-4 py-3 text-[var(--bb-text)] outline-none placeholder:opacity-50 focus:border-[var(--bb-accent)]";
export const card = "rounded-[1.75rem] border border-[var(--bb-border)] bg-[var(--bb-card)] p-5";
export const btn = "inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--bb-primary)] px-4 py-3 font-bold text-[var(--bb-button-text)] transition hover:brightness-125 disabled:opacity-50";
export const ghost = "inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--bb-border)] px-4 py-3 font-bold text-[var(--bb-text)] transition hover:bg-[var(--bb-soft)] disabled:opacity-50";

export const money = (n) => `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const dateTime = (d) => new Date(d).toLocaleString("es-SV", { dateStyle: "medium", timeStyle: "short" });

export const Field = ({ label, children }) => (
  <label className="block"><span className="mb-1.5 block text-sm font-bold">{label}</span>{children}</label>
);
export const PageTitle = ({ title, text }) => (
  <header className="mb-5">
    <h2 className="text-2xl font-black">{title}</h2>
    {text && <p className="mt-1 text-sm text-[var(--bb-muted)]">{text}</p>}
  </header>
);
export const Msg = ({ text }) => text ? <p role="status" className="rounded-xl bg-[var(--bb-soft)] p-3 text-sm">{text}</p> : null;
export const Empty = ({ children }) => (
  <p className="rounded-2xl border border-dashed border-[var(--bb-border)] p-6 text-center text-sm text-[var(--bb-muted)]">{children}</p>
);

// run(fn, mensajeDeÉxito): maneja "cargando" y errores en un solo lugar
export function useAction() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const run = async (fn, ok = "") => {
    setBusy(true); setMsg("");
    try { await fn(); setMsg(ok); } catch (e) { setMsg(e.message || "Algo salió mal."); } finally { setBusy(false); }
  };
  return { busy, msg, run };
}

export function GenreSelect({ value, onChange }) {
  const [genres, setGenres] = useState([]);
  useEffect(() => {
    supabase.from("genres").select("id, name").order("id").then(({ data }) => setGenres(data ?? []));
  }, []);
  return (
    <select className={input} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Elige un género</option>
      {genres.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
    </select>
  );
}

// Sube a Storage dentro de la carpeta del usuario: <user-id>/<archivo>
export async function uploadFile(bucket, userId, file) {
  const ext = file.name.split(".").pop().toLowerCase();
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type });
  if (error) throw error;
  return path;
}
export const publicUrl = (bucket, path) =>
  path ? supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl : null;

export const checkImage = (file) => {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Las imágenes deben ser JPG, PNG o WEBP.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Las imágenes deben pesar máximo 5 MB.");
};

export const audioDuration = (file) => new Promise((resolve) => {
  const a = new Audio(URL.createObjectURL(file));
  a.onloadedmetadata = () => resolve(Math.round(a.duration) || null);
  a.onerror = () => resolve(null);
});