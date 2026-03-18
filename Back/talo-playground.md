# Talo Playground (Sandbox)

Este playground sirve para probar Talo sin tocar el checkout productivo.

## 1) Configurar variables

Copiá `env.example` a `.env` y completá:

- `TALO_CLIENT_ID`
- `TALO_CLIENT_SECRET`
- `TALO_USER_ID`
- `TALO_ENVIRONMENT=sandbox`
- `TALO_WEBHOOK_URL` (URL publica que apunte a `POST /talo/webhook/test`)

## 2) Levantar backend

```bash
cd Back
npm install
npm run start:dev
```

## 3) Exponer webhook local

En otra terminal:

```bash
ngrok http 3080
```

Tomá la URL HTTPS de ngrok y configurala como:

`TALO_WEBHOOK_URL=https://<tu-subdominio>.ngrok-free.app/talo/webhook/test`

## 4) Crear un pago de prueba

```bash
npm run talo:playground -- create --amount=1500
```

Respuesta esperada: `id`, `status`, `paymentUrl` y `externalId`.

## 5) Consultar estado

```bash
npm run talo:playground -- get <paymentId>
```

## 6) Simular transferencia (sandbox)

Si tenés un CVU de prueba:

```bash
npm run talo:playground -- simulate --cvu=<CVU> --amount=1500
```

## Endpoints de playground en la API

- `POST /talo/playground/payments`
- `GET /talo/playground/payments/:paymentId`
- `POST /talo/webhook/test`

Todos son publicos para facilitar pruebas locales en sandbox.
