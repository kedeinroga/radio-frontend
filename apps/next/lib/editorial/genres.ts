import type { GenreHub } from './types'

const UPDATED = '2026-10-14'

export const GENRE_HUBS: GenreHub[] = [
  {
    slug: 'salsa',
    tag: 'salsa',
    names: { es: 'Salsa', en: 'Salsa', fr: 'Salsa', de: 'Salsa' },
    emoji: '🎺',
    metaTitle: 'Radios de salsa en vivo: escuchar salsa online gratis',
    metaDescription:
      'Escucha radios de salsa en vivo: salsa dura, romántica y clásicos de siempre desde Perú, Colombia, Puerto Rico, Venezuela y Nueva York. Gratis.',
    h1: 'Radios de salsa en vivo',
    intro: [
      'La salsa nació en Nueva York a finales de los años sesenta, de la mano de músicos caribeños que mezclaron el son cubano, el mambo y la guaracha con el jazz y el sonido de la ciudad. Sellos como Fania la llevaron al mundo, y desde entonces la salsa tiene emisoras dedicadas en todo el continente.',
      'En esta página reunimos radios de salsa que transmiten por internet con señal segura, ordenadas por la preferencia de los oyentes. Hay emisoras de Perú, Colombia, Venezuela, Puerto Rico, Estados Unidos y muchos otros países.',
    ],
    sections: [
      {
        heading: 'Estilos que vas a escuchar',
        body: 'La salsa dura o brava, con sus metales potentes y largos solos de percusión, es la de los grandes clásicos de los setenta. La salsa romántica, que dominó los ochenta y noventa, se centra en la voz y en letras de amor. Muchas emisoras combinan ambas con salsa actual y con orquestas locales.\n\nCada país tiene su escena: Cali presume de ser la capital mundial de la salsa, Lima tiene emisoras salseras de enorme audiencia y Venezuela y Puerto Rico dieron algunos de los cantantes más queridos del género.',
      },
      {
        heading: 'Para bailar o para acompañar el día',
        body: 'Las radios de salsa suelen alternar éxitos de baile con bloques de clásicos y especiales dedicados a un artista u orquesta. Si te gusta una emisora, guárdala en Favoritas para volver a ella con un toque.',
      },
    ],
    faq: [
      {
        q: '¿Dónde nació la salsa?',
        a: 'En Nueva York, a finales de los años sesenta, a partir de ritmos cubanos y caribeños como el son, el mambo y la guaracha.',
      },
      {
        q: '¿Qué diferencia hay entre salsa dura y salsa romántica?',
        a: 'La salsa dura destaca por los metales y la percusión; la romántica pone el foco en la voz y en letras de amor, con arreglos más suaves.',
      },
    ],
    related: [
      { label: 'Radio latina: música y cultura', href: '/blog/radio-latina-musica-y-cultura' },
      { label: 'Radios de Perú', href: '/country/PE' },
      { label: 'Radios de Colombia', href: '/country/CO' },
    ],
    updatedAt: UPDATED,
    reviewed: false,
  },
  {
    slug: 'cumbia',
    tag: 'cumbia',
    names: { es: 'Cumbia', en: 'Cumbia', fr: 'Cumbia', de: 'Cumbia' },
    emoji: '🪇',
    metaTitle: 'Radios de cumbia en vivo: escuchar cumbia online gratis',
    metaDescription:
      'Escucha radios de cumbia en vivo: colombiana, peruana, mexicana, argentina y sonidera. Emisoras de cumbia online, gratis y sin registro.',
    h1: 'Radios de cumbia en vivo',
    intro: [
      'La cumbia nació en la costa caribe de Colombia y se convirtió en el ritmo más compartido de América Latina. Cada país la adoptó a su manera, y hoy existen tantas cumbias como países que la bailan.',
      'En esta página encontrarás radios de cumbia que transmiten por internet con señal segura, ordenadas por la preferencia de los oyentes.',
    ],
    sections: [
      {
        heading: 'Una cumbia para cada país',
        body: 'La cumbia colombiana conserva el sonido de gaitas, tambores y acordeón. En Perú surgió la cumbia peruana, con guitarras eléctricas y teclados, de la que derivan la chicha y la cumbia norteña. México tiene la cumbia sonidera y la de los grandes grupos tropicales, y en Argentina nacieron la cumbia santafesina y la cumbia villera.\n\nLas radios de cumbia suelen mezclar éxitos actuales con clásicos de cada escena, y muchas son locales, ideales para quien vive lejos de su ciudad.',
      },
      {
        heading: 'Cómo encontrar tu estilo',
        body: 'Si buscas una cumbia en particular, mira también las páginas de cada país, como Perú, México o Argentina, o escribe el estilo en el buscador.',
      },
    ],
    faq: [
      {
        q: '¿De dónde es la cumbia?',
        a: 'De la región caribe de Colombia. Desde allí se extendió por toda América Latina, donde surgieron variantes como la peruana, la mexicana o la argentina.',
      },
      {
        q: '¿Qué es la chicha?',
        a: 'Es una variante de la cumbia peruana que mezcla cumbia con música andina y guitarras eléctricas, muy popular desde los años setenta.',
      },
    ],
    related: [
      { label: 'Radios de Perú', href: '/country/PE' },
      { label: 'Radios de Argentina', href: '/country/AR' },
      { label: 'Radio latina: música y cultura', href: '/blog/radio-latina-musica-y-cultura' },
    ],
    updatedAt: UPDATED,
    reviewed: false,
  },
  {
    slug: 'reggaeton',
    tag: 'reggaeton',
    names: { es: 'Reguetón', en: 'Reggaeton', fr: 'Reggaeton', de: 'Reggaeton' },
    emoji: '🔥',
    metaTitle: 'Radios de reguetón en vivo: escuchar reggaeton online gratis',
    metaDescription:
      'Escucha radios de reguetón y música urbana en vivo: éxitos actuales y clásicos del género. Emisoras de reggaeton online, gratis y sin registro.',
    h1: 'Radios de reguetón en vivo',
    intro: [
      'El reguetón surgió en los años noventa entre Panamá, con el reggae en español, y Puerto Rico, donde la escena underground mezcló esa base con el hip hop. A mediados de los 2000 se convirtió en un fenómeno global, y hoy la música urbana latina es una de las más escuchadas del mundo.',
      'Aquí tienes radios de reguetón y música urbana que transmiten por internet con señal segura, ordenadas por la preferencia de los oyentes.',
    ],
    sections: [
      {
        heading: 'Del underground a los rankings',
        body: 'Las primeras grabaciones de reguetón circulaban en casetes en Puerto Rico. Con los años el género sumó influencias del dancehall, el pop y el trap, y ciudades como Medellín se convirtieron en grandes centros de producción de música urbana.\n\nLas emisoras dedicadas al género combinan los lanzamientos de la semana con los clásicos que lo popularizaron, y muchas incluyen trap latino, dembow y pop urbano.',
      },
      {
        heading: 'Consejo',
        body: 'Las radios de música urbana suelen tener mucha rotación de novedades. Si quieres escuchar solo clásicos, busca emisoras que se definan como «old school» o «reggaeton clásico».',
      },
    ],
    faq: [
      {
        q: '¿Dónde nació el reguetón?',
        a: 'Entre Panamá y Puerto Rico, en los años noventa, a partir del reggae en español y del hip hop.',
      },
      {
        q: '¿Qué otros géneros suelen sonar en estas radios?',
        a: 'Además del reguetón, es habitual escuchar trap latino, dembow, pop urbano y otros estilos de la música urbana.',
      },
    ],
    related: [
      { label: 'Radios de Colombia', href: '/country/CO' },
      { label: 'Radios de pop', href: '/genre/pop' },
      { label: 'Radio latina: música y cultura', href: '/blog/radio-latina-musica-y-cultura' },
    ],
    updatedAt: UPDATED,
    reviewed: false,
  },
  {
    slug: 'baladas',
    tag: 'balada',
    names: { es: 'Baladas', en: 'Ballads', fr: 'Ballades', de: 'Balladen' },
    emoji: '💗',
    metaTitle: 'Radios de baladas en vivo: música romántica online gratis',
    metaDescription:
      'Escucha radios de baladas y música romántica en vivo: baladas en español de los 70, 80 y 90 y éxitos románticos actuales. Gratis y sin registro.',
    h1: 'Radios de baladas en vivo',
    intro: [
      'La balada romántica en español vivió su época dorada entre los años sesenta y los noventa, con intérpretes de España y América Latina cuyas canciones siguen sonando cada día en la radio. Las emisoras de baladas son de las más fieles de su audiencia: acompañan el trabajo, el tráfico y las noches.',
      'En esta página reunimos radios de baladas y música romántica que transmiten por internet con señal segura, ordenadas por la preferencia de los oyentes.',
    ],
    sections: [
      {
        heading: 'Qué vas a escuchar',
        body: 'Estas emisoras combinan las grandes baladas de cantantes como Camilo Sesto, José José, Rocío Dúrcal o Juan Gabriel con pop romántico más reciente. Algunas se centran en una década concreta y otras mezclan baladas con boleros y música en inglés de los ochenta.\n\nEn muchos países las radios románticas están entre las más escuchadas, como ocurre con Radio Corazón en Perú.',
      },
      {
        heading: 'Para cada momento',
        body: 'Si prefieres canciones de una época concreta, busca emisoras que lo indiquen en su nombre, como «80s» o «clásicos». Guarda tus favoritas para encontrarlas con un toque.',
      },
    ],
    faq: [
      {
        q: '¿Qué es la balada romántica?',
        a: 'Es una canción lenta centrada en la voz y en letras de amor. En español fue especialmente popular entre los años sesenta y noventa.',
      },
      {
        q: '¿Hay radios que solo pongan baladas en español?',
        a: 'Sí, muchas emisoras de esta página se dedican solo a la balada en español; otras la combinan con pop romántico o con música en inglés.',
      },
    ],
    related: [
      { label: 'Radios de pop', href: '/genre/pop' },
      { label: 'Radios de Perú', href: '/country/PE' },
      { label: 'Radio online en español', href: '/blog/radio-online-en-espanol-espana-america-latina' },
    ],
    updatedAt: UPDATED,
    reviewed: false,
  },
  {
    slug: 'regional-mexicana',
    tag: 'regional mexicana',
    names: { es: 'Regional mexicana', en: 'Regional Mexican', fr: 'Musique régionale mexicaine', de: 'Regional Mexicana' },
    emoji: '🤠',
    metaTitle: 'Radios de música regional mexicana en vivo: banda, norteño y más',
    metaDescription:
      'Escucha radios de regional mexicana en vivo: banda, norteño, mariachi, grupero y corridos. Emisoras de México y EE. UU. online, gratis.',
    h1: 'Radios de regional mexicana en vivo',
    intro: [
      'La música regional mexicana reúne los estilos tradicionales y populares de México: la banda sinaloense, el norteño, el mariachi y la ranchera, el grupero y los corridos. Es el formato con más emisoras de México y uno de los más escuchados entre la comunidad mexicana en Estados Unidos.',
      'Aquí encontrarás radios de regional mexicana que transmiten por internet con señal segura, ordenadas por la preferencia de los oyentes.',
    ],
    sections: [
      {
        heading: 'Los estilos del género',
        body: 'La banda, con sus metales y la tuba, es característica de Sinaloa y del occidente del país. El norteño, con acordeón y bajo sexto, viene del norte, y el mariachi y la ranchera son símbolos de la música mexicana en todo el mundo. En los últimos años los corridos, en especial los llamados corridos tumbados, han llevado el género a nuevas generaciones.\n\nLas emisoras suelen mezclar éxitos recientes con clásicos y dedicatorias de los oyentes.',
      },
      {
        heading: 'Radio de México y de Estados Unidos',
        body: 'Muchas de estas emisoras están en México y otras en ciudades de Estados Unidos con gran población mexicana. Si buscas una emisora de tu ciudad, usa el buscador.',
      },
    ],
    faq: [
      {
        q: '¿Qué estilos incluye la música regional mexicana?',
        a: 'Banda, norteño, mariachi y ranchera, grupero, duranguense y corridos, entre otros.',
      },
      {
        q: '¿Hay radios de regional mexicana en Estados Unidos?',
        a: 'Sí, es uno de los formatos de radio en español más escuchados en Estados Unidos.',
      },
    ],
    related: [
      { label: 'Radios de México', href: '/country/MX' },
      { label: 'Guía de radio online en México', href: '/blog/radio-online-mexico-guia-completa-emisoras' },
      { label: 'Radios de Estados Unidos', href: '/country/US' },
    ],
    updatedAt: UPDATED,
    reviewed: false,
  },
  {
    slug: 'rock',
    tag: 'rock',
    names: { es: 'Rock', en: 'Rock', fr: 'Rock', de: 'Rock' },
    emoji: '🎸',
    metaTitle: 'Radios de rock en vivo: escuchar rock online gratis',
    metaDescription:
      'Escucha radios de rock en vivo: rock clásico, rock en español, alternativo y metal. Emisoras de rock de todo el mundo, online y gratis.',
    h1: 'Radios de rock en vivo',
    intro: [
      'El rock es uno de los géneros con más emisoras en internet. Desde las radios de rock clásico que repasan los años sesenta y setenta hasta las de rock alternativo o metal, hay una emisora para cada etapa y cada estilo.',
      'En esta página reunimos radios de rock que transmiten con señal segura, ordenadas por la preferencia de los oyentes de todo el mundo.',
    ],
    sections: [
      {
        heading: 'Rock en español',
        body: 'El rock en español tiene una historia propia. Argentina desarrolló desde finales de los sesenta el llamado rock nacional, y en los ochenta y noventa bandas de Argentina, México, España, Chile y Colombia, como Soda Stereo, Caifanes, Héroes del Silencio, Los Prisioneros o Aterciopelados, llenaron estadios en todo el continente. Muchas emisoras dedican su programación a esa tradición.',
      },
      {
        heading: 'Estilos y emisoras',
        body: 'Además del rock clásico, encontrarás radios de hard rock, punk, indie, alternativo y metal. Algunas emisoras se centran en una década y otras mezclan clásicos con novedades. Si quieres algo concreto, prueba el buscador con el estilo que buscas, como «metal» o «indie».',
      },
    ],
    faq: [
      {
        q: '¿Hay radios de rock en español?',
        a: 'Sí, hay muchas emisoras dedicadas al rock en español, sobre todo en Argentina, México, España y Chile.',
      },
      {
        q: '¿Puedo escuchar radios de metal?',
        a: 'Sí, entre las radios de rock hay emisoras especializadas en heavy metal y sus variantes. También puedes buscarlas por nombre.',
      },
    ],
    related: [
      { label: 'Las mejores radios de rock en español', href: '/blog/mejores-radios-de-rock-en-espanol' },
      { label: 'Radios de Argentina', href: '/country/AR' },
      { label: 'Radios de Estados Unidos', href: '/country/US' },
    ],
    updatedAt: UPDATED,
    reviewed: false,
  },
  {
    slug: 'pop',
    tag: 'pop',
    names: { es: 'Pop', en: 'Pop', fr: 'Pop', de: 'Pop' },
    emoji: '🎤',
    metaTitle: 'Radios de pop en vivo: éxitos y música pop online gratis',
    metaDescription:
      'Escucha radios de pop en vivo: los éxitos del momento, pop latino, pop en inglés y clásicos de los 80 y 90. Emisoras online, gratis y sin registro.',
    h1: 'Radios de pop en vivo',
    intro: [
      'El pop es el formato más extendido de la radio musical: emisoras de éxitos que repasan las canciones más escuchadas del momento, junto a radios dedicadas al pop de décadas pasadas. Es el género con más emisoras en internet.',
      'Aquí tienes radios de pop que transmiten con señal segura, ordenadas por la preferencia de los oyentes.',
    ],
    sections: [
      {
        heading: 'Pop en español y en inglés',
        body: 'Las radios de éxitos en español mezclan pop latino, música urbana y baladas pop, mientras que las emisoras en inglés siguen el formato de los «top 40». Las radios de clásicos se dedican al pop de los ochenta, los noventa o los dos mil, y algunas se especializan en K-pop, J-pop o pop europeo.',
      },
      {
        heading: 'Para descubrir música nueva',
        body: 'Las emisoras de éxitos actualizan su programación cada semana, así que son una buena forma de descubrir lanzamientos. Si prefieres los clásicos, busca radios con una década en el nombre.',
      },
    ],
    faq: [
      {
        q: '¿Qué es una radio «top 40»?',
        a: 'Es un formato que repite las canciones más populares del momento, basado en las listas de éxitos.',
      },
      {
        q: '¿Hay radios de pop de los 80 y 90?',
        a: 'Sí, muchas emisoras se dedican a los éxitos de una década concreta.',
      },
    ],
    related: [
      { label: 'Radios de baladas', href: '/genre/baladas' },
      { label: 'Radios de reguetón', href: '/genre/reggaeton' },
      { label: 'Radio online, Spotify y podcasts: diferencias', href: '/blog/diferencias-radio-online-spotify-podcasts' },
    ],
    updatedAt: UPDATED,
    reviewed: false,
  },
  {
    slug: 'jazz',
    tag: 'jazz',
    names: { es: 'Jazz', en: 'Jazz', fr: 'Jazz', de: 'Jazz' },
    emoji: '🎷',
    metaTitle: 'Radios de jazz en vivo: escuchar jazz online gratis',
    metaDescription:
      'Escucha radios de jazz en vivo: jazz clásico, bebop, smooth jazz y jazz latino. Las mejores emisoras de jazz del mundo, online y gratis.',
    h1: 'Radios de jazz en vivo',
    intro: [
      'El jazz nació en Nueva Orleans a principios del siglo XX y se convirtió en una de las músicas más influyentes del mundo. La radio por internet es ideal para el jazz: hay emisoras especializadas en cada época y estilo que funcionan las 24 horas, muchas de ellas sin publicidad.',
      'En esta página reunimos radios de jazz que transmiten con señal segura, ordenadas por la preferencia de los oyentes.',
    ],
    sections: [
      {
        heading: 'Estilos de jazz',
        body: 'Encontrarás emisoras de jazz clásico y swing, de bebop y hard bop, de cool jazz, de jazz fusión y de smooth jazz, más relajado y melódico. El jazz latino, que une el jazz con ritmos cubanos y caribeños, tiene también sus propias radios.\n\nMuchas de las emisoras de jazz más escuchadas en internet son proyectos independientes o radios públicas y universitarias de Estados Unidos y Europa.',
      },
      {
        heading: 'Calidad de sonido',
        body: 'Para el jazz vale la pena elegir emisoras con buena calidad de audio. El bitrate aparece en la ficha de cada emisora: 128 kbps o más suena bien en auriculares.',
      },
    ],
    faq: [
      {
        q: '¿Dónde nació el jazz?',
        a: 'En Nueva Orleans, Estados Unidos, a principios del siglo XX.',
      },
      {
        q: '¿Qué es el smooth jazz?',
        a: 'Es un estilo de jazz más suave y melódico, muy usado en radios para escuchar de fondo.',
      },
    ],
    related: [
      { label: 'Las mejores radios de jazz online', href: '/blog/mejores-radios-de-jazz-online' },
      { label: 'Radios de música clásica', href: '/genre/clasica' },
      { label: 'Radios de Estados Unidos', href: '/country/US' },
    ],
    updatedAt: UPDATED,
    reviewed: false,
  },
  {
    slug: 'clasica',
    tag: ['classical music', 'opera', 'baroque', 'música clásica'],
    names: { es: 'Clásica', en: 'Classical', fr: 'Classique', de: 'Klassik' },
    emoji: '🎻',
    metaTitle: 'Radios de música clásica en vivo: escuchar clásica online gratis',
    metaDescription:
      'Escucha radios de música clásica en vivo: sinfónica, ópera, barroco y música de cámara. Emisoras de clásica de todo el mundo, online y gratis.',
    h1: 'Radios de música clásica en vivo',
    intro: [
      'La música clásica tiene en la radio uno de sus mejores aliados. Las radios públicas de muchos países mantienen canales dedicados a la música clásica, como Radio Clásica en España, BBC Radio 3 en el Reino Unido o France Musique en Francia, con conciertos en directo, ópera y programas divulgativos.',
      'Aquí reunimos emisoras de música clásica que transmiten por internet con señal segura, ordenadas por la preferencia de los oyentes.',
    ],
    sections: [
      {
        heading: 'Qué vas a escuchar',
        body: 'Hay emisoras generalistas que recorren todos los periodos, del barroco al siglo XX, y otras especializadas en ópera, música de cámara, piano o bandas sonoras de cine. Muchas radios públicas emiten conciertos grabados en los grandes auditorios de su país.\n\nLa música clásica es también una de las favoritas para estudiar o trabajar, porque acompaña sin distraer.',
      },
      {
        heading: 'Calidad de audio',
        body: 'Para la música clásica conviene una buena calidad de sonido: las emisoras de mayor bitrate reproducen mejor los matices de una orquesta. El dato aparece en la ficha de cada emisora.',
      },
    ],
    faq: [
      {
        q: '¿Qué radios públicas tienen canales de música clásica?',
        a: 'Muchas, por ejemplo Radio Clásica de RNE en España, BBC Radio 3 en el Reino Unido o France Musique en Francia.',
      },
      {
        q: '¿Es buena la música clásica para estudiar?',
        a: 'Mucha gente la usa para concentrarse porque no tiene letra y acompaña sin distraer.',
      },
    ],
    related: [
      { label: 'Las mejores radios de música clásica', href: '/blog/mejores-radios-de-musica-clasica-online' },
      { label: 'Radio para trabajar: lofi, ambient y chillhop', href: '/blog/radio-online-para-trabajar-lofi-ambient-chillhop' },
      { label: 'Radios de jazz', href: '/genre/jazz' },
    ],
    updatedAt: UPDATED,
    reviewed: false,
  },
  {
    slug: 'electronica',
    tag: 'electronic',
    names: { es: 'Electrónica', en: 'Electronic', fr: 'Électronique', de: 'Elektronisch' },
    emoji: '🎧',
    metaTitle: 'Radios de música electrónica en vivo: house, techno y más',
    metaDescription:
      'Escucha radios de música electrónica en vivo: house, techno, trance, drum and bass, ambient y chill. Emisoras online, gratis y sin registro.',
    h1: 'Radios de música electrónica en vivo',
    intro: [
      'La música electrónica creció de la mano de los clubes, los DJ y, desde muy pronto, de internet. Muchas de las primeras radios online fueron emisoras de electrónica, y hoy hay radios dedicadas a casi cualquier subgénero.',
      'En esta página reunimos radios de música electrónica que transmiten con señal segura, ordenadas por la preferencia de los oyentes.',
    ],
    sections: [
      {
        heading: 'Subgéneros',
        body: 'El house nació en Chicago y el techno en Detroit en los años ochenta; de ahí surgieron el trance, el drum and bass, el dubstep y muchos otros estilos. También hay emisoras de ambient, downtempo y chill, ideales para trabajar o descansar, y radios que emiten sesiones de DJ en directo.',
      },
      {
        heading: 'Para trabajar o para la fiesta',
        body: 'Si buscas música de fondo, prueba las emisoras de ambient o chill; si quieres energía, las de house o techno. Guarda tus favoritas para volver a ellas con un toque.',
      },
    ],
    faq: [
      {
        q: '¿Dónde nacieron el house y el techno?',
        a: 'El house en Chicago y el techno en Detroit, ambos en los años ochenta.',
      },
      {
        q: '¿Hay radios de electrónica para trabajar?',
        a: 'Sí, las emisoras de ambient, downtempo o chill son muy usadas como música de fondo.',
      },
    ],
    related: [
      { label: 'Las mejores radios de electrónica y dance', href: '/blog/mejores-radios-de-electronica-y-dance-online' },
      { label: 'Radio para trabajar: lofi, ambient y chillhop', href: '/blog/radio-online-para-trabajar-lofi-ambient-chillhop' },
      { label: 'Radios de pop', href: '/genre/pop' },
    ],
    updatedAt: UPDATED,
    reviewed: false,
  },
  {
    slug: 'noticias',
    tag: 'noticias',
    names: { es: 'Noticias', en: 'News', fr: 'Actualités', de: 'Nachrichten' },
    emoji: '📰',
    metaTitle: 'Radios de noticias en vivo: emisoras informativas online gratis',
    metaDescription:
      'Escucha radios de noticias en vivo en español: informativos, entrevistas y opinión de España y América Latina. Emisoras online, gratis.',
    h1: 'Radios de noticias en vivo',
    intro: [
      'La radio sigue siendo el medio más inmediato para informarse: cuando ocurre algo importante, las emisoras informativas lo cuentan en directo, con corresponsales, entrevistas y la voz de los oyentes. En esta página reunimos radios de noticias en español que transmiten por internet con señal segura.',
      'Las emisoras están ordenadas por la preferencia de los oyentes y hay radios de España y de toda América Latina.',
    ],
    sections: [
      {
        heading: 'Informativos de cada país',
        body: 'Cada país tiene sus radios de referencia para la información: emisoras como RPP en Perú, la Cadena SER o COPE en España, Radio Mitre en Argentina, Cooperativa en Chile o las grandes cadenas de Colombia y México dedican la mañana a noticieros y entrevistas, y el resto del día a programas de análisis y actualidad.\n\nEscuchar radios de varios países es también una buena forma de conocer cómo se cuenta una misma noticia desde distintos lugares.',
      },
      {
        heading: 'Noticias desde el extranjero',
        body: 'Si vives fuera de tu país, las radios informativas son la forma más rápida de seguir la actualidad nacional. Guarda tus emisoras en Favoritas para tenerlas siempre a mano.',
      },
    ],
    faq: [
      {
        q: '¿Puedo escuchar radios de noticias de otros países?',
        a: 'Sí, todas las emisoras de esta página transmiten por internet y se escuchan desde cualquier país.',
      },
      {
        q: '¿Las noticias se emiten en directo?',
        a: 'Sí, la señal online es la misma que la emisión en directo de la radio.',
      },
    ],
    related: [
      { label: 'Las mejores radios de noticias del mundo', href: '/blog/mejores-radios-de-noticias-del-mundo' },
      { label: 'Radios de España', href: '/country/ES' },
      { label: 'Radios de Perú', href: '/country/PE' },
    ],
    updatedAt: UPDATED,
    reviewed: false,
  },
  {
    slug: 'deportes',
    tag: 'deporte',
    names: { es: 'Deportes', en: 'Sports', fr: 'Sports', de: 'Sport' },
    emoji: '⚽',
    metaTitle: 'Radios deportivas en vivo: fútbol y deportes online gratis',
    metaDescription:
      'Escucha radios deportivas en vivo: fútbol, transmisiones de partidos, análisis y tertulias en español. Emisoras de deportes online, gratis.',
    h1: 'Radios deportivas en vivo',
    intro: [
      'En el mundo hispanohablante, el fútbol y la radio van de la mano. Los relatos de los goles, las tertulias de los lunes y los programas que siguen la jornada partido a partido forman parte de la cultura popular de países como Argentina, España, México, Colombia o Uruguay.',
      'En esta página reunimos radios deportivas en español que transmiten por internet con señal segura, ordenadas por la preferencia de los oyentes.',
    ],
    sections: [
      {
        heading: 'Qué vas a escuchar',
        body: 'Las radios deportivas combinan transmisiones en vivo, programas de análisis, entrevistas y debate. En España, los carruseles deportivos de fin de semana siguen todos los partidos de la jornada; en América Latina, los relatores de fútbol son verdaderas figuras de la radio.\n\nAdemás del fútbol, muchas emisoras cubren baloncesto, tenis, ciclismo, Fórmula 1 y otros deportes.',
      },
      {
        heading: 'Derechos de transmisión',
        body: 'Algunas emisoras no pueden emitir ciertos partidos en su señal online por derechos de transmisión, o los restringen a su país. Si una transmisión no se escucha durante un partido, puede deberse a esa limitación y no a un fallo de la emisora.',
      },
    ],
    faq: [
      {
        q: '¿Puedo escuchar partidos de fútbol en vivo?',
        a: 'Muchas radios transmiten partidos en directo, aunque algunas los restringen en su señal online por derechos de transmisión.',
      },
      {
        q: '¿Hay radios deportivas que no sean solo de fútbol?',
        a: 'Sí, muchas cubren también baloncesto, tenis, automovilismo y otros deportes.',
      },
    ],
    related: [
      { label: 'Radios de Argentina', href: '/country/AR' },
      { label: 'Radios de España', href: '/country/ES' },
      { label: 'Radios de noticias', href: '/genre/noticias' },
    ],
    updatedAt: UPDATED,
    reviewed: false,
  },
]
