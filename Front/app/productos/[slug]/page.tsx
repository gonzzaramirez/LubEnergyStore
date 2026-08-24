import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CartSidebar } from "@/components/cart-sidebar";
import { ProductDetailClient } from "./product-detail-client";
import { Product } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lubenergy.com.ar';

// Función para obtener producto por slug
async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const response = await fetch(`${API_URL}/products/slug/${slug}`, {
      next: { revalidate: 60 }, // Revalidar cada 60 segundos
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    return null;
  }
}

// Generar metadata dinámica para SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Producto no encontrado",
      description: "El producto que buscas no existe.",
    };
  }

  const categoryName = product.category?.name || "Suplementos";
  const priceFormatted = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(product.price);

  return {
    // Plain title: the root template appends "| LUB ENERGY" (avoids double branding).
    title: product.name,
    description: `${product.description.slice(0, 155)}... Precio: ${priceFormatted}. Envíos a toda Argentina.`,
    openGraph: {
      title: `${product.name} | LUB ENERGY`,
      description: product.description.slice(0, 200),
      url: `${BASE_URL}/productos/${product.slug}`,
      siteName: "LUB ENERGY",
      images: product.imageUrl
        ? [
            {
              url: product.imageUrl,
              width: 800,
              height: 800,
              alt: `${product.name} - ${categoryName}`,
            },
          ]
        : [],
      locale: "es_AR",
      type: "website",
    },
    // Commerce signals for social scrapers/crawlers. Note: Next 16 only
    // accepts custom meta pairs at the top level (openGraph.other was
    // removed from its types), rendering <meta name="product:price:*">.
    other: {
      "product:price:amount": String(product.price),
      "product:price:currency": "ARS",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | LUB ENERGY`,
      description: product.description.slice(0, 200),
      images: product.imageUrl ? [product.imageUrl] : [],
    },
    alternates: {
      canonical: `${BASE_URL}/productos/${product.slug}`,
    },
  };
}

// JSON-LD para producto individual
function ProductJsonLd({ product }: { product: Product }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.imageUrl || `${BASE_URL}/placeholder.svg`,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: "LUB ENERGY",
    },
    category: product.category?.name || "Suplementos Deportivos",
    offers: {
      "@type": "Offer",
      url: `${BASE_URL}/productos/${product.slug}`,
      priceCurrency: "ARS",
      price: product.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: product.stockQuantity && product.stockQuantity > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "LUB ENERGY",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "AR",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 3,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 2,
            maxValue: 7,
            unitCode: "DAY",
          },
        },
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// Breadcrumb JSON-LD
function BreadcrumbJsonLd({ product }: { product: Product }) {
  const jsonLd = {
    "@context": "https://schema.org",
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
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `${BASE_URL}/productos/${product.slug}`,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      <ProductJsonLd product={product} />
      <BreadcrumbJsonLd product={product} />
      <main id="main-content" className="min-h-screen bg-background">
        <Header />
        <CartSidebar />
        <ProductDetailClient product={product} />
        <Footer />
      </main>
    </>
  );
}
