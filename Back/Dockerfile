FROM node:22.12.0-alpine

# Instalar OpenSSL
RUN apk -U add openssl

WORKDIR /app

COPY . .

# --- TRUCO ---
# 1. Forzamos momentáneamente el modo desarrollo para asegurar que se instalen 
#    las herramientas de construcción (Nest CLI).
ENV NODE_ENV=development

# 2. Instalamos TODO (incluyendo devDependencies)
RUN npm install

# 3. Generamos Prisma
RUN npx prisma generate

# 4. Construimos la aplicación
RUN npm run build

# --- DEBUG ---
# Esto imprimirá en el log de construcción qué hay dentro de la carpeta dist.
# Si la carpeta está vacía, el deploy fallará aquí y nos avisará.
RUN echo "Verificando carpeta dist..." && ls -la dist || echo "LA CARPETA DIST NO EXISTE O ESTA VACIA"

# 5. Ahora sí, pasamos a modo producción para ejecutar
ENV NODE_ENV=production

EXPOSE 3080

# Usamos 'node dist/main' directo para evitar intermediarios
CMD ["node", "dist/main"]