// Shared site content used by BOTH the HTML pages and the markdown variant
// (Accept: text/markdown). Keeping one source of truth guarantees the two
// representations never drift apart.

export interface ContentSection {
  heading: string;
  paragraphs: string[];
}

export const SITE_NAME = "LUB ENERGY";
export const SITE_DESCRIPTION =
  "Tienda de suplementos deportivos en Corrientes capital, Argentina. Local físico en Junín 2183 y envíos a todo el país.";
export const WHATSAPP_DISPLAY = "+54 379 505-6878";
export const WHATSAPP_LINK = "https://wa.me/543795056878";
export const CONTACT_EMAIL = "Lubenergy1324@gmail.com";
export const INSTAGRAM_URL = "https://www.instagram.com/lub_energy/";
export const INSTAGRAM_HANDLE = "@lub_energy";
export const MAPS_URL =
  "https://maps.app.goo.gl/t9xvJ8Hc1tGEebCu7";
export const ADDRESS_LINE = "Junín 2183, Corrientes capital, Argentina";
export const BUSINESS_HOURS = "Lunes a sábado de 9:00 a 21:00";

// ---------------------------------------------------------------------------
// Nosotros (/about)
// ---------------------------------------------------------------------------

export const ABOUT_TITLE = "Quiénes somos";
export const ABOUT_INTRO =
  "LUB ENERGY es una tienda de suplementos deportivos con local físico en Junín 2183, Corrientes capital, Argentina, y tienda online con envíos a todo el país.";

export const ABOUT_SECTIONS: ContentSection[] = [
  {
    heading: "Nuestra historia",
    paragraphs: [
      "LUB ENERGY nació en Corrientes capital con una misión clara: acercar los mejores productos de nutrición deportiva a quienes buscan superarse día a día. Arrancamos como un proyecto pequeño atendido por sus propios dueños y hoy combinamos un local físico en el centro de Corrientes con una tienda online que llega a todas las provincias de Argentina.",
      "Creemos que el rendimiento se construye con constancia, buena alimentación y los suplementos adecuados. Por eso seleccionamos cada producto con el mismo compromiso que ponemos al atender a cada cliente.",
    ],
  },
  {
    heading: "Qué vendemos",
    paragraphs: [
      "Trabajamos proteínas whey, creatina monohidrato, pre-entrenos, aminoácidos BCAA, glutamina, quemadores de grasa, vitaminas, colágeno y suplementos para rendimiento deportivo de marcas reconocidas del mercado.",
      "Todos los productos son originales: cada suplemento pasa por nuestra selección de calidad antes de llegar a la góndola o al courier.",
    ],
  },
  {
    heading: "Por qué elegirnos",
    paragraphs: [
      "Local físico verifiable en Junín 2183 (Corrientes) al que podés entrar, ver los productos y preguntar lo que quieras. Atención personalizada por WhatsApp para ayudarte a elegir el suplemento correcto según tu objetivo. Precios en pesos argentinos actualizados en la web, promociones por cantidad y envíos a domicilio a todo el país.",
    ],
  },
];

// ---------------------------------------------------------------------------
// Contacto (/contact)
// ---------------------------------------------------------------------------

export const CONTACT_TITLE = "Contacto";
export const CONTACT_INTRO =
  "Estamos para ayudarte a elegir tu suplemento, resolver dudas de pago o seguir un pedido. Escribinos por el canal que prefieras: respondemos todos los días hábiles.";

export interface ContactChannel {
  label: string;
  value: string;
  href: string;
  external?: boolean;
}

export const CONTACT_CHANNELS: ContactChannel[] = [
  { label: "WhatsApp", value: WHATSAPP_DISPLAY, href: WHATSAPP_LINK, external: true },
  { label: "Email", value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
  { label: "Dirección", value: ADDRESS_LINE, href: MAPS_URL, external: true },
  { label: "Instagram", value: INSTAGRAM_HANDLE, href: INSTAGRAM_URL, external: true },
];

export const CONTACT_SECTIONS: ContentSection[] = [
  {
    heading: "Horarios de atención",
    paragraphs: [
      `El local atiende ${BUSINESS_HOURS}. El WhatsApp se monitorea fuera de horario y se responde al reabrir.`,
    ],
  },
  {
    heading: "Seguimiento de pedidos",
    paragraphs: [
      "Si ya hiciste una compra online, podés seguir el estado de tu pedido sin hablar con nadie: entrá a la URL de seguimiento que te enviamos al confirmar la compra (formato lubenergy.com.ar/pedido/TU-ID) y vas a ver el estado actual, el código de seguimiento del correo y el resumen de artículos.",
    ],
  },
];

// ---------------------------------------------------------------------------
// Privacidad (/privacy)
// ---------------------------------------------------------------------------

export const PRIVACY_TITLE = "Política de privacidad";
export const PRIVACY_INTRO =
  "Esta política explica qué datos personales recoge lubenergy.com.ar, para qué los usa, con quién los comparte y cómo ejercer tus derechos. Última actualización: agosto de 2026.";

export const PRIVACY_SECTIONS: ContentSection[] = [
  {
    heading: "Qué datos recogemos",
    paragraphs: [
      "Datos que nos das directamente al comprar o consultar: nombre, email, teléfono, dirección de envío y localidad. Datos técnicos mínimos generados al navegar: identificadores anónimos de medición de tráfico y uso del sitio.",
      "No almacenamos datos de tarjetas de crédito: los pagos se coordinan por canales externos (transferencia o pago contra entrega coordinado por WhatsApp).",
    ],
  },
  {
    heading: "Para qué los usamos",
    paragraphs: [
      "Procesar y despachar tu pedido, avisarte el estado del envío, responder tus consultas y, solo si lo autorizás, enviarte promociones. Los datos técnicos se usan de forma agregada para mejorar el sitio.",
    ],
  },
  {
    heading: "Con quién los compartimos",
    paragraphs: [
      "Solo con quien es imprescindible para entregarte la compra: el correo o servicio de mensajería que realiza el envío (recibe nombre, dirección y teléfono). No vendemos ni alquilamos datos personales a terceros.",
    ],
  },
  {
    heading: "Cookies y medición",
    paragraphs: [
      "Usamos almacenamiento local del navegador para mantener el carrito de compras entre visitas y herramientas de medición (Microsoft Clarity) que registran navegación anónima para detectar errores y mejorar la experiencia. Podés borrar estas cookies desde tu navegador en cualquier momento.",
    ],
  },
  {
    heading: "Tus derechos",
    paragraphs: [
      "Podés pedir acceso, rectificación o eliminación de tus datos escribiendo a nuestro email de contacto desde la casilla con la que compraste. También podés pedir que dejemos de usar tus datos para promociones. Respondemos toda solicitud en un plazo razonable.",
    ],
  },
];

// ---------------------------------------------------------------------------
// Docs (/docs) — recursos legibles por máquinas y desarrolladores
// ---------------------------------------------------------------------------

export const DOCS_TITLE = "Recursos para agentes y desarrolladores";
export const DOCS_INTRO =
  "Índice centralizado de los recursos legibles por máquina de lubenergy.com.ar. Pensado para agentes de IA, crawlers e integraciones.";

export interface DocResource {
  name: string;
  url: string;
  description: string;
}

export const DOCS_RESOURCES: DocResource[] = [
  {
    name: "llms.txt",
    url: "/llms.txt",
    description:
      "Índice del sitio en formato llmstxt.org con cuándo usar este sitio y sus URLs clave.",
  },
  {
    name: "sitemap.xml",
    url: "/sitemap.xml",
    description: "Mapa del sitio completo: páginas estáticas y fichas de producto.",
  },
  {
    name: "robots.txt",
    url: "/robots.txt",
    description: "Reglas de rastreo para buscadores y bots de IA.",
  },
  {
    name: "Variante Markdown (acceptmarkdown.com)",
    url: "https://acceptmarkdown.com/",
    description:
      'Cualquier página sirve su contenido en Markdown si pedís "Accept: text/markdown". La respuesta incluye "Vary: Accept, Accept-Encoding".',
  },
  {
    name: "Catálogo",
    url: "/productos",
    description: "Listado completo de productos con precios en pesos argentinos.",
  },
  {
    name: "Ficha de producto",
    url: "/productos/{slug}",
    description: "Detalle por producto usando el patrón /productos/{slug}.",
  },
  {
    name: "Seguimiento de pedido",
    url: "/pedido/{id}",
    description:
      "Estado público de un pedido usando el patrón /pedido/{id-de-pedido}.",
  },
];
