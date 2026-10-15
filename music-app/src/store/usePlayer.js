
import { create } from "zustand";
import { Howl } from "howler";
import { Capacitor } from "@capacitor/core";
import { Playlist } from "capacitor-plugin-playlist";

let howl;
let timer;
let nativeReadyPromise = null;

// Detecta si BeatBoard se está ejecutando como aplicación nativa.
const isNative = () => Capacitor.isNativePlatform();

const stopTimer = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

// Adapta los datos de las canciones de BeatBoard al formato nativo.
const toNativeTrack = (track, index) => ({
  trackId: String(
    track.id ??
    track.track_id ??
    track.uuid ??
    `beatboard-track-${index}`
  ),
  assetUrl: track.src,
  title:
    track.title ??
    track.name ??
    track.song_title ??
    "Canción sin título",
  artist:
    track.artist ??
    track.artist_name ??
    track.author ??
    "Artista desconocido",
  album:
    track.album ??
    track.album_name ??
    "BeatBoard",
  albumArt:
    track.albumArt ??
    track.cover_url ??
    track.cover ??
    track.image_url ??
    track.artwork_url ??
    "",
  isStream: true,
});

async function ensureNativeReady() {
  if (!nativeReadyPromise) {
    nativeReadyPromise = (async () => {
      await Playlist.setOptions({
        verbose: false,
        resetStreamOnPause: false,
      });

      await Playlist.initialize();

      await Playlist.setLoop({ loop: true });

      await Playlist.addListener("status", ({ status }) => {
        const value = status?.value ?? {};
        const msgType = status?.msgType;

        switch (msgType) {
          // Reproducción iniciada o reanudada.
          case 30:
            usePlayer.setState({ playing: true });
            break;

          // Pausa.
          case 35:
            usePlayer.setState({ playing: false });
            break;

          // Progreso de reproducción.
          case 40:
          case 45:
          case 55: {
            const update = {};

            if (typeof value.currentPosition === "number") {
              update.pos = value.currentPosition;
            }

            if (typeof value.duration === "number") {
              update.dur = value.duration;
            }

            if (Object.keys(update).length) {
              usePlayer.setState(update);
            }
            break;
          }

          // Cambio de canción, incluido el cambio desde
          // los controles de la pantalla bloqueada.
          case 100: {
            const nextIndex = value.currentIndex;

            if (
              typeof nextIndex === "number" &&
              nextIndex >= 0
            ) {
              usePlayer.setState({
                index: nextIndex,
                pos: 0,
                dur: 0,
              });
            }
            break;
          }

          // Fin de toda la lista.
          case 105:
            usePlayer.setState({
              playing: false,
              pos: 0,
            });
            break;

          // Error de carga o reproducción.
          case 5:
            console.error(
              "Error del reproductor nativo:",
              value.message ?? value
            );
            usePlayer.setState({ playing: false });
            break;

          default:
            break;
        }
      });
    })();
  }

  try {
    await nativeReadyPromise;
  } catch (error) {
    nativeReadyPromise = null;
    throw error;
  }
}

export const usePlayer = create((set, get) => {
  // Reproducción web original mediante Howler.
  const loadWeb = (i) => {
    const { queue } = get();

    if (!queue?.length) return;

    const n = ((i % queue.length) + queue.length) % queue.length;
    const currentTrack = queue[n];

    if (!currentTrack?.src) {
      console.error("La canción no tiene una URL válida:", currentTrack);
      return;
    }

    console.log("Reproduciendo desde URL:", currentTrack.src);

    stopTimer();
    howl?.unload();

    howl = new Howl({
      src: [currentTrack.src],
      html5: true,

      onplay: () => {
        set({ playing: true });
        stopTimer();

        timer = setInterval(() => {
          if (!howl) return;

          const position = howl.seek();
          const duration = howl.duration();

          set({
            pos: typeof position === "number" ? position : 0,
            dur: Number.isFinite(duration) ? duration : 0,
          });
        }, 250);
      },

      onpause: () => {
        stopTimer();
        set({ playing: false });
      },

      onstop: () => {
        stopTimer();
        set({ playing: false });
      },

      onend: () => {
        get().next();
      },

      onloaderror: (id, error) => {
        console.error(
          "Error al cargar el audio:",
          error,
          "URL:",
          currentTrack.src
        );
        set({ playing: false });
      },

      onplayerror: (id, error) => {
        console.error("Error al reproducir el audio:", error);

        howl?.once("unlock", () => {
          howl?.play();
        });
      },
    });

    set({
      index: n,
      pos: 0,
      dur: 0,
      playing: false,
    });

    howl.play();
  };

  // En Android/iOS la lista se entrega al reproductor nativo.
  const loadNative = async (i) => {
    const { queue } = get();

    if (!queue?.length) return;

    const n = ((i % queue.length) + queue.length) % queue.length;

    const items = queue.map((track, index) => {
      if (!track?.src) {
        throw new Error(
          `La canción en la posición ${index} no tiene una URL válida.`
        );
      }

      return toNativeTrack(track, index);
    });

    stopTimer();
    howl?.unload();
    howl = null;

    set({
      index: n,
      pos: 0,
      dur: 0,
      playing: false,
    });

    await ensureNativeReady();

    await Playlist.setPlaylistItems({
      items,
      options: { startPaused: true },
    });

    await Playlist.playTrackByIndex({ index: n });
  };

  const load = async (i) => {
    try {
      if (isNative()) {
        await loadNative(i);
      } else {
        loadWeb(i);
      }
    } catch (error) {
      console.error("No se pudo iniciar el reproductor:", error);
      set({ playing: false });
    }
  };

  return {
    queue: [],
    index: -1,
    playing: false,
    pos: 0,
    dur: 0,
    open: false,

    play: (queue, i = 0) => {
      if (!Array.isArray(queue) || queue.length === 0) {
        console.warn("No hay canciones para reproducir.");
        return;
      }

      set({ queue });
      return load(i);
    },

    toggle: async () => {
      try {
        if (isNative()) {
          await ensureNativeReady();

          if (get().playing) {
            await Playlist.pause();
          } else {
            await Playlist.play();
          }

          return;
        }

        if (howl?.playing()) {
          howl.pause();
        } else if (howl) {
          howl.play();
        } else {
          const { queue, index } = get();

          if (queue.length) {
            await load(index >= 0 ? index : 0);
          }
        }
      } catch (error) {
        console.error("No se pudo cambiar la reproducción:", error);
      }
    },

    next: async () => {
      const { queue, index } = get();

      if (!queue.length) return;

      if (isNative()) {
        try {
          await ensureNativeReady();
          await Playlist.skipForward();
        } catch (error) {
          console.error("No se pudo avanzar:", error);
        }
      } else {
        await load(index + 1);
      }
    },

    prev: async () => {
      const { queue, index } = get();

      if (!queue.length) return;

      if (isNative()) {
        try {
          await ensureNativeReady();
          await Playlist.skipBack();
        } catch (error) {
          console.error("No se pudo retroceder:", error);
        }
      } else {
        await load(index - 1);
      }
    },

    seek: async (p) => {
      const position = Math.max(0, Number(p) || 0);

      if (isNative()) {
        try {
          await ensureNativeReady();
          await Playlist.seekTo({ position });
          set({ pos: position });
        } catch (error) {
          console.error("No se pudo cambiar la posición:", error);
        }
      } else if (howl) {
        howl.seek(position);
        set({ pos: position });
      }
    },

    setOpen: (open) => set({ open }),
  };
});
