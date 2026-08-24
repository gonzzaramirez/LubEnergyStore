import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { ProductGrid } from "../../components/product-grid";
import { CartSidebar } from "@/components/cart-sidebar";
import { Footer } from "@/components/footer";
import { getCatalogProducts, getCatalogCategories } from "@/lib/catalog";
import { slugify } from "@/lib/slug";
import { Category } from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lubenergy.com.ar';

// ISR: hubs regenerate hourly; slugs not prerendered are rendered on demand.
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Hub → spoke: resolve the single category whose slugified name matches the URL.
function findCategoryBySlug(categories: Category[], slug: string): Category | null {
  return (
    categories.find(
      (category) => category.isActive !== false && slugify(category.name) === slug
    ) ?? null
  );
}

// Fail soft: if the API is down at build time, nothing is prerendered and
// requests fall back to on-demand rendering.
export async function generateStaticParams() {
  const categories = await getCatalogCategories();
  return categories
    .filter((category) => category.isActive !== false)
    .map((category) => ({ slug: slugify(category.name) }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCatalogCategories();
  const category = findCategoryBySlug(categories, slug);

  if (!category) {
    return {
      title: "Categoría no encontrada",
      robots: { index: false, follow: false },
    };
  }

  const url = `${BASE_URL}/productos/categoria/${slugify(category.name)}`;
  const title = `${category.name} en Corrientes`;

  return {
    // Plain string: the root template completes it with "| LUB ENERGY".
    title,
    description: `Comprá ${category.name.toLowerCase()} en Corrientes capital. Catálogo completo de LUB ENERGY con precios actualizados, local físico en Junín 2183 y envíos a toda Argentina.`,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} | LUB ENERGY`,
      description: `Catálogo de ${category.name.toLowerCase()} en Corrientes capital. Local físico en Junín 2183. Envíos a toda Argentina.`,
      url,
      siteName: "LUB ENERGY",
      locale: "es_AR",
      type: "website",
      images: [
        {
          url: "/lub-energy-ng.png",
          width: 1200,
          height: 630,
          alt: `LUB ENERGY - ${category.name}`,
        },
      ],
    },
  };
}

export default async function CategoriaPage({ params }: PageProps) {
  const { slug } = await params;
  const categories = await getCatalogCategories();
  const category = findCategoryBySlug(categories, slug);

  if (!category) {
    notFound();
  }

  // SSR: productos del servidor para que las cards y sus links sean crawlables.
  const products = await getCatalogProducts();

  const activeProducts = products.filter(
    (product) =>
      product.isActive !== false &&
      (product.categoryId ?? product.category?.id) === category.id
  );

  const otherCategories = categories.filter(
    (item) => item.isActive !== false && item.id !== category.id
  );

  const categoryUrl = `${BASE_URL}/productos/categoria/${slugify(category.name)}`;
  const heading = `${category.name} en Corrientes`;

  // JSON-LD following the catalog page pattern: CollectionPage with an
  // ItemList of product URLs and a nested BreadcrumbList.
  const categoryJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: heading,
    url: categoryUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "LUB ENERGY",
      url: BASE_URL,
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: activeProducts.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: product.name,
        url: `${BASE_URL}/productos/${product.slug}`,
      })),
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
        {
          "@type": "ListItem",
          position: 3,
          name: category.name,
          item: categoryUrl,
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryJsonLd) }}
      />
      <main id="main-content" className="min-h-screen bg-background">
        <Header />
        <section className="mx-auto w-full max-w-7xl px-4 pt-8 text-center sm:px-6 sm:pt-12 md:pt-16 lg:px-8">
          <h1 className="mb-2 text-xl font-bold text-foreground sm:mb-3 sm:text-2xl md:text-3xl lg:text-4xl">
            {heading}
          </h1>
          <p className="mx-auto max-w-2xl text-xs text-muted-foreground sm:text-sm md:text-base">
            {category.description ||
              `Comprá ${category.name.toLowerCase()} en Corrientes capital con la calidad de LUB ENERGY: local físico en Junín 2183, atención personalizada y envíos a toda Argentina.`}
          </p>
        </section>
        <ProductGrid
          featuredOnly={false}
          showFilters={false}
          showTitle={false}
          initialProducts={activeProducts}
          initialCategories={categories}
        />
        {/* Interlinking: back up to the catalog hub and across to sibling categories. */}
        <nav
          aria-label="Otras categorías"
          className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16 md:pb-20 lg:px-8"
        >
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {otherCategories.map((item) => (
              <Link
                key={item.id}
                href={`/productos/categoria/${slugify(item.name)}`}
                className="rounded-full border border-border bg-secondary px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <Link
              href="/productos"
              className="text-sm font-semibold text-primary underline-offset-4 transition-colors hover:underline"
            >
              Ver catálogo completo
            </Link>
          </div>
        </nav>
        <CartSidebar />
        <Footer />
      </main>
    </>
  );
}
