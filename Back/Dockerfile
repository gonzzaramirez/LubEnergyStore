FROM node:22.12.0-alpine

RUN apk -U add openssl

WORKDIR /app

COPY . .

# Instalamos dependencias (incluye Nest CLI para build)
RUN npm install --include=dev

# Generamos Prisma Client
RUN npx prisma generate

# Build de Nest
RUN npm run build

# Verificación en logs (útil en Dokploy)
RUN ls -la dist && ls -la dist/src

EXPOSE 3080

# ⚠️ ENTRYPOINT CORRECTO SEGÚN TU BUILD
CMD ["node", "dist/src/main.js"]
