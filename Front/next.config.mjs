/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
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
  
  // Headers de seguridad y cache
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      // Cache agresivo para assets estáticos
      {
        source: '/(.*)\\.(ico|png|jpg|jpeg|gif|webp|svg|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
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
