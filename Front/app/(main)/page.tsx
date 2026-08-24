import { Metadata } from "next";
import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { ProductGrid } from "../productos/components/product-grid";
import { AboutSection } from "@/components/about-section";
import { FaqSection } from "@/components/faq-section";
import { ContactSection } from "@/components/contact-section";
import { CartSidebar } from "@/components/cart-sidebar";

import { HashScrollHandler } from "@/components/hash-scroll-handler";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCatalogProducts, getCatalogCategories } from "@/lib/catalog";

// SSR por pedido: el build no depende de la API y el HTML siempre trae datos.
export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lubenergy.com.ar';

export const metadata: Metadata = {
  // Absolute title: the root template would otherwise append "| LUB ENERGY" twice.
  title: {
    absolute: "Suplementos Deportivos en Corrientes | LUB ENERGY",
  },
  description:
    "Tienda de suplementos deportivos en Corrientes capital. Comprá proteínas, creatinas, pre-entrenos y vitaminas en Junín 2183 o con envío a todo el país.",
  alternates: {
    canonical: `${BASE_URL}/`,
  },
  openGraph: {
    title: "Suplementos Deportivos en Corrientes | LUB ENERGY",
    description:
      "Tienda de suplementos deportivos en Corrientes capital. Comprá proteínas, creatinas, pre-entrenos y vitaminas en Junín 2183 o con envío a todo el país.",
    url: `${BASE_URL}/`,
    siteName: "LUB ENERGY",
    locale: "es_AR",
    type: "website",
  },
};

// FAQPage JSON-LD colocado junto a la sección FAQ visible de la home.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Dónde está ubicado LUB ENERGY?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "LUB ENERGY está ubicado en Junín 2183, Corrientes capital, provincia de Corrientes, Argentina. Podés encontrarnos en Google Maps: https://maps.app.goo.gl/t9xvJ8Hc1tGEebCu7",
      },
    },
    {
      "@type": "Question",
      name: "¿Venden suplementos deportivos en Corrientes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. LUB ENERGY es la tienda de suplementos deportivos con local físico propio en Corrientes capital. Vendemos proteínas, creatinas, pre-entrenos, aminoácidos, vitaminas y mucho más de las mejores marcas.",
      },
    },
    {
      "@type": "Question",
      name: "¿Hacen envíos a toda Argentina?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí, LUB ENERGY realiza envíos a todo el país. Podés comprar desde cualquier provincia y recibir tu pedido en la puerta de tu casa.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuáles son los horarios de atención del local?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "El local de LUB ENERGY atiende de lunes a sábado de 9:00 a 21:00 hs. También podés contactarnos por WhatsApp al +54 379 505-6878 o escribirnos por Instagram @lub_energy.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué suplementos vende LUB ENERGY en Corrientes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "LUB ENERGY vende proteínas whey, creatina monohidrato, pre-entrenos, aminoácidos BCAA, quemadores de grasa, vitaminas y suplementos para rendimiento deportivo. Todos los productos son originales de marcas reconocidas.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cómo puedo contactar a LUB ENERGY?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Podés contactar a LUB ENERGY por WhatsApp al +54 379 505-6878, por email a Lubenergy1324@gmail.com, o visitarnos en nuestro local en Junín 2183, Corrientes capital.",
      },
    },
  ],
};

export default async function Home() {
  // SSR: productos y categorías viajan en el HTML inicial (sin JS requerido).
  const [featuredProducts, categories] = await Promise.all([
    getCatalogProducts(true),
    getCatalogCategories(),
  ]);

  return (
    <main id="main-content" className="min-h-screen bg-background">
      <HashScrollHandler />
      <Header />
      <HeroSection />
      <ProductGrid
        featuredOnly={true}
        showFilters={false}
        initialProducts={featuredProducts}
        initialCategories={categories}
      />
      <div className="flex justify-center pb-12 sm:pb-16 md:pb-20">
        <Link href="/productos">
          <Button
            size="lg"
            className="rounded-full px-10 py-6 text-base font-bold green-glow transition-all hover:scale-105 cursor-pointer"
            aria-label="Ver catálogo completo de productos"
          >
            Ver Catálogo Completo
          </Button>
        </Link>
      </div>
      <AboutSection />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <FaqSection />
      <ContactSection />
      <CartSidebar />
    </main>
  );
}
