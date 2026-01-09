# 1. Usamos la imagen base con Node 22.12 (Requisito de Prisma 7)
FROM node:22.12.0-alpine

# 2. Instalamos OpenSSL (Obligatorio para que Prisma funcione en Alpine Linux)
RUN apk -U add openssl

# 3. Definimos el directorio de trabajo dentro del contenedor
WORKDIR /app

# 4. --- LA SOLUCIÓN ---
# Copiamos TODO el contenido de tu carpeta 'back' al contenedor.
# Esto incluye package.json, la carpeta prisma, src, tsconfig, etc.
COPY . .

# 5. Instalamos las dependencias
RUN npm ci

# 6. Generamos el cliente de Prisma
# Al haber copiado todo en el paso 4, Docker YA TIENE la carpeta prisma aquí.
RUN npx prisma generate

# 7. Construimos la aplicación (NestJS build)
RUN npm run build

# 8. Exponemos el puerto
EXPOSE 3080

# 9. Comando de arranque
CMD ["npm", "run", "start:prod"]