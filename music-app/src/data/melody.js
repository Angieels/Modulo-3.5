
/* =========================================================
   BEATBOARD — MELODY BRAIN
   Archivo: src/data/melody.js

   Responsabilidades:
   - Comprender preguntas en español.
   - Reconocer palabras con o sin tildes.
   - Detectar intenciones mediante palabras clave.
   - Responder preguntas sobre BeatBoard.
   - Recomendar acciones y páginas.
   - Ofrecer sugerencias para continuar la conversación.
   - Manejar saludos, agradecimientos y mensajes desconocidos.

   Compatible con Melody.jsx mediante:
   GREETING, NOT_FOUND, STARTERS, MELODY_TOPICS,
   topicById, normalize y findTopic.
========================================================= */

/* =========================================================
   1. MENSAJES GENERALES
========================================================= */

export const GREETING = {
  text: "¡Holaaa! 🎵 Soy Melody, tu asistente de BeatBoard. Puedo ayudarte a descubrir música, utilizar el reproductor, administrar tu biblioteca o resolver dudas sobre tu cuenta. ¿Qué necesitas?",
};

export const NOT_FOUND = {
  text: "Mmm, todavía no tengo una respuesta exacta para eso. 🎧 Puedes preguntarme cómo buscar canciones, utilizar el reproductor, administrar tu biblioteca o gestionar tu perfil de artista.",
  next: [
    "¿Cómo busco canciones?",
    "¿Cómo funciona el reproductor?",
    "¿Cómo subo una canción?",
    "¿Cómo cambio mi foto?",
  ],
};

/* =========================================================
   2. PREGUNTAS SUGERIDAS
========================================================= */

export const STARTERS = [
  "¿Qué es BeatBoard?",
  "¿Cómo busco música?",
  "¿Cómo funciona el reproductor?",
  "¿Cómo guardo canciones?",
  "¿Cómo cambio mi foto?",
  "¿Cómo cambio el tema?",
  "¿Cómo subo una canción?",
  "¿Cómo creo un álbum?",
];

/* =========================================================
   3. BASE DE CONOCIMIENTO
=========================================================

   Estructura de cada tema:
   id       Identificador único.
   title    Nombre del tema.
   keywords Frases que Melody puede reconocer.
   answer   Respuesta que verá el usuario.
   go       Ruta opcional para navegar desde Melody.
   next     Preguntas sugeridas para continuar.
========================================================= */

export const MELODY_TOPICS = [
  /* -------------------------------------------------------
     SALUDOS Y CONVERSACIÓN
  ------------------------------------------------------- */

  {
    id: "saludo",
    title: "Saludos",
    keywords: [
      "hola",
      "holaa",
      "holaaa",
      "holi",
      "buenos dias",
      "buenas tardes",
      "buenas noches",
      "que tal",
      "hey melody",
      "hola melody",
      "buenas melody",
      "que onda",
      "como estas",
      "como va todo",
    ],
    answer:
      "¡Holaaa! 💜 Qué gusto tenerte por aquí. Estoy lista para ayudarte con BeatBoard, tu música y todas las funciones de la plataforma. ¿Qué te gustaría hacer?",
    next: [
      "¿Qué es BeatBoard?",
      "Quiero escuchar música",
      "Necesito ayuda con mi cuenta",
    ],
  },

  {
    id: "ayuda",
    title: "Ayuda general",
    keywords: [
      "ayuda",
      "necesito ayuda",
      "puedes ayudarme",
      "como funciona beatboard",
      "que puedo hacer",
      "que haces",
      "para que sirves",
      "que sabes hacer",
      "como se usa la pagina",
      "como utilizar la plataforma",
      "estoy perdido",
      "no entiendo la pagina",
    ],
    answer:
      "¡Claro! 🎶 Puedo orientarte sobre cómo descubrir música, usar el reproductor, administrar tu biblioteca, configurar tu perfil y utilizar las herramientas para artistas. También puedo ayudarte a identificar dónde encontrar cada función.",
    next: [
      "¿Cómo busco música?",
      "¿Cómo funciona el reproductor?",
      "¿Qué herramientas tienen los artistas?",
      "¿Cómo configuro mi perfil?",
    ],
  },

  {
    id: "que_es_beatboard",
    title: "Qué es BeatBoard",
    keywords: [
      "que es beatboard",
      "para que sirve beatboard",
      "que es esta plataforma",
      "que es esta aplicacion",
      "que es esta pagina",
      "sobre beatboard",
      "informacion de beatboard",
      "explicame beatboard",
    ],
    answer:
      "BeatBoard es una plataforma musical diseñada para descubrir y escuchar música. Según las funciones habilitadas en tu cuenta, también puedes administrar tu biblioteca y acceder a herramientas para artistas, como canciones, álbumes, eventos y estadísticas financieras.",
    next: [
      "¿Cómo descubro música?",
      "¿Cómo guardo canciones?",
      "¿Qué puede hacer un artista?",
    ],
  },

  /* -------------------------------------------------------
     DESCUBRIR Y ESCUCHAR MÚSICA
  ------------------------------------------------------- */

  {
    id: "escuchar",
    title: "Escuchar música",
    keywords: [
      "escuchar musica",
      "quiero escuchar musica",
      "poner musica",
      "reproducir musica",
      "donde escucho musica",
      "como escuchar canciones",
      "quiero oir musica",
      "reproducir una cancion",
      "quiero poner una cancion",
      "musica para escuchar",
    ],
    answer:
      "¡Vamos con la música! 🎧 Entra en la sección donde se muestran las canciones y selecciona una para reproducirla. Si ya tienes el reproductor activo, utiliza sus controles para pausar, reanudar o cambiar de canción.",
    go: "/",
    next: [
      "¿Cómo busco una canción?",
      "¿Cómo funciona el reproductor?",
      "¿Cómo guardo mis favoritas?",
    ],
  },

  {
    id: "buscar",
    title: "Buscar música",
    keywords: [
      "buscar",
      "busqueda",
      "buscador",
      "buscar musica",
      "buscar canciones",
      "buscar artistas",
      "buscar albumes",
      "encontrar musica",
      "encontrar una cancion",
      "donde encuentro una cancion",
      "como encuentro musica",
      "no encuentro una cancion",
      "quiero encontrar un artista",
      "buscar por genero",
      "buscar por nombre",
    ],
    answer:
      "🔎 Para encontrar música, abre la sección de búsqueda de BeatBoard, si está disponible en tu navegación. Escribe el nombre de una canción o de un artista y revisa los resultados. Si no aparece, prueba con una parte del nombre o verifica la escritura.",
    go: "/search",
    next: [
      "¿Cómo escucho una canción?",
      "¿Cómo encuentro artistas?",
      "¿Cómo guardo canciones?",
    ],
  },

  {
    id: "generos",
    title: "Géneros musicales",
    keywords: [
      "generos",
      "genero musical",
      "tipo de musica",
      "tipos de musica",
      "reggaeton",
      "rock",
      "pop",
      "jazz",
      "electronica",
      "musica urbana",
      "musica clasica",
      "musica alternativa",
      "clasificar musica",
    ],
    answer:
      "🎼 Los géneros ayudan a organizar la música por estilo. Si BeatBoard tiene filtros o categorías de género habilitados, puedes utilizarlos para encontrar canciones que coincidan con tus gustos. También puedes buscar directamente por el nombre de un género.",
    next: [
      "¿Cómo busco música?",
      "¿Cómo encuentro artistas?",
      "¿Cómo reproduzco una canción?",
    ],
  },

  {
    id: "artistas_descubrir",
    title: "Descubrir artistas",
    keywords: [
      "descubrir artistas",
      "encontrar artistas",
      "buscar cantante",
      "buscar un artista",
      "conocer artistas",
      "artistas nuevos",
      "musica de un artista",
      "perfil de artista",
      "quien canta",
    ],
    answer:
      "🎤 Para encontrar a un artista, utiliza la búsqueda por nombre si está disponible o revisa las secciones de música y descubrimiento. Desde el perfil de un artista puedes consultar la información que haya publicado en BeatBoard.",
    next: [
      "¿Cómo busco música?",
      "¿Cómo funciona el perfil de artista?",
      "¿Cómo encuentro álbumes?",
    ],
  },

  /* -------------------------------------------------------
     REPRODUCTOR
  ------------------------------------------------------- */

  {
    id: "reproductor",
    title: "Reproductor musical",
    keywords: [
      "reproductor",
      "player",
      "como funciona el reproductor",
      "controles de musica",
      "pausar musica",
      "reanudar musica",
      "siguiente cancion",
      "cancion anterior",
      "adelantar cancion",
      "barra de progreso",
      "controlar volumen",
      "subir volumen",
      "bajar volumen",
      "no puedo reproducir",
      "la musica no suena",
      "no se escucha la cancion",
    ],
    answer:
      "🎵 El reproductor permite controlar la reproducción de las canciones. Según los controles disponibles, puedes reproducir o pausar, avanzar o retroceder entre canciones, ajustar el volumen y consultar el progreso. Si no se escucha nada, revisa el volumen del dispositivo y vuelve a iniciar la canción.",
    next: [
      "¿Por qué no se escucha la música?",
      "¿Cómo cambio de canción?",
      "¿Cómo guardo una canción?",
    ],
  },

  {
    id: "audio_error",
    title: "Problemas de audio",
    keywords: [
      "no suena",
      "no se escucha",
      "no hay sonido",
      "audio no funciona",
      "error de audio",
      "cancion no reproduce",
      "musica detenida",
      "audio detenido",
      "no carga la cancion",
      "la cancion se queda cargando",
      "reproduccion falla",
      "no reproduce nada",
      "no funciona el player",
      "problemas con el sonido",
      "problema con el audio",
    ],
    answer:
      "🔧 Vamos a revisar el audio. Prueba estos pasos:\n\n1. Comprueba el volumen de tu dispositivo y del reproductor.\n2. Verifica que la canción tenga una fuente de audio válida.\n3. Intenta reproducir otra canción.\n4. Recarga BeatBoard y vuelve a intentarlo.\n5. Si continúa el problema, puede existir un error en el archivo o en la conexión.\n\nSi falla una sola canción, es posible que el problema esté en ese archivo y no en todo el reproductor.",
    next: [
      "¿Cómo funciona el reproductor?",
      "No puedo encontrar una canción",
      "Tengo otro problema",
    ],
  },

  {
    id: "cola",
    title: "Cola de reproducción",
    keywords: [
      "cola",
      "cola de reproduccion",
      "lista de reproduccion",
      "orden de canciones",
      "cambiar orden",
      "siguiente en la cola",
      "reproduccion continua",
      "que sigue despues",
    ],
    answer:
      "🎶 La cola de reproducción sirve para organizar qué canción se escucha después. Si tu versión de BeatBoard incluye esta función, busca los controles o la lista de reproducción asociados al reproductor.",
    next: [
      "¿Cómo cambio de canción?",
      "¿Cómo funciona el reproductor?",
    ],
  },

  /* -------------------------------------------------------
     BIBLIOTECA, FAVORITOS Y ÁLBUMES
  ------------------------------------------------------- */

  {
    id: "biblioteca",
    title: "Biblioteca musical",
    keywords: [
      "biblioteca",
      "mi biblioteca",
      "musica guardada",
      "canciones guardadas",
      "donde esta mi musica",
      "mis canciones",
      "mi coleccion",
      "coleccion musical",
      "biblioteca musical",
      "ver mis canciones",
    ],
    answer:
      "📚 Tu biblioteca es el lugar donde puedes consultar el contenido musical que tengas organizado o guardado, según las funciones habilitadas en tu cuenta. Busca la opción Biblioteca en la navegación de BeatBoard.",
    go: "/library",
    next: [
      "¿Cómo guardo una canción?",
      "¿Cómo encuentro mis canciones?",
      "¿Cómo creo un álbum?",
    ],
  },

  {
    id: "favoritos",
    title: "Canciones favoritas",
    keywords: [
      "favoritos",
      "favoritas",
      "me gusta",
      "dar like",
      "guardar cancion",
      "guardar canciones",
      "marcar favorita",
      "anadir a favoritos",
      "agregar a favoritos",
      "quitar de favoritos",
      "canciones que me gustan",
      "corazon de canciones",
    ],
    answer:
      "💜 Si BeatBoard muestra un botón de Me gusta o un corazón junto a una canción, puedes utilizarlo para marcarla como favorita. Después, revisa tu biblioteca o la sección correspondiente para encontrar las canciones guardadas. La ubicación exacta depende de las funciones activadas en tu versión.",
    next: [
      "¿Dónde está mi biblioteca?",
      "¿Cómo busco música?",
      "¿Cómo funciona el reproductor?",
    ],
  },

  {
    id: "albumes",
    title: "Álbumes musicales",
    keywords: [
      "album",
      "albumes",
      "disco",
      "discos",
      "ver albumes",
      "buscar album",
      "buscar albumes",
      "crear album",
      "nuevo album",
      "administrar albumes",
      "mis albumes",
      "editar album",
      "publicar album",
      "subir un album",
    ],
    answer:
      "💿 Los álbumes permiten agrupar canciones como parte de un mismo lanzamiento. Para explorar álbumes, entra en la sección correspondiente si está disponible. Si tienes un perfil de artista, busca la administración de álbumes para crear o gestionar tus lanzamientos.",
    go: "/artist/albums",
    next: [
      "¿Cómo creo un álbum?",
      "¿Cómo subo una canción?",
      "¿Cómo edito mi perfil de artista?",
    ],
  },

  {
    id: "album_crear",
    title: "Crear un álbum",
    keywords: [
      "como creo un album",
      "como crear un album",
      "crear nuevo album",
      "registrar album",
      "publicar un album",
      "subir un disco",
      "anadir canciones al album",
      "agregar canciones al album",
      "crear lanzamiento",
      "nuevo lanzamiento musical",
    ],
    answer:
      "💿 Para crear un álbum como artista, abre la administración de álbumes. Si tienes acceso a esa función, completa los datos que solicite el formulario, guarda los cambios y sigue las opciones disponibles para asociar canciones. Si no aparece la sección, verifica que hayas iniciado sesión con una cuenta de artista.",
    go: "/artist/albums",
    next: [
      "¿Cómo subo una canción?",
      "¿Cómo edito mi perfil de artista?",
      "¿Dónde veo mis canciones?",
    ],
  },

  /* -------------------------------------------------------
     CUENTA Y PERFIL
  ------------------------------------------------------- */

  {
    id: "cuenta",
    title: "Cuenta de usuario",
    keywords: [
      "cuenta",
      "mi cuenta",
      "configurar cuenta",
      "datos de mi cuenta",
      "informacion de cuenta",
      "configuracion de cuenta",
      "ajustes de cuenta",
      "cerrar sesion",
      "salir de mi cuenta",
      "iniciar sesion",
      "entrar a mi cuenta",
      "registrarme",
      "crear cuenta",
      "crear usuario",
    ],
    answer:
      "👤 Para administrar tu cuenta, busca tu perfil o el menú de configuración de BeatBoard. Desde allí podrás acceder a las opciones que estén habilitadas para tu usuario. Si necesitas iniciar sesión, asegúrate de utilizar las credenciales correctas.",
    go: "/profile",
    next: [
      "¿Cómo cambio mi foto?",
      "¿Cómo cambio el tema?",
      "Tengo problemas con mi cuenta",
    ],
  },

  {
    id: "cuenta_problema",
    title: "Problemas con la cuenta",
    keywords: [
      "no puedo entrar",
      "no puedo iniciar sesion",
      "problemas con mi cuenta",
      "mi cuenta no funciona",
      "no me deja entrar",
      "olvide mi contrasena",
      "recuperar contrasena",
      "restablecer contrasena",
      "cuenta bloqueada",
      "error al iniciar sesion",
      "no puedo registrarme",
      "fallo de autenticacion",
      "problema de login",
    ],
    answer:
      "🔐 Si tienes problemas para entrar, revisa que tu correo y contraseña estén escritos correctamente. Comprueba también tu conexión y si BeatBoard muestra algún mensaje de error. Si olvidaste tu contraseña, utiliza la opción de recuperación si está habilitada. No compartas tu contraseña con nadie, ni siquiera conmigo.",
    next: [
      "¿Cómo configuro mi cuenta?",
      "¿Cómo cambio mi foto?",
      "Tengo otro problema",
    ],
  },

  {
    id: "perfil",
    title: "Perfil personal",
    keywords: [
      "perfil",
      "mi perfil",
      "editar perfil",
      "modificar perfil",
      "actualizar perfil",
      "datos personales",
      "nombre de usuario",
      "cambiar nombre",
      "editar informacion",
      "informacion personal",
      "configurar perfil",
    ],
    answer:
      "✨ Puedes administrar tu perfil desde la sección de perfil o configuración de BeatBoard. Allí encontrarás los campos que tu cuenta tenga habilitados para editar, como tu información pública o los datos de presentación.",
    go: "/profile",
    next: [
      "¿Cómo cambio mi foto?",
      "¿Cómo cambio el tema?",
      "¿Cómo administro mi cuenta?",
    ],
  },

  {
    id: "foto",
    title: "Foto de perfil",
    keywords: [
      "foto",
      "foto de perfil",
      "cambiar foto",
      "cambiar mi foto",
      "subir foto",
      "imagen de perfil",
      "cambiar imagen",
      "avatar",
      "poner una foto",
      "actualizar foto",
      "editar avatar",
      "foto de usuario",
    ],
    answer:
      "🖼️ Para cambiar tu foto, abre tu perfil y busca la opción para editarlo o cargar una imagen. Selecciona una imagen compatible, espera a que termine la carga y guarda los cambios. Si no aparece esa opción, puede que la edición de la foto no esté habilitada para tu cuenta.",
    go: "/profile",
    next: [
      "¿Cómo edito mi perfil?",
      "¿Cómo cambio el tema?",
      "¿Cómo administro mi cuenta?",
    ],
  },

  {
    id: "tema",
    title: "Tema visual",
    keywords: [
      "tema",
      "modo oscuro",
      "modo claro",
      "tema oscuro",
      "tema claro",
      "cambiar tema",
      "cambiar apariencia",
      "apariencia",
      "colores de la pagina",
      "fondo de la pagina",
      "dark mode",
      "light mode",
      "personalizar colores",
    ],
    answer:
      "🎨 Puedes cambiar la apariencia desde el selector de tema de BeatBoard, si está habilitado en tu interfaz. Busca la opción de tema o apariencia para alternar entre los modos disponibles. Melody puede orientarte, pero no cambia el tema automáticamente.",
    next: [
      "¿Cómo edito mi perfil?",
      "¿Cómo funciona BeatBoard?",
    ],
  },

  /* -------------------------------------------------------
     HERRAMIENTAS PARA ARTISTAS
  ------------------------------------------------------- */

  {
    id: "artista",
    title: "Panel de artista",
    keywords: [
      "artista",
      "panel de artista",
      "dashboard",
      "panel del artista",
      "herramientas de artista",
      "area de artista",
      "administrar artista",
      "soy artista",
      "cuenta de artista",
      "gestionar mi musica",
      "administrar mi musica",
    ],
    answer:
      "🎤 El área de artista reúne herramientas para gestionar tu presencia musical en BeatBoard. Dependiendo de los permisos de tu cuenta, puedes encontrar funciones para administrar tu perfil, canciones, álbumes, eventos, finanzas y reseñas.",
    go: "/artist/dashboard",
    next: [
      "¿Cómo subo una canción?",
      "¿Cómo creo un álbum?",
      "¿Cómo administro mis eventos?",
      "¿Dónde veo mis finanzas?",
    ],
  },

  {
    id: "dashboard",
    title: "Panel de control",
    keywords: [
      "dashboard",
      "panel principal",
      "resumen de artista",
      "estadisticas",
      "estadisticas de artista",
      "resumen de mi cuenta",
      "metricas",
      "datos de mi musica",
      "rendimiento musical",
      "panel de control",
    ],
    answer:
      "📊 El panel de control de artista sirve como resumen de la información que BeatBoard tenga disponible para tu cuenta. Revisa sus indicadores para consultar los datos y accesos que estén habilitados.",
    go: "/artist/dashboard",
    next: [
      "¿Cómo administro mis canciones?",
      "¿Dónde veo mis finanzas?",
      "¿Cómo reviso mis eventos?",
    ],
  },

  {
    id: "canciones_artista",
    title: "Administrar canciones",
    keywords: [
      "mis canciones",
      "administrar canciones",
      "gestionar canciones",
      "canciones de artista",
      "subir cancion",
      "subir canciones",
      "publicar cancion",
      "publicar musica",
      "cargar cancion",
      "cargar musica",
      "editar cancion",
      "eliminar cancion",
      "registrar cancion",
      "nueva cancion",
      "mis lanzamientos",
    ],
    answer:
      "🎵 Desde la sección de canciones del área de artista puedes consultar las opciones disponibles para administrar tu música. Para publicar una canción, abre el formulario correspondiente, completa los datos solicitados y carga los archivos compatibles. Revisa la información antes de guardar.",
    go: "/artist/songs",
    next: [
      "¿Cómo subo una canción?",
      "¿Qué formato de audio necesito?",
      "¿Cómo creo un álbum?",
    ],
  },

  {
    id: "subir_cancion",
    title: "Subir una canción",
    keywords: [
      "como subir una cancion",
      "como subo una cancion",
      "subir mi musica",
      "subir audio",
      "cargar archivo de audio",
      "publicar mi musica",
      "publicar una cancion",
      "agregar cancion",
      "anadir cancion",
      "registrar una cancion",
      "quiero subir musica",
      "quiero publicar musica",
    ],
    answer:
      "🎙️ Para subir una canción:\n\n1. Entra en tu área de artista.\n2. Abre la sección de canciones.\n3. Selecciona la opción para agregar una canción.\n4. Completa los datos solicitados, como título y género, si aparecen.\n5. Selecciona el archivo de audio y la portada si el formulario las solicita.\n6. Revisa los datos y guarda.\n\nLas opciones exactas dependen del formulario configurado en tu versión de BeatBoard.",
    go: "/artist/songs",
    next: [
      "¿Qué formato de audio necesito?",
      "¿Cómo creo un álbum?",
      "¿Por qué falla la carga?",
    ],
  },

  {
    id: "formato_audio",
    title: "Formato de audio",
    keywords: [
      "formato de audio",
      "formatos de audio",
      "tipo de archivo de audio",
      "archivo mp3",
      "mp3",
      "wav",
      "ogg",
      "flac",
      "calidad de audio",
      "peso del audio",
      "tamano del archivo",
      "archivo de musica",
      "que formato acepta",
      "que formatos acepta beatboard",
    ],
    answer:
      "🎧 El formato aceptado depende de cómo esté configurada la carga de archivos en BeatBoard. Antes de subir una canción, revisa los formatos admitidos por el formulario o por el almacenamiento de tu proyecto. No conviene asumir que todos los formatos de audio están permitidos.",
    go: "/artist/songs",
    next: [
      "¿Cómo subo una canción?",
      "¿Por qué falla la carga?",
    ],
  },

  {
    id: "eventos",
    title: "Eventos musicales",
    keywords: [
      "eventos",
      "evento",
      "conciertos",
      "concierto",
      "presentaciones",
      "presentacion en vivo",
      "fechas de conciertos",
      "mis eventos",
      "crear evento",
      "crear concierto",
      "publicar evento",
      "administrar eventos",
      "editar evento",
      "eliminar evento",
      "proximos conciertos",
    ],
    answer:
      "📅 La sección de eventos del área de artista puede servir para organizar las presentaciones y actividades musicales que publiques en BeatBoard. Entra en Eventos para revisar las opciones disponibles para crear, consultar o editar registros.",
    go: "/artist/events",
    next: [
      "¿Cómo creo un evento?",
      "¿Cómo administro mi perfil de artista?",
      "¿Dónde veo mis finanzas?",
    ],
  },

  {
    id: "crear_evento",
    title: "Crear un evento",
    keywords: [
      "como crear un evento",
      "como creo un evento",
      "agregar evento",
      "publicar concierto",
      "crear concierto",
      "registrar evento",
      "anadir presentacion",
      "crear presentacion",
      "programar concierto",
      "agendar concierto",
    ],
    answer:
      "📅 Para registrar un evento, entra en la sección Eventos de tu área de artista y busca la opción de crear o agregar uno. Completa los campos que solicite el formulario, verifica la fecha y la información del lugar y guarda los cambios.",
    go: "/artist/events",
    next: [
      "¿Cómo administro mis eventos?",
      "¿Cómo edito mi perfil de artista?",
    ],
  },

  {
    id: "finanzas",
    title: "Finanzas de artista",
    keywords: [
      "finanzas",
      "dinero",
      "ingresos",
      "ganancias",
      "pagos",
      "mis pagos",
      "cuanto he ganado",
      "cuanto dinero tengo",
      "balance",
      "saldo",
      "recaudacion",
      "reporte financiero",
      "ingresos musicales",
      "dinero de mi musica",
      "estadisticas financieras",
    ],
    answer:
      "💰 En la sección de Finanzas de tu área de artista puedes consultar la información financiera que BeatBoard tenga habilitada para tu cuenta. Los importes, movimientos y reportes disponibles dependen de la implementación de la plataforma. Si no ves información, comprueba que tu cuenta tenga acceso a esa sección.",
    go: "/artist/finances",
    next: [
      "¿Dónde veo mis eventos?",
      "¿Cómo accedo al panel de artista?",
      "Tengo problemas con mi cuenta",
    ],
  },

  {
    id: "resenas",
    title: "Reseñas y opiniones",
    keywords: [
      "resenas",
      "reseñas",
      "opiniones",
      "comentarios",
      "valoraciones",
      "calificaciones",
      "calificacion de mi musica",
      "reseñas de artistas",
      "ver comentarios",
      "leer opiniones",
      "mis reseñas",
      "valoracion de canciones",
    ],
    answer:
      "⭐ Si tu área de artista tiene habilitada la sección de Reseñas, puedes entrar allí para consultar las opiniones o valoraciones disponibles. La información que se muestra depende de los registros existentes y de las funciones activas en BeatBoard.",
    go: "/artist/reviews",
    next: [
      "¿Cómo administro mis canciones?",
      "¿Cómo accedo al panel de artista?",
      "¿Cómo edito mi perfil?",
    ],
  },

  /* -------------------------------------------------------
     PRIVACIDAD Y SEGURIDAD
  ------------------------------------------------------- */

  {
    id: "privacidad",
    title: "Privacidad",
    keywords: [
      "privacidad",
      "mis datos",
      "datos personales",
      "informacion privada",
      "quien ve mi informacion",
      "datos de usuario",
      "seguridad de mi cuenta",
      "proteger mi cuenta",
      "es seguro beatboard",
      "mis datos estan seguros",
    ],
    answer:
      "🔒 Cuida tu información personal y comparte únicamente lo necesario. Revisa las opciones de privacidad y las políticas oficiales de BeatBoard para conocer cómo se gestionan tus datos. Nunca compartas contraseñas, códigos de acceso ni información bancaria en el chat.",
    next: [
      "¿Cómo configuro mi cuenta?",
      "Tengo problemas con mi cuenta",
    ],
  },

  /* -------------------------------------------------------
     ERRORES Y SOPORTE
  ------------------------------------------------------- */

  {
    id: "problemas",
    title: "Problemas generales",
    keywords: [
      "error",
      "errores",
      "no funciona",
      "no sirve",
      "esta fallando",
      "se rompio",
      "problema tecnico",
      "problemas tecnicos",
      "pagina caida",
      "pantalla en blanco",
      "no carga la pagina",
      "se queda cargando",
      "algo salio mal",
      "me aparece un error",
      "fallo en beatboard",
      "bug",
    ],
    answer:
      "🛠️ ¡Vamos a revisarlo! Primero, recarga la página y comprueba tu conexión. Si el problema continúa, intenta repetir la acción y fíjate en el mensaje de error. Si me dices qué estabas haciendo y qué ocurrió, puedo orientarte con pasos más específicos.",
    next: [
      "La música no se escucha",
      "Tengo problemas con mi cuenta",
      "No puedo subir una canción",
    ],
  },

  {
    id: "contacto",
    title: "Contacto y soporte",
    keywords: [
      "contacto",
      "soporte",
      "soporte tecnico",
      "contactar soporte",
      "contactar al equipo",
      "hablar con alguien",
      "ayuda humana",
      "correo de soporte",
      "correo de contacto",
      "reportar problema",
      "reportar error",
      "enviar reporte",
      "atencion al cliente",
    ],
    answer:
      "📩 Si necesitas ayuda del equipo de BeatBoard, busca un canal oficial de contacto o soporte dentro de la plataforma. No quiero inventarte un correo o teléfono que quizá no exista. Si me cuentas qué problema tienes, puedo ayudarte a identificar los pasos para revisarlo.",
    next: [
      "Tengo un problema técnico",
      "Tengo problemas con mi cuenta",
      "No puedo subir una canción",
    ],
  },

  /* -------------------------------------------------------
     AGRADECIMIENTOS Y DESPEDIDAS
  ------------------------------------------------------- */

  {
    id: "gracias",
    title: "Agradecimientos",
    keywords: [
      "gracias",
      "muchas gracias",
      "mil gracias",
      "te agradezco",
      "gracias melody",
      "perfecto gracias",
      "me ayudaste",
      "eres genial",
      "excelente ayuda",
    ],
    answer:
      "¡De nada! 💜 Para eso estoy. Cuando necesites una mano con BeatBoard o quieras descubrir alguna de sus funciones, aquí me tienes. 🎶",
    next: [
      "¿Qué más puedes hacer?",
      "¿Cómo busco música?",
      "¿Cómo subo una canción?",
    ],
  },

  {
    id: "despedida",
    title: "Despedidas",
    keywords: [
      "adios",
      "hasta luego",
      "nos vemos",
      "chao",
      "bye",
      "me voy",
      "hasta pronto",
      "hasta la proxima",
      "adios melody",
      "me despido",
    ],
    answer:
      "¡Nos vemos! 💜 Que nunca te falte la música. Aquí estaré cuando vuelvas a necesitar ayuda con BeatBoard. 🎧",
    next: [
      "¿Qué más puedes hacer?",
      "¿Cómo descubro música?",
    ],
  },
];

/* =========================================================
   4. ÍNDICE DE TEMAS
========================================================= */

export const topicById = Object.fromEntries(
  MELODY_TOPICS.map((topic) => [topic.id, topic])
);

/* =========================================================
   5. NORMALIZACIÓN DE TEXTO
=========================================================

   Convierte:
   "¿Cómo subo MÚSICA?" -> "como subo musica"

   También elimina signos repetidos y espacios sobrantes.
========================================================= */

export function normalize(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?¡!.,;:()[\]{}"'`´]/g, " ")
    .replace(/[_/\\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* =========================================================
   6. DETECCIÓN DE PALABRAS Y FRASES
========================================================= */

function containsPhrase(text, phrase) {
  const normalizedPhrase = normalize(phrase);

  if (!normalizedPhrase) return false;

  // Evita coincidencias parciales como "rock" dentro de otra palabra.
  const escaped = normalizedPhrase.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

  const pattern = new RegExp(
    `(?:^|\\s)${escaped}(?:$|\\s)`,
    "i"
  );

  return pattern.test(text);
}

function keywordScore(text, keyword) {
  const normalizedKeyword = normalize(keyword);

  if (!normalizedKeyword) return 0;

  // Las frases específicas tienen mayor peso.
  if (containsPhrase(text, normalizedKeyword)) {
    const words = normalizedKeyword.split(" ").length;

    return normalizedKeyword.length + words * 4;
  }

  // Para frases largas también aceptamos coincidencias parciales
  // en mensajes más extensos, por ejemplo:
  // "oye, quiero saber cómo funciona el reproductor musical".
  if (
    normalizedKeyword.length >= 7 &&
    text.includes(normalizedKeyword)
  ) {
    return normalizedKeyword.length;
  }

  return 0;
}

/* =========================================================
   7. DETECCIÓN DE INTENCIÓN
=========================================================

   Devuelve el tema más probable o null si no encuentra
   una coincidencia suficientemente clara.

   Ejemplo:
   findTopic("¿Cómo subo una canción?")
   -> topicById.subir_cancion
========================================================= */

export function findTopic(message = "") {
  const text = normalize(message);

  if (!text) return null;

  let bestTopic = null;
  let bestScore = 0;

  for (const topic of MELODY_TOPICS) {
    let score = 0;

    for (const keyword of topic.keywords ?? []) {
      score += keywordScore(text, keyword);
    }

    // Una coincidencia más específica debe ganar.
    if (score > bestScore) {
      bestScore = score;
      bestTopic = topic;
    }
  }

  // Evita responder sobre un tema por una coincidencia débil.
  return bestScore >= 7 ? bestTopic : null;
}

/* =========================================================
   8. RESPUESTA COMPLETA PARA EL CHAT
=========================================================

   Úsala si prefieres centralizar la lógica del cerebro.

   Devuelve un objeto con:
   text  -> respuesta
   topic -> tema identificado o null
   go    -> ruta opcional
   next  -> sugerencias
========================================================= */

export function getMelodyResponse(message = "") {
  const text = normalize(message);

  if (!text) {
    return {
      text: "Escríbeme una pregunta y con gusto te ayudo. 🎵",
      topic: null,
      go: null,
      next: STARTERS.slice(0, 4),
    };
  }

  const topic = findTopic(text);

  if (!topic) {
    return {
      text: NOT_FOUND.text,
      topic: null,
      go: null,
      next: NOT_FOUND.next ?? STARTERS.slice(0, 4),
    };
  }

  return {
    text: topic.answer,
    topic: topic.id,
    go: topic.go ?? null,
    next: topic.next ?? [],
  };
}

/* =========================================================
   9. UTILIDADES PARA LA INTERFAZ
========================================================= */

/**
 * Busca un tema por su ID.
 *
 * Ejemplo:
 * getTopicById("reproductor")
 */
export function getTopicById(id) {
  return topicById[id] ?? null;
}

/**
 * Devuelve sugerencias de conversación.
 *
 * Si el tema tiene sugerencias, las utiliza.
 * Si no, utiliza las sugerencias generales.
 */
export function getMelodySuggestions(topicId = null) {
  const topic = topicId ? getTopicById(topicId) : null;

  if (topic?.next?.length) {
    return topic.next;
  }

  return STARTERS;
}

/**
 * Detecta si el mensaje parece un saludo.
 */
export function isGreeting(message = "") {
  return findTopic(message)?.id === "saludo";
}

/**
 * Detecta si el mensaje parece una despedida.
 */
export function isGoodbye(message = "") {
  return findTopic(message)?.id === "despedida";
}

/**
 * Detecta si el mensaje parece un agradecimiento.
 */
export function isThanks(message = "") {
  return findTopic(message)?.id === "gracias";
}

/* =========================================================
   10. FUNCIÓN PRINCIPAL OPCIONAL
=========================================================

   Puedes utilizar esta función desde Melody.jsx:

   const result = getMelodyResponse(userMessage);

   result.text -> texto para mostrar
   result.go   -> ruta opcional
   result.next -> botones sugeridos

   Nota:
   Este cerebro utiliza reglas y palabras clave.
   No es un modelo de inteligencia artificial generativa,
   ni consulta automáticamente la base de datos.
========================================================= */
