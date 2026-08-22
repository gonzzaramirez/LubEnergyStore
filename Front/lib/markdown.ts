import type { OrderPublic, Product as APIProduct } from "@/lib/types";
import {
  ABOUT_INTRO,
  ABOUT_SECTIONS,
  ABOUT_TITLE,
  CONTACT_CHANNELS,
  CONTACT_INTRO,
  CONTACT_SECTIONS,
  CONTACT_TITLE,
  DOCS_INTRO,
  DOCS_RESOURCES,
  DOCS_TITLE,
  PRIVACY_INTRO,
  PRIVACY_SECTIONS,
  PRIVACY_TITLE,
  SITE_NAME,
  WHATSAPP_LINK,
  type ContentSection,
} from "@/lib/site-content";

export const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://lubenergy.com.ar";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface MarkdownResult {
  status: number;
  body: string;
}

async function fetchJson<T>(
  url: string,
  revalidate?: number,
): Promise<T | null> {
  try {
    const response = await fetch(
      url,
      revalidate
        ? { next: { revalidate }, signal: AbortSignal.timeout(8000) }
        : { cache: "no-store", signal: AbortSignal.timeout(8000) },
    );
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(value);
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es-AR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function renderSections(sections: ContentSection[]): string {
  return sections
    .map(
      (section) =>
        `## ${section.heading}\n\n${section.paragraphs.join("\n\n")}`,
    )
    .join("\n\n");
}

function stockLabel(product: APIProduct): string {
  const total =
    product.flavors && product.flavors.length > 0
      ? product.flavors.reduce((acc, flavor) => acc + flavor.stockQuantity, 0)
      : (product.stockQuantity ?? 0);
  return total > 0 ? "En stock" : "Sin stock";
}

function staticPageMarkdown(
  title: string,
  intro: string,
  sections: ContentSection[],
): string {
  return `# ${title} — ${SITE_NAME}

${intro}

${renderSections(sections)}

---

Inicio: ${BASE_URL}/ · Índice para agentes: ${BASE_URL}/llms.txt`;
}

function homeMarkdown(featured: APIProduct[] | null): string {
  const featuredList = (featured ?? [])
    .slice(0, 20)
    .map(
      (product) =>
        `- [${product.name}](${BASE_URL}/productos/${product.slug}) — ${formatPrice(product.price)} ARS · ${product.category?.name ?? "Suplementos"} · ${stockLabel(product)}`,
    )
    .join("\n");

  return `# ${SITE_NAME} — Suplementos deportivos en Corrientes, Argentina

> Tienda online y local físico (Junín 2183, Corrientes capital) de proteínas, creatinas, pre-entrenos, aminoácidos y vitaminas. Precios en pesos argentinos y envíos a todo el país.

## Qué podés hacer en este sitio

- Ver el catálogo completo con precios actualizados: ${BASE_URL}/productos
- Ver la ficha de un producto: ${BASE_URL}/productos/{slug}
- Seguir un pedido ya realizado: ${BASE_URL}/pedido/{id-de-pedido}
- Conocer la tienda: ${BASE_URL}/about
- Contacto y horarios: ${BASE_URL}/contact

## Productos destacados

${featuredList || "_Sin destacados por el momento._"}

## Para agentes de IA

Este sitio sirve su contenido en Markdown vía content negotiation: pedí cualquier página con el header \`Accept: text/markdown\`. Índice para máquinas: ${BASE_URL}/llms.txt · Sitemap: ${BASE_URL}/sitemap.xml · Recursos para desarrolladores: ${BASE_URL}/docs`;
}

function catalogMarkdown(products: APIProduct[] | null): string {
  const list = (products ?? [])
    .filter((product) => product.isActive !== false)
    .slice(0, 200)
    .map(
      (product) =>
        `- [${product.name}](${BASE_URL}/productos/${product.slug}) — ${formatPrice(product.price)} ARS · ${product.category?.name ?? "Suplementos"} · ${stockLabel(product)}`,
    )
    .join("\n");

  return `# Catálogo de suplementos — ${SITE_NAME}

Listado completo de productos disponibles en la tienda online de LUB ENERGY (Corrientes, Argentina). Precios en pesos argentinos (ARS), sujetos a cambios sin previo aviso.

## Productos (${products?.length ?? 0})

${list || "_Catálogo no disponible en este momento._"}

## Comprar

Pedidos desde ${BASE_URL}/productos o por WhatsApp: ${WHATSAPP_LINK}. Envíos a todo el país.`;
}

function productMarkdown(product: APIProduct): string {
  const flavors = product.flavors?.length
    ? `\n- Sabores: ${product.flavors.map((f) => f.name).join(", ")}`
    : "";
  const discount = product.discountPercent
    ? `\n- Descuento vigente: ${product.discountPercent}%`
    : "";

  return `# ${product.name} — ${SITE_NAME}

> Ficha de producto de la tienda LUB ENERGY (Corrientes, Argentina).

- Precio: ${formatPrice(product.price)} ARS
- Categoría: ${product.category?.name ?? "Suplementos"}
- Disponibilidad: ${stockLabel(product)}${flavors}${discount}

## Descripción

${product.description}

## Cómo comprar

Online: ${BASE_URL}/productos/${product.slug}
WhatsApp: ${WHATSAPP_LINK}
Envíos a todo el país. Después de comprar podés seguir el pedido en ${BASE_URL}/pedido/{id}.

Catálogo completo: ${BASE_URL}/productos`;
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pedido recibido (esperando confirmación de pago)",
  CONFIRMED: "Pago confirmado (preparando envío)",
  SHIPPED: "Enviado",
  CANCELLED: "Cancelado",
};

function orderMarkdown(order: OrderPublic): string {
  const items = order.items
    .map(
      (item) =>
        `- ${item.productName} × ${item.quantity} — ${formatPrice(item.quantity * item.unitPrice)}`,
    )
    .join("\n");
  const tracking = order.trackingCode
    ? `\n- Código de seguimiento: ${order.trackingCode}${order.courierName ? ` (${order.courierName})` : ""}`
    : "";

  return `# Pedido #${order.id.slice(0, 8).toUpperCase()} — ${SITE_NAME}

Estado del pedido consultado desde la página pública de seguimiento.

- Estado: ${ORDER_STATUS_LABELS[order.status] ?? order.status}${tracking}
- Fecha: ${formatDate(order.createdAt)}
- Destino: ${order.customerName} — ${order.city}

## Artículos

${items || "_Sin artículos._"}

**Total: ${formatPrice(order.totalAmount)}**

Consultas por WhatsApp: ${WHATSAPP_LINK}`;
}

function notFoundMarkdown(pathname: string): string {
  return `# 404 — Página no encontrada

La ruta \`${pathname}\` no existe en lubenergy.com.ar.

## Dónde seguir

- Índice del sitio para agentes: ${BASE_URL}/llms.txt
- Mapa del sitio: ${BASE_URL}/sitemap.xml
- Catálogo de productos: ${BASE_URL}/productos
- La tienda: ${BASE_URL}/about · Contacto: ${BASE_URL}/contact
- Inicio: ${BASE_URL}/

Tip: todas las páginas sirven Markdown si pedís \`Accept: text/markdown\`.`;
}

/**
 * Resolve the markdown representation for a site path.
 * Mirrors the HTML pages one-to-one; unknown paths answer 404 with a body
 * full of recovery links so agents can self-correct.
 */
export async function resolveMarkdown(pathname: string): Promise<MarkdownResult> {
  let path = pathname || "/";
  if (path !== "/") path = path.replace(/\/+$/, "") || "/";

  if (path === "/") {
    const featured = await fetchJson<APIProduct[]>(
      `${API_URL}/products?featured=true`,
      300,
    );
    return { status: 200, body: homeMarkdown(featured) };
  }

  if (path === "/productos") {
    const products = await fetchJson<APIProduct[]>(`${API_URL}/products`, 300);
    return { status: 200, body: catalogMarkdown(products) };
  }

  const productMatch = path.match(/^\/productos\/([^/]+)$/);
  if (productMatch) {
    const slug = decodeURIComponent(productMatch[1]);
    const product = await fetchJson<APIProduct>(
      `${API_URL}/products/slug/${encodeURIComponent(slug)}`,
      60,
    );
    if (!product) {
      return { status: 404, body: notFoundMarkdown(path) };
    }
    return { status: 200, body: productMarkdown(product) };
  }

  const orderMatch = path.match(/^\/pedido\/([^/]+)$/);
  if (orderMatch) {
    const id = decodeURIComponent(orderMatch[1]);
    const order = await fetchJson<OrderPublic>(
      `${API_URL}/orders/track/${encodeURIComponent(id)}`,
    );
    if (!order) {
      return { status: 404, body: notFoundMarkdown(path) };
    }
    return { status: 200, body: orderMarkdown(order) };
  }

  switch (path) {
    case "/about":
      return {
        status: 200,
        body: staticPageMarkdown(ABOUT_TITLE, ABOUT_INTRO, ABOUT_SECTIONS),
      };
    case "/contact":
      return {
        status: 200,
        body: staticPageMarkdown(
          CONTACT_TITLE,
          CONTACT_INTRO,
          CONTACT_SECTIONS,
        ) +
          "\n\n## Canales de contacto\n\n" +
          CONTACT_CHANNELS.map(
            (channel) =>
              `- ${channel.label}: ${channel.value}${channel.external ? "" : ""}`,
          ).join("\n"),
      };
    case "/privacy":
      return {
        status: 200,
        body: staticPageMarkdown(PRIVACY_TITLE, PRIVACY_INTRO, PRIVACY_SECTIONS),
      };
    case "/docs":
      return {
        status: 200,
        body:
          `# ${DOCS_TITLE} — ${SITE_NAME}\n\n${DOCS_INTRO}\n\n## Recursos\n\n` +
          DOCS_RESOURCES.map(
            (resource) =>
              `- [${resource.name}](${resource.url.startsWith("/") ? BASE_URL + resource.url : resource.url}): ${resource.description}`,
          ).join("\n") +
          `\n\n---\n\nInicio: ${BASE_URL}/ · Índice para agentes: ${BASE_URL}/llms.txt`,
      };
    default:
      return { status: 404, body: notFoundMarkdown(path) };
  }
}
