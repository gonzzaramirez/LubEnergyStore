import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lubenergy.com.ar'

const privateRoutes = ['/dashboard/', '/api/']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Google Search + AI Overviews (Gemini)
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: privateRoutes,
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: privateRoutes,
      },
      // Bing
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: privateRoutes,
      },
      // ChatGPT / OpenAI
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: privateRoutes,
      },
      {
        userAgent: 'OAI-SearchBot',
        allow: '/',
        disallow: privateRoutes,
      },
      // Perplexity
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: privateRoutes,
      },
      // Anthropic / Claude
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: privateRoutes,
      },
      {
        userAgent: 'anthropic-ai',
        allow: '/',
        disallow: privateRoutes,
      },
      // Common Crawl (usado por muchos LLMs)
      {
        userAgent: 'CCBot',
        allow: '/',
        disallow: privateRoutes,
      },
      // Apple / Siri
      {
        userAgent: 'Applebot',
        allow: '/',
        disallow: privateRoutes,
      },
      {
        userAgent: 'Applebot-Extended',
        allow: '/',
        disallow: privateRoutes,
      },
      // Resto de bots
      {
        userAgent: '*',
        allow: '/',
        disallow: privateRoutes,
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
