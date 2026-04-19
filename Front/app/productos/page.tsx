import { Metadata } from "next";
import { Header } from "@/components/header";
import { ProductGrid } from "./components/product-grid";
import { CartSidebar } from "@/components/cart-sidebar";
import { Footer } from "@/components/footer";

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

export default function ProductosPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogJsonLd) }}
      />
      <main id="main-content" className="min-h-screen">
        <Header />
        <div className="">
          <ProductGrid featuredOnly={false} showFilters={true} showTitle={true} />
        </div>
        <CartSidebar />
        <Footer />
      </main>
    </>
  );
}
