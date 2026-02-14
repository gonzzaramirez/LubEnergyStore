import { Metadata } from "next";
import { Header } from "@/components/header";
import { ProductGrid } from "./components/product-grid";
import { CartSidebar } from "@/components/cart-sidebar";
import { Footer } from "@/components/footer";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lubenergy.com.ar';

export const metadata: Metadata = {
  title: "Productos | Catálogo de Suplementos Deportivos",
  description:
    "Explora nuestro catálogo completo de suplementos deportivos. Proteínas, creatinas, pre-entrenos, aminoácidos y vitaminas. Las mejores marcas con envíos a toda Argentina.",
  openGraph: {
    title: "Catálogo de Suplementos | LUB ENERGY",
    description:
      "Explora nuestro catálogo completo de suplementos deportivos. Envíos a toda Argentina.",
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
  name: "Catálogo de Suplementos Deportivos",
  description: "Catálogo completo de suplementos deportivos de LUB ENERGY",
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
