import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lubenergy.com.ar'
const API_URL = process.env.NEXT_PUBLIC_API_URL

interface Product {
  slug: string
  updatedAt?: string
}

async function getProducts(): Promise<Product[]> {
  try {
    console.log('[Sitemap] Fetching products from:', `${API_URL}/products`)
    const response = await fetch(`${API_URL}/products`, {
      next: { revalidate: 3600 } // Revalidar cada hora
    })
    console.log('[Sitemap] Response status:', response.status)
    if (!response.ok) {
      console.log('[Sitemap] Response not OK:', await response.text())
      return []
    }
    return response.json()
  } catch (error) {
    console.error('[Sitemap] Error fetching products:', error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts()

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
  ]

  // URLs dinámicas de productos
  const productUrls: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${BASE_URL}/productos/${product.slug}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticUrls, ...productUrls]
}
