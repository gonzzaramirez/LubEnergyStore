# 1. Usamos Node 22 (Alpine para que sea ligero)
FROM node:22-alpine

# 2. Directorio de trabajo
WORKDIR /app

# 3. Copiamos todo el contenido de la carpeta 'front'
COPY . .

# 4. Instalamos dependencias
# Usamos 'npm install' genérico. Si tienes pnpm-lock.yaml lo ignorará
# y creará un package-lock.json, pero funcionará sin errores de "frozen lockfile".
RUN npm install

# 5. Construimos la aplicación para producción
RUN npm run build

# 6. Exponemos el puerto estándar de Next.js
EXPOSE 3000

# 7. Comando para iniciar
CMD ["npm", "start"]