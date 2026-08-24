/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Ocultar firma del servidor (seguridad: no revelar que es Next.js)
  poweredByHeader: false,

  // Imágenes optimizadas con dominios remotos permitidos
  images: {
    remotePatterns: [
      // Permitir imágenes de cualquier dominio HTTPS (marcas de suplementos)
      {
        protocol: 'https',
        hostname: '**',
      },
      // Permitir HTTP para desarrollo local
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    // Formatos modernos para mejor compresión
    formats: ['image/avif', 'image/webp'],
    // Tamaños de dispositivo optimizados
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimizar datos transferidos
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 días de cache
  },
  
  // Headers de seguridad y cache (el primer source que coincide gana)
  async headers() {
    return [
      // Assets estáticos primero: cache con revalidación en segundo plano
      {
        source: '/(.*)\\.(ico|png|jpg|jpeg|gif|webp|avif|svg|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=31536000',
          },
        ],
      },
      // Private areas: noindex via HTTP header (defense in depth on top of
      // the robots metadata set in the pages themselves)
      {
        source: '/dashboard/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
      {
        source: '/pedido/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
      // Resto (páginas): seguridad + stale-while-revalidate + negociación
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Cache-Control', value: 'public, max-age=0, stale-while-revalidate=86400' },
          { key: 'Vary', value: 'Accept' },
        ],
      },
    ];
  },
  
  allowedDevOrigins: [
    "http://192.168.56.1",
    "http://localhost:3000",
  ],
}

export default nextConfig
