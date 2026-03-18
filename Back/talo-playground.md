# Integración Talo: Playground + Flujo Productivo

Esta guía cubre:

1. Playground técnico aislado (sandbox).
2. Flujo real de checkout (frontend -> backend -> Talo -> webhook).

## Variables de entorno backend (`Back/.env`)

Configurar:

- `TALO_CLIENT_ID`
- `TALO_CLIENT_SECRET`
- `TALO_USER_ID`
- `TALO_ENVIRONMENT` (`sandbox` en desarrollo, `production` en producción)
- `TALO_WEBHOOK_URL`
- `TALO_REDIRECT_URL` (base `https://tu-front/pedido` o template `https://tu-front/pedido/{orderId}`)
- `TALO_AMOUNT_MODE` (`auto` recomendado)

## Entorno local (sandbox)

### 1) Levantar backend

```bash
cd Back
npm install
npm run start:dev
```

### 2) Exponer webhooks

En otra terminal:

```bash
ngrok http 3080
```

Usar la URL HTTPS de ngrok en:

- `TALO_WEBHOOK_URL=https://<subdominio>.ngrok-free.app/payments/talo/webhook`

Opcional para playground:

- `https://<subdominio>.ngrok-free.app/talo/webhook/test`

### 3) Probar playground CLI

```bash
npm run talo:playground -- create --amount=1500
npm run talo:playground -- get <paymentId>
npm run talo:playground -- simulate --cvu=<CVU> --amount=1500
```

## Flujo real de checkout (dev/prod)

1. Cliente confirma checkout en frontend.
2. Front crea pedido (`POST /orders`).
3. Front inicia pago (`POST /payments/talo/create` con `orderId`).
4. Front redirige a `paymentUrl` de Talo.
5. Talo envía webhook a `POST /payments/talo/webhook`.
6. Backend mapea estado:
   - `SUCCESS` -> `CONFIRMED`
   - `EXPIRED` -> `CANCELLED`
   - `OVERPAID` / `UNDERPAID` -> mantiene `PENDING` y agrega nota

## Endpoints relevantes

- `POST /payments/talo/create` (flujo productivo)
- `POST /payments/talo/webhook` (flujo productivo)
- `POST /talo/playground/payments` (playground)
- `GET /talo/playground/payments/:paymentId` (playground)
- `POST /talo/webhook/test` (playground)

## Monto interno vs monto enviado a Talo

La app guarda `totalAmount` internamente y el servicio convierte a ARS entero
según `TALO_AMOUNT_MODE`:

- `cents`: divide por 100
- `ars`: usa el valor tal cual
- `auto`: detecta automáticamente (recomendado para transición)
