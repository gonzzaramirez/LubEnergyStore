FROM node:22.12.0-alpine

RUN apk -U add openssl

WORKDIR /app

COPY . .

# --- CAMBIO IMPORTANTE ---
# Forzamos la instalación de dependencias de desarrollo (Nest CLI)
# aunque NODE_ENV esté en production.
RUN npm install --include=dev

# Generamos Prisma Client
RUN npx prisma generate

# Ahora sí, el build funcionará porque tiene la Nest CLI
RUN npm run build

# Opcional: Verificamos que se creó la carpeta (esto saldrá en el log si falla)
RUN ls -la dist

EXPOSE 3080

CMD ["npm", "run", "start:prod"]