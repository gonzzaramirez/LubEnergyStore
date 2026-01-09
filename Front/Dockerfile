# 1. Usamos Node 22 (Alpine para que sea ligero)
FROM node:22-alpine AS builder

# 2. Directorio de trabajo
WORKDIR /app

# 3. Copiamos todo el contenido de la carpeta 'front'
COPY . .

# 4. Instalamos dependencias
RUN npm install

# 5. Construimos la aplicación para producción
RUN npm run build

# --- Etapa de producción ---
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar los archivos necesarios desde el builder
# IMPORTANTE: El orden es crítico para standalone mode
# 1. Primero copiar standalone (contiene server.js y node_modules mínimos)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# 2. Luego copiar los archivos estáticos de Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# 3. FINALMENTE copiar public (debe ser DESPUÉS de standalone para no ser sobrescrito)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

# 6. Exponemos el puerto estándar de Next.js
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 7. Comando para iniciar (standalone usa server.js directamente)
CMD ["node", "server.js"]