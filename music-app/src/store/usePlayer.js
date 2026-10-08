import { create } from 'zustand'
import { Howl } from 'howler'

let howl, timer

export const usePlayer = create((set, get) => {
  const load = (i) => {
    const { queue } = get()
    const n = (i + queue.length) % queue.length
    clearInterval(timer)
    howl?.unload()
    howl = new Howl({
      src: [queue[n].src],
      html5: true,
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