import { MetadataRoute } from 'next'
import { getCatalogCategories } from '@/lib/catalog'
import { slugify } from '@/lib/slug'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lubenergy.com.ar'
const API_URL = process.env.NEXT_PUBLIC_API_URL

// Generado por pedido para no acoplar el build a la disponibilidad del backend.
export const dynamic = 'force-dynamic'

interface Product {
  slug: string
  updatedAt?: string
  isActive?: boolean
}

async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_URL}/products`, {
      next: { revalidate: 3600 } // Revalidar cada hora
    })
    if (!response.ok) {
      return []
    }
    return response.json()
  } catch (error) {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCatalogCategories(),
  ])

  // URLs estáticas
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/productos`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/docs`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  // Category hub URLs (crawlable landing pages per category)
  const categoryUrls: MetadataRoute.Sitemap = categories
    .filter((category) => category.isActive !== false)
    .map((category) => ({
      url: `${BASE_URL}/productos/categoria/${slugify(category.name)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

  // URLs dinámicas de productos (solo activos)
  const productUrls: MetadataRoute.Sitemap = products
    .filter((product) => product.isActive !== false)
    .map((product) => ({
      url: `${BASE_URL}/productos/${product.slug}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

  return [...staticUrls, ...categoryUrls, ...productUrls]
}
