// src/pages/Profile.jsx

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  UserRound,
  Heart,
  LogOut,
  Music2,
  ChevronRight,
  Sparkles,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  Camera,
  Settings,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  X,
  Disc3,
  Mic2,
} from "lucide-react";

import { supabase } from "../supabase";
import { useTheme } from "../context/ThemeContext.jsx";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

const ALLOWED_AVATAR_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export default function Profile() {
  const avatarInputRef = useRef(null);

  const { themes, themeId, setTheme } = useTheme();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingName, setSavingName] = useState(false);

  const [mode, setMode] = useState("login");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [displayNameInput, setDisplayNameInput] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const inputClass =
    "w-full rounded-xl border border-[var(--bb-border)] bg-[var(--bb-input)] px-4 py-3 text-[var(--bb-text)] outline-none transition placeholder:opacity-50 focus:border-[var(--bb-accent)] focus:ring-2 focus:ring-[var(--bb-accent)]/20";

  const labelClass =
    "mb-2 block text-sm font-bold text-[var(--bb-text)]";

  const cardClass =
    "rounded-[1.75rem] border border-[var(--bb-border)] bg-[var(--bb-card)] shadow-sm transition-colors duration-300";

  const primaryButtonClass =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--bb-primary)] px-4 py-3 font-bold text-[var(--bb-button-text)] transition hover:brightness-125 disabled:cursor-not-allowed disabled:opacity-50";

  async function loadProfile(currentUser) {
    if (!currentUser) {
      setUser(null);
      setProfile(null);
      setDisplayNameInput("");
      return;
    }

    setUser(currentUser);

    const { data, error } = await supabase
      .from("profiles")
      .select("username, display_name, avatar_url, role")
      .eq("id", currentUser.id)
      .maybeSingle();

    if (error) {
      console.error("Error al consultar el perfil:", error);
      setProfile(null);
      setDisplayNameInput(
        currentUser.user_metadata?.display_name ?? ""
      );
      return;
    }

    setProfile(data ?? null);

    setDisplayNameInput(
      data?.display_name ??
        currentUser.user_metadata?.display_name ??
        ""
    );
  }

  useEffect(() => {
    let alive = true;

    async function init() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (alive) {
          await loadProfile(data.session?.user ?? null);
        }
      } catch (error) {
        console.error("Error al comprobar la sesión:", error);
      } finally {
        if (alive) setLoading(false);
      }
    }

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!alive) return;

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      Promise.resolve().then(() => {
        if (alive) {
          loadProfile(currentUser).catch((error) => {
            console.error("Error al actualizar el perfil:", error);
          });
        }
      });
    });

    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleAuth(event) {
    event.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setMessage("");
    setErrorMessage("");

    try {
      const cleanEmail = email.trim().toLowerCase();

      if (mode === "signup") {
        const cleanName = displayNameInput.trim();

        if (!cleanName) {
          throw new Error("Escribe tu nombre para crear la cuenta.");
        }

        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { display_name: cleanName },
          },
        });

        if (error) throw error;

        if (data.session && data.user) {
          await loadProfile(data.user);
          setPassword("");
          setMessage("¡Cuenta creada! Bienvenido a BeatBoard. ☕");
        } else {
          setPassword("");
          setMode("login");
          setMessage(
            "¡Registro recibido! Revisa tu correo y confirma tu cuenta antes de iniciar sesión."
          );
        }
      } else {
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });

        if (error) throw error;

        await loadProfile(data.user);
        setPassword("");
        setMessage("¡Bienvenido de vuelta a BeatBoard! ☕");
      }
    } catch (error) {
      console.error("Error de autenticación:", error);

      const text = error?.message ?? "";
      const normalized = text.toLowerCase();

      if (normalized.includes("invalid login credentials")) {
        setErrorMessage("Correo o contraseña incorrectos.");
      } else if (normalized.includes("email not confirmed")) {
        setErrorMessage(
          "Debes confirmar tu correo antes de iniciar sesión."
        );
      } else if (normalized.includes("already registered")) {
        setErrorMessage(
          "Este correo ya está registrado. Prueba iniciar sesión."
        );
      } else if (
        normalized.includes("password should be at least")
      ) {
        setErrorMessage(
          "La contraseña no cumple con los requisitos de seguridad."
        );
      } else {
        setErrorMessage(
          text || "No se pudo completar la operación."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAvatarChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !user) return;

    setMessage("");
    setErrorMessage("");

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setErrorMessage("Usa una imagen JPG, PNG o WEBP.");
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setErrorMessage("La imagen debe pesar como máximo 2 MB.");
      return;
    }

    setUploadingAvatar(true);

    try {
      const filePath = `${user.id}/avatar`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
          cacheControl: "0",
        });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const avatarUrl = `${publicData.publicUrl}?v=${Date.now()}`;

      const { data, error } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", user.id)
        .select("username, display_name, avatar_url, role")
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        throw new Error(
          "No encontramos tu perfil. Comprueba que exista una fila en profiles para tu usuario."
        );
      }

      setProfile(data);
      setMessage("Tu foto de perfil se actualizó correctamente. ✨");
    } catch (error) {
      console.error("Error al subir la foto:", error);
      setErrorMessage(
        error?.message ||
          "No se pudo subir la imagen. Inténtalo de nuevo."
      );
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function saveDisplayName() {
    if (!user || savingName) return;

    const cleanName = displayNameInput.trim();

    setMessage("");
    setErrorMessage("");

    if (!cleanName || cleanName.length > 60) {
      setErrorMessage(
        "Escribe un nombre de entre 1 y 60 caracteres."
      );
      return;
    }

    setSavingName(true);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({ display_name: cleanName })
        .eq("id", user.id)
        .select("username, display_name, avatar_url, role")
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        throw new Error(
          "No se encontró tu perfil. Comprueba que exista en la base de datos."
        );
      }

      setProfile(data);
      setMessage("Nombre actualizado correctamente. ☕");
    } catch (error) {
      console.error("Error al guardar el nombre:", error);
      setErrorMessage(
        error?.message || "No se pudo guardar el nombre."
      );
    } finally {
      setSavingName(false);
    }
  }

  async function signOut() {
    if (signingOut) return;

    setSigningOut(true);
    setMessage("");
    setErrorMessage("");

    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      setUser(null);
      setProfile(null);
      setPassword("");
      setDisplayNameInput("");
      setSettingsOpen(false);
      setMessage("Has cerrado sesión correctamente.");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setErrorMessage(
        "No se pudo cerrar sesión. Inténtalo de nuevo."
      );
    } finally {
      setSigningOut(false);
    }
  }

  const displayName =
    profile?.display_name ||
    profile?.username ||
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "Oyente";

  if (loading) {
    return (
      <section className="mx-auto max-w-4xl p-6 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-[var(--bb-soft)]">
          <Music2
            size={25}
            className="animate-pulse text-[var(--bb-accent)]"
          />
        </div>
        <p className="mt-4 text-sm text-[var(--bb-muted)]">
          Preparando tu rincón musical...
        </p>
      </section>
    );
  }

  return (
    <section
      className="mx-auto max-w-4xl space-y-7 rounded-3xl bg-[var(--bb-page)] p-3 pb-10 transition-colors duration-300 sm:p-5"
    >
      {/* ENCABEZADO */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--bb-accent)]">
            <Sparkles size={14} />
            Tu espacio musical
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-[var(--bb-text)] sm:text-4xl">
            Mi perfil
          </h1>

          <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--bb-muted)]">
            Tu identidad, tus favoritos y la música que te acompaña.
          </p>
        </div>

        {user && (
          <button
            type="button"
            onClick={() => setSettingsOpen((open) => !open)}
            aria-label={
              settingsOpen ? "Cerrar ajustes" : "Abrir ajustes"
            }
            aria-expanded={settingsOpen}
            title="Ajustes de la cuenta"
            className="mt-1 grid size-11 shrink-0 place-items-center rounded-full border border-[var(--bb-border)] bg-[var(--bb-card)] text-[var(--bb-text)] transition hover:bg-[var(--bb-soft)]"
          >
            {settingsOpen ? <X size={19} /> : <Settings size={19} />}
          </button>
        )}
      </header>

      {/* MENSAJES */}
      {message && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-[var(--bb-border)] bg-[var(--bb-soft)] p-4 text-sm leading-relaxed text-[var(--bb-text)]"
        >
          <CheckCircle2
            size={19}
            className="mt-0.5 shrink-0 text-[var(--bb-accent)]"
          />
          <p>{message}</p>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-400/40 bg-red-950/30 p-4 text-sm leading-relaxed text-red-300"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      {!user ? (
        /* INICIO DE SESIÓN Y REGISTRO */
        <div className={`${cardClass} p-6 sm:p-9`}>
          <div className="grid size-12 place-items-center rounded-2xl bg-[var(--bb-soft)] text-[var(--bb-accent)]">
            <UserRound size={25} />
          </div>

          <h2 className="mt-5 text-2xl font-black text-[var(--bb-text)]">
            {mode === "login"
              ? "Qué bueno tenerte aquí"
              : "Únete a BeatBoard"}
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-[var(--bb-muted)]">
            {mode === "login"
              ? "Inicia sesión para volver a tu espacio musical."
              : "Crea tu cuenta y haz de BeatBoard tu propio rincón musical."}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-[var(--bb-soft)] p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setMessage("");
                setErrorMessage("");
              }}
              className={`rounded-lg px-3 py-3 text-sm font-bold transition ${
                mode === "login"
                  ? "bg-[var(--bb-primary)] text-[var(--bb-button-text)] shadow-sm"
                  : "text-[var(--bb-muted)] hover:text-[var(--bb-text)]"
              }`}
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setMessage("");
                setErrorMessage("");
              }}
              className={`rounded-lg px-3 py-3 text-sm font-bold transition ${
                mode === "signup"
                  ? "bg-[var(--bb-primary)] text-[var(--bb-button-text)] shadow-sm"
                  : "text-[var(--bb-muted)] hover:text-[var(--bb-text)]"
              }`}
            >
              Crear cuenta
            </button>
          </div>

          <form onSubmit={handleAuth} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div>
                <label htmlFor="displayName" className={labelClass}>
                  ¿Cómo te llamamos?
                </label>
                <input
                  id="displayName"
                  type="text"
                  autoComplete="nickname"
                  maxLength={60}
                  required
                  value={displayNameInput}
                  onChange={(event) =>
                    setDisplayNameInput(event.target.value)
                  }
                  placeholder="Tu nombre"
                  className={inputClass}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className={labelClass}>
                Correo electrónico
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-[var(--bb-border)] bg-[var(--bb-input)] px-4 focus-within:border-[var(--bb-accent)]">
                <Mail
                  size={18}
                  className="shrink-0 text-[var(--bb-muted)]"
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="tu@correo.com"
                  className="min-w-0 flex-1 bg-transparent py-3.5 text-[var(--bb-text)] outline-none placeholder:opacity-50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>
                Contraseña
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-[var(--bb-border)] bg-[var(--bb-input)] px-4 focus-within:border-[var(--bb-accent)]">
                <LockKeyhole
                  size={18}
                  className="shrink-0 text-[var(--bb-muted)]"
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    mode === "login"
                      ? "current-password"
                      : "new-password"
                  }
                  minLength={6}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={
                    mode === "signup"
                      ? "Mínimo 6 caracteres"
                      : "Tu contraseña"
                  }
                  className="min-w-0 flex-1 bg-transparent py-3.5 text-[var(--bb-text)] outline-none placeholder:opacity-50"
                />

                <button
                  type="button"
                  aria-label={
                    showPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                  onClick={() => setShowPassword((value) => !value)}
                  className="shrink-0 text-[var(--bb-muted)] hover:text-[var(--bb-text)]"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`${primaryButtonClass} w-full py-4`}
            >
              {submitting ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Un momento...
                </>
              ) : (
                <>
                  {mode === "login"
                    ? "Entrar a mi cuenta"
                    : "Crear mi cuenta"}
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* AJUSTES */}
          {settingsOpen && (
            <section className={`${cardClass} p-5 sm:p-6`}>
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-[var(--bb-soft)] text-[var(--bb-accent)]">
                  <Settings size={19} />
                </div>

                <div>
                  <h2 className="font-bold text-[var(--bb-text)]">
                    Ajustes de la cuenta
                  </h2>
                  <p className="mt-0.5 text-xs text-[var(--bb-muted)]">
                    Personaliza tu perfil y tu experiencia
                  </p>
                </div>
              </div>

              {/* SELECTOR DE TEMAS */}
              <div className="mt-5 border-t border-[var(--bb-border)] pt-5">
                <div className="mb-4">
                  <h3 className="font-bold text-[var(--bb-text)]">
                    Apariencia
                  </h3>
                  <p className="mt-1 text-sm text-[var(--bb-muted)]">
                    Elige los colores de tu rincón musical.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {themes.map((themeOption) => {
                    const selected = themeId === themeOption.id;

                    return (
                      <button
                        key={themeOption.id}
                        type="button"
                        onClick={() => setTheme(themeOption.id)}
                        aria-pressed={selected}
                        className={`rounded-2xl border p-3 text-left transition hover:brightness-110 ${
                          selected
                            ? "border-[var(--bb-accent)] ring-2 ring-[var(--bb-accent)]"
                            : "border-[var(--bb-border)]"
                        }`}
                        style={{
                          backgroundColor: themeOption.colors.card,
                          color: themeOption.colors.text,
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold">
                            {themeOption.name}
                          </span>

                          {selected && (
                            <CheckCircle2
                              size={18}
                              style={{
                                color: themeOption.colors.accent,
                              }}
                            />
                          )}
                        </div>

                        <p
                          className="mt-1 text-xs"
                          style={{
                            color: themeOption.colors.muted,
                          }}
                        >
                          {themeOption.description}
                        </p>

                        <div className="mt-3 flex gap-2">
                          {[
                            themeOption.colors.page,
                            themeOption.colors.primary,
                            themeOption.colors.text,
                            themeOption.colors.accent,
                            themeOption.colors.muted,
                          ].map((color, index) => (
                            <span
                              key={`${themeOption.id}-${index}`}
                              className="size-7 rounded-full border border-white/10"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>

                        <div
                          className="mt-3 rounded-xl px-3 py-2 text-center text-xs font-bold"
                          style={{
                            backgroundColor: themeOption.colors.primary,
                            color: themeOption.colors.buttonText,
                          }}
                        >
                          {selected
                            ? "Tema seleccionado"
                            : "Vista previa"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CAMBIAR NOMBRE */}
              <div className="mt-5 border-t border-[var(--bb-border)] pt-5">
                <label
                  htmlFor="profileDisplayName"
                  className={labelClass}
                >
                  Nombre para mostrar
                </label>

                <input
                  id="profileDisplayName"
                  type="text"
                  maxLength={60}
                  value={displayNameInput}
                  onChange={(event) =>
                    setDisplayNameInput(event.target.value)
                  }
                  placeholder="Tu nombre"
                  className={inputClass}
                />

                <button
                  type="button"
                  onClick={saveDisplayName}
                  disabled={savingName || !profile}
                  className={`${primaryButtonClass} mt-3 py-2.5 text-sm`}
                >
                  {savingName && (
                    <LoaderCircle size={16} className="animate-spin" />
                  )}
                  {savingName ? "Guardando..." : "Guardar cambios"}
                </button>

                {!profile && (
                  <p className="mt-2 text-xs text-[var(--bb-muted)]">
                    Necesitas tener un perfil en la base de datos para
                    editar este campo.
                  </p>
                )}
              </div>

              {/* CERRAR SESIÓN */}
              <div className="mt-5 flex items-center justify-between gap-4 border-t border-[var(--bb-border)] pt-5">
                <div>
                  <p className="text-sm font-bold text-[var(--bb-text)]">
                    Cerrar sesión
                  </p>
                  <p className="mt-1 text-xs text-[var(--bb-muted)]">
                    Sal de tu cuenta de BeatBoard.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={signOut}
                  disabled={signingOut}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[var(--bb-border)] px-3 py-2.5 text-sm font-bold text-[var(--bb-text)] transition hover:border-red-400/50 hover:bg-red-950/30 hover:text-red-300 disabled:opacity-50"
                >
                  {signingOut ? (
                    <LoaderCircle
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <LogOut size={16} />
                  )}
                  <span className="hidden sm:inline">
                    {signingOut ? "Saliendo..." : "Salir"}
                  </span>
                </button>
              </div>
            </section>
          )}

          {/* PERFIL */}
          <section className={`${cardClass} p-6 sm:p-8`}>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="relative mx-auto sm:mx-0">
                {profile?.avatar_url ? (
                  <img
                    key={profile.avatar_url}
                    src={profile.avatar_url}
                    alt={`Avatar de ${displayName}`}
                    className="size-28 rounded-full border-[3px] border-[var(--bb-border)] bg-[var(--bb-soft)] object-cover shadow-sm"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="grid size-28 place-items-center rounded-full border-[3px] border-[var(--bb-border)] bg-[var(--bb-soft)] text-[var(--bb-accent)]">
                    <UserRound size={43} />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  aria-label="Cambiar foto de perfil"
                  title="Cambiar foto de perfil"
                  className="absolute bottom-0 right-0 grid size-9 place-items-center rounded-full border-[3px] border-[var(--bb-card)] bg-[var(--bb-primary)] text-[var(--bb-button-text)] transition hover:brightness-125 disabled:opacity-50"
                >
                  {uploadingAvatar ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <Camera size={16} />
                  )}
                </button>

                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={uploadingAvatar}
                />
              </div>

              <div className="min-w-0 flex-1 text-center sm:text-left">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--bb-accent)]">
                  Mi espacio
                </p>

                <h2 className="mt-2 break-words text-2xl font-black tracking-tight text-[var(--bb-text)] sm:text-3xl">
                  {displayName}
                </h2>

                <p className="mt-2 break-all text-sm text-[var(--bb-muted)]">
                  {user.email}
                </p>

                {profile?.role && (
                  <span className="mt-3 inline-flex rounded-full border border-[var(--bb-border)] bg-[var(--bb-soft)] px-3 py-1 text-xs font-semibold capitalize text-[var(--bb-text)]">
                    {profile.role}
                  </span>
                )}

                <p className="mt-4 text-xs text-[var(--bb-muted)]">
                  {uploadingAvatar
                    ? "Actualizando tu foto..."
                    : "JPG, PNG o WEBP · Máximo 2 MB"}
                </p>
              </div>
            </div>

            {!profile && (
              <div className="mt-6 rounded-xl bg-[var(--bb-soft)] p-3 text-sm leading-relaxed text-[var(--bb-muted)]">
                Tu sesión está activa, pero no encontramos tu perfil
                guardado. Comprueba la tabla profiles en Supabase.
              </div>
            )}
          </section>

          {/* BIBLIOTECA */}
          <section>
            <div className="mb-3 flex items-center justify-between px-1">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--bb-muted)]">
                  Tu colección
                </p>
                <h2 className="mt-1 text-xl font-black text-[var(--bb-text)]">
                  Tu música
                </h2>
              </div>
            </div>

            <Link
              to="/biblioteca"
              className="group flex items-center gap-4 rounded-2xl border border-[var(--bb-border)] bg-[var(--bb-card)] p-5 transition hover:bg-[var(--bb-soft)]"
            >
              <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-[var(--bb-soft)] text-[var(--bb-accent)] transition group-hover:brightness-125">
                <Heart size={22} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-[var(--bb-text)]">
                  Mi biblioteca
                </h3>
                <p className="mt-1 text-sm text-[var(--bb-muted)]">
                  Tus canciones favoritas y guardadas.
                </p>
              </div>

              <ChevronRight
                size={20}
                className="shrink-0 text-[var(--bb-muted)] transition group-hover:translate-x-1 group-hover:text-[var(--bb-accent)]"
              />
            </Link>
          </section>

          {/* ARTISTAS */}
          <section>
            <div className="mb-3 px-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--bb-muted)]">
                Para creadores
              </p>
              <h2 className="mt-1 text-xl font-black text-[var(--bb-text)]">
                Tu lado artístico
              </h2>
            </div>

            <Link
              to="/artista"
              className="group flex items-center gap-4 rounded-2xl border border-[var(--bb-border)] bg-[var(--bb-card)] p-5 transition hover:bg-[var(--bb-soft)]"
            >
              <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-[var(--bb-soft)] text-[var(--bb-accent)]">
                <Mic2 size={22} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-[var(--bb-text)]">
                  BeatBoard para artistas
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-[var(--bb-muted)]">
                  Explora cómo crear tu espacio artístico y compartir
                  tu música.
                </p>
              </div>

              <ChevronRight
                size={20}
                className="shrink-0 text-[var(--bb-muted)] transition group-hover:translate-x-1 group-hover:text-[var(--bb-accent)]"
              />
            </Link>
          </section>
        </>
      )}

      {/* PIE DE PÁGINA */}
      <footer className="flex items-center gap-3 px-2 pb-2 pt-1">
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--bb-soft)] text-[var(--bb-accent)]">
          <Disc3 size={20} />
        </div>

        <div>
          <p className="text-sm font-bold text-[var(--bb-text)]">
            Siempre hay una canción para ti.
          </p>
          <p className="mt-1 text-xs text-[var(--bb-muted)]">
            Encuentra tu próximo favorito en BeatBoard.
          </p>
        </div>
      </footer>
    </section>
  );
}