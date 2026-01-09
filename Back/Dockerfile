# 1. Usamos la imagen base con la versión EXACTA que Prisma 7 pide
FROM node:22.12.0-alpine

# 2. Instalamos OpenSSL (Obligatorio para que Prisma funcione en Linux Alpine)
RUN apk -U add openssl

# 3. Directorio de trabajo
WORKDIR /app

# 4. Copiamos los archivos de configuración primero (para aprovechar caché)
COPY package*.json ./
COPY prisma ./prisma/

# 5. Instalamos dependencias
RUN npm ci

# 6. Generamos el cliente de Prisma (¡Crucial!)
RUN npx prisma generate

# 7. Copiamos el resto del código fuente
COPY . .

# 8. Construimos la aplicación de NestJS
RUN npm run build

# 9. Exponemos el puerto que usas en tus variables de entorno
EXPOSE 3080

# 10. Comando para iniciar en producción
CMD ["npm", "run", "start:prod"]