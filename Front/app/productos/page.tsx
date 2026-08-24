import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { ProductGrid } from "./components/product-grid";
import { CartSidebar } from "@/components/cart-sidebar";
import { Footer } from "@/components/footer";
import { getCatalogProducts, getCatalogCategories } from "@/lib/catalog";
import { slugify } from "@/lib/slug";

// SSR por pedido: el build no depende de la API y los precios son actuales.
export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lubenergy.com.ar';

export const metadata: Metadata = {
  title: "Catálogo de Suplementos Deportivos en Corrientes | LUB ENERGY",
  description:
    "Comprá suplementos deportivos en Corrientes capital. Proteínas, creatinas, pre-entrenos, aminoácidos y vitaminas en el local de LUB ENERGY (Junín 2183) o con envío a toda Argentina.",
  openGraph: {
    title: "Suplementos Deportivos en Corrientes | LUB ENERGY",
    description:
      "Catálogo completo de suplementos deportivos en Corrientes capital. Local en Junín 2183. Envíos a toda Argentina.",
    url: `${BASE_URL}/productos`,
    siteName: "LUB ENERGY",
    locale: "es_AR",
    type: "website",
  },
  alternates: {
    canonical: `${BASE_URL}/productos`,
  },
};

// JSON-LD para página de catálogo
const catalogJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Catálogo de Suplementos Deportivos en Corrientes",
  description:
    "Catálogo completo de suplementos deportivos de LUB ENERGY en Corrientes capital, Argentina. Proteínas, creatinas, pre-entrenos, aminoácidos y vitaminas.",
  url: `${BASE_URL}/productos`,
  isPartOf: {
    "@type": "WebSite",
    name: "LUB ENERGY",
    url: BASE_URL,
  },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Productos",
        item: `${BASE_URL}/productos`,
      },
    ],
  },
};

export default async function ProductosPage() {
  // SSR: catálogo completo en el HTML inicial (sin JS requerido).
  const [products, categories] = await Promise.all([
    getCatalogProducts(),
    getCatalogCategories(),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogJsonLd) }}
      />
      <main id="main-content" className="min-h-screen">
        <Header />
        {/* Crawlable category hub links (server-rendered, independent of the client filter). */}
        {categories.length > 0 && (
          <nav
            aria-label="Categorías del catálogo"
            className="mx-auto flex w-full max-w-7xl flex-wrap justify-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8"
          >
            {categories
              .filter((category) => category.isActive !== false)
              .map((category) => (
                <Link
                  key={category.id}
                  href={`/productos/categoria/${slugify(category.name)}`}
                  className="rounded-full border border-border bg-secondary px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  {category.name}
                </Link>
              ))}
          </nav>
        )}
        <div className="">
          <ProductGrid
            featuredOnly={false}
            showFilters={true}
            showTitle={true}
            initialProducts={products}
            initialCategories={categories}
          />
        </div>
        <CartSidebar />
        <Footer />
      </main>
    </>
  );
}
