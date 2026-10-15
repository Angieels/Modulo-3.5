import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  Music2,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from "lucide-react";

import {
  GREETING,
  NOT_FOUND,
  STARTERS,
  topicById,
  getMelodyResponse,
} from "../data/melody.js";

function toText(value, fallback = "") {
  let current = value;

  for (let i = 0; i < 5; i += 1) {
    if (typeof current === "string") return current;
    if (typeof current === "number") return String(current);

    if (current && typeof current === "object") {
      if ("text" in current) {
        current = current.text;
        continue;
      }

      if (typeof current.answer === "string") {
        return current.answer;
      }

      if (typeof current.message === "string") {
        return current.message;
      }
    }

    return fallback;
  }

  return fallback;
}

function makeGreeting() {
  return {
    id: `greeting-${Date.now()}`,
    from: "bot",
    text: toText(
      GREETING,
      "¡Hola! Soy Melody, tu asistente de BeatBoard. 🎵"
    ),
    chips: Array.isArray(STARTERS) ? STARTERS : [],
  };
}

export default function Melody({ page = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isMelodyRoute = location.pathname === "/melody";
  const fullPage = page || isMelodyRoute;

  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState(() => [
    makeGreeting(),
  ]);

  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!fullPage && !open) return;

    endRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, fullPage, open]);

  useEffect(() => {
    if (!fullPage && !open) return undefined;

    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 150);

    return () => window.clearTimeout(timer);
  }, [fullPage, open]);

  useEffect(() => {
    const handleOpen = () => navigate("/melody");

    window.addEventListener(
      "beatboard:open-melody",
      handleOpen
    );

    return () => {
      window.removeEventListener(
        "beatboard:open-melody",
        handleOpen
      );
    };
  }, [navigate]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !fullPage) {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [fullPage]);

  function selectTopic(id) {
    const topic =
      typeof id === "string"
        ? topicById?.[id]
        : id;

    if (!topic) return;

    sendMessage(toText(topic.label), topic);
  }

  function sendMessage(userText, selectedTopic = null) {
    const cleanText = toText(userText).trim();

    if (!cleanText) return;

    let result;

    if (selectedTopic) {
      result = {
        text: selectedTopic.answer,
        go: selectedTopic.go ?? null,
        next: selectedTopic.next ?? STARTERS,
      };
    } else {
      result = getMelodyResponse(cleanText);
    }

    const answer = toText(
      result?.text ?? result?.answer,
      toText(NOT_FOUND, "No encontré una respuesta.")
    );

    const nextSuggestions = Array.isArray(result?.next)
      ? result.next
      : Array.isArray(result?.chips)
        ? result.chips
        : Array.isArray(STARTERS)
          ? STARTERS
          : [];

    setMessages((current) => [
      ...current,
      {
        id: `user-${Date.now()}-${Math.random()}`,
        from: "me",
        text: cleanText,
      },
      {
        id: `bot-${Date.now()}-${Math.random()}`,
        from: "bot",
        text: answer,
        go: result?.go ?? null,
        chips: nextSuggestions,
      },
    ]);
  }

  function submit(event) {
    event.preventDefault();

    const question = text.trim();
    if (!question) return;

    setText("");
    sendMessage(question);
  }

  function resetChat() {
    setMessages([makeGreeting()]);
    setText("");

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }

  function goTo(destination) {
    const path =
      typeof destination === "string"
        ? destination
        : destination?.to;

    if (typeof path === "string" && path.startsWith("/")) {
      navigate(path);
    }
  }

  function closeChat() {
    if (fullPage) {
      navigate(-1);
    } else {
      setOpen(false);
    }
  }

  // Evita duplicar el chat global dentro de /melody.
  // Todos los Hooks se ejecutan antes de estas condiciones.
  if (!page && isMelodyRoute) {
    return null;
  }

  // Botón flotante compacto de Melody.
  if (!fullPage && !open) {
    return (
      <button
        type="button"
        onClick={() => navigate("/melody")}
        aria-label="Conversar con Melody"
        title="Hablar con Melody"
        className="fixed bottom-24 right-3 z-40 flex items-center gap-2 rounded-full border border-[var(--bb-border)] bg-[var(--bb-primary)] px-3 py-2 text-sm font-bold text-[var(--bb-button-text)] shadow-lg transition hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bb-accent)] sm:bottom-24 sm:right-5"
      >
        <span className="grid size-7 place-items-center rounded-full bg-white/15">
          <MessageCircle size={16} />
        </span>

        <span>Melody</span>

        <Sparkles size={13} />
      </button>
    );
  }

  return (
    <main
      className={
        fullPage
          ? "min-h-screen bg-[var(--bb-page)] px-4 py-6 text-[var(--bb-text)] sm:px-6 sm:py-8"
          : ""
      }
    >
      <div
        className={
          fullPage
            ? "mx-auto max-w-4xl"
            : "fixed inset-x-3 bottom-3 z-50 flex h-[min(650px,90dvh)] flex-col sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[420px]"
        }
      >
        {fullPage && (
          <>
            <button
              type="button"
              onClick={closeChat}
              className="mb-5 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-[var(--bb-muted)] transition hover:bg-[var(--bb-soft)] hover:text-[var(--bb-text)]"
            >
              <ArrowLeft size={17} />
              Volver
            </button>

            <header className="mb-6">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--bb-accent)]">
                <Sparkles size={17} />
                TU ASISTENTE MUSICAL
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Conversa con Melody 💜
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--bb-muted)] sm:text-base">
                Pregunta sobre BeatBoard, tu perfil de artista,
                canciones, eventos y las herramientas de la plataforma.
              </p>
            </header>
          </>
        )}

        <section
          aria-label="Conversación con Melody"
          className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-[var(--bb-border)] bg-[var(--bb-card)] text-[var(--bb-text)] shadow-xl"
        >
          <header className="flex shrink-0 items-center gap-3 border-b border-[var(--bb-border)] p-4">
            <div className="relative grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--bb-primary)] text-[var(--bb-button-text)]">
              <Music2 size={24} />
              <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-[var(--bb-card)] bg-emerald-500" />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="font-black">Melody</h2>
              <p className="text-xs text-[var(--bb-muted)]">
                Tu asistente musical de BeatBoard
              </p>
            </div>

            <button
              type="button"
              onClick={resetChat}
              title="Reiniciar conversación"
              aria-label="Reiniciar conversación"
              className="grid size-10 place-items-center rounded-xl text-[var(--bb-muted)] transition hover:bg-[var(--bb-soft)]"
            >
              <RotateCcw size={17} />
            </button>

            {!fullPage && (
              <button
                type="button"
                onClick={closeChat}
                title="Cerrar chat"
                aria-label="Cerrar Melody"
                className="grid size-10 place-items-center rounded-xl text-[var(--bb-muted)] transition hover:bg-[var(--bb-soft)]"
              >
                <X size={18} />
              </button>
            )}
          </header>

          <div
            className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-5"
            aria-live="polite"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.from === "me"
                    ? "flex justify-end"
                    : "flex items-start gap-2"
                }
              >
                {message.from !== "me" && (
                  <div className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--bb-primary)] text-[var(--bb-button-text)]">
                    <Music2 size={16} />
                  </div>
                )}

                <div
                  className={
                    message.from === "me"
                      ? "max-w-[85%] rounded-2xl rounded-br-sm bg-[var(--bb-primary)] px-4 py-3 text-[var(--bb-button-text)]"
                      : "max-w-[88%] rounded-2xl rounded-tl-sm border border-[var(--bb-border)] bg-[var(--bb-soft)] px-4 py-3"
                  }
                >
                  <p className="whitespace-pre-wrap break-words text-sm leading-6">
                    {toText(message.text)}
                  </p>

                  {message.from !== "me" && message.go && (
                    <button
                      type="button"
                      onClick={() => goTo(message.go)}
                      className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[var(--bb-primary)] px-3 py-2 text-sm font-bold text-[var(--bb-button-text)]"
                    >
                      {toText(message.go?.label, "Ver sección")}
                      <ArrowRight size={16} />
                    </button>
                  )}

                  {message.from !== "me" &&
                    Array.isArray(message.chips) &&
                    message.chips.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.chips.map((item, index) => {
                          const topic =
                            typeof item === "string"
                              ? topicById?.[item]
                              : item;

                          if (!topic) return null;

                          const id =
                            typeof item === "string"
                              ? item
                              : topic.id ?? `${topic.label}-${index}`;

                          return (
                            <button
                              key={`${id}-${index}`}
                              type="button"
                              onClick={() => selectTopic(item)}
                              className="rounded-full border border-[var(--bb-border)] bg-[var(--bb-card)] px-3 py-2 text-left text-xs font-semibold text-[var(--bb-text)] transition hover:border-[var(--bb-accent)]"
                            >
                              {toText(topic.label, "Ver sugerencia")}
                            </button>
                          );
                        })}
                      </div>
                    )}
                </div>
              </div>
            ))}

            <div ref={endRef} />
          </div>

          <form
            onSubmit={submit}
            className="shrink-0 border-t border-[var(--bb-border)] p-3 sm:p-4"
          >
            <div className="flex items-end gap-2 rounded-2xl border border-[var(--bb-border)] bg-[var(--bb-input)] p-2 focus-within:border-[var(--bb-accent)]">
              <textarea
                ref={inputRef}
                value={text}
                onChange={(event) => setText(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                placeholder="Escribe tu pregunta..."
                aria-label="Escribe tu pregunta para Melody"
                rows={1}
                maxLength={1000}
                className="max-h-28 min-h-10 flex-1 resize-y bg-transparent px-2 py-2 text-sm text-[var(--bb-text)] outline-none placeholder:text-[var(--bb-muted)]"
              />

              <button
                type="submit"
                disabled={!text.trim()}
                aria-label="Enviar mensaje"
                className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--bb-primary)] text-[var(--bb-button-text)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={17} />
              </button>
            </div>

            <p className="mt-2 text-center text-[11px] text-[var(--bb-muted)]">
              Usa las sugerencias o escribe tu pregunta.
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}