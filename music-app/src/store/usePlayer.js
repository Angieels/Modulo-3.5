import { create } from 'zustand'
import { Howl } from 'howler'

let howl, timer

export const usePlayer = create((set, get) => {
  const load = (i) => {
    const { queue } = get()
    if (!queue || queue.length === 0) return
    
    const n = (i + queue.length) % queue.length
    const currentTrack = queue[n]

    console.log("Reproduciendo desde URL:", currentTrack?.src) // Para depurar en consola

    clearInterval(timer)
    howl?.unload()

    howl = new Howl({
      src: [currentTrack.src],
      html5: true, // Vital para archivos de audio grandes (streaming)
      onplay: () => {
        set({ playing: true })
        clearInterval(timer)
        timer = setInterval(() => {
          const p = howl.seek()
          if (typeof p === 'number') set({ pos: p, dur: howl.duration() })
        }, 250)
      },
      onpause: () => set({ playing: false }),
      onend: () => get().next(),
      // 🔍 ESTOS DOS ERRORES TE SALVARÁN LA VIDA SI EL LINK FALLA:
      onloaderror: (id, err) => {
        console.error("Error al cargar el audio de Supabase:", err, "URL:", currentTrack.src)
      },
      onplayerror: (id, err) => {
        console.error("Error al reproducir el audio:", err)
        howl.once('unlock', () => howl.play())
      }
    })

    set({ index: n, pos: 0, dur: 0 })
    howl.play()
  }

  return {
    queue: [], index: -1, playing: false, pos: 0, dur: 0, open: false,
    play: (queue, i) => { set({ queue }); load(i) },
    toggle: () => (howl?.playing() ? howl.pause() : howl?.play()),
    next: () => load(get().index + 1),
    prev: () => load(get().index - 1),
    seek: (p) => { howl?.seek(p); set({ pos: p }) },
    setOpen: (open) => set({ open }),
  }
})