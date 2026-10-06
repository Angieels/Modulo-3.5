const g = (a, b) => `linear-gradient(135deg, ${a}, ${b})`
const s = (n) => `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`

// Datos de prueba: cambia nombres y src por los reales cuando tengas backend
export const tracks = [
  { id: 1, title: 'Noche de Volcán', artist: 'Luna Cuscatleca', plays: '12.4K', cover: g('#e0517a', '#3a1322'), src: s(1) },
  { id: 2, title: 'Pupusa de Medianoche', artist: 'Los Pipiles', plays: '9.8K', cover: g('#f4c97a', '#c2410c'), src: s(2) },
  { id: 3, title: 'Cuscatlán Eterno', artist: 'Marea Verde', plays: '8.1K', cover: g('#34d399', '#134e4a'), src: s(3) },
  { id: 4, title: 'Lluvia de Mayo', artist: 'Ximena Ayala', plays: '7.3K', cover: g('#a78bfa', '#312e81'), src: s(4) },
  { id: 5, title: 'Bajo el Izote', artist: 'Colectivo Anil', plays: '5.9K', cover: g('#fb7185', '#7c2d12'), src: s(5) },
  { id: 6, title: 'Camino al Boquerón', artist: 'Luna Cuscatleca', plays: '4.2K', cover: g('#67e8f9', '#1e3a8a'), src: s(6) },
]