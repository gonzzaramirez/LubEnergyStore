FROM node:22.12.0-alpine

RUN apk -U add openssl

WORKDIR /app

COPY . .

# CAMBIO: Usamos 'install' en lugar de 'ci' para evitar errores de lockfile
RUN npm install

RUN npx prisma generate

RUN npm run build

EXPOSE 3080

CMD ["npm", "run", "start:prod"]