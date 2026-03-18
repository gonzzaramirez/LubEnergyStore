import 'dotenv/config';
import { CreatePaymentRequest, TaloClient, TaloEnvironment } from 'talo-pay';

type Command = 'create' | 'get' | 'simulate';

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Falta variable de entorno requerida: ${name}`);
  }
  return value.trim();
}

function getEnvironment(): TaloEnvironment {
  return process.env.TALO_ENVIRONMENT === 'production'
    ? 'production'
    : 'sandbox';
}

function getClient(): TaloClient {
  return new TaloClient({
    clientId: getRequiredEnv('TALO_CLIENT_ID'),
    clientSecret: getRequiredEnv('TALO_CLIENT_SECRET'),
    userId: getRequiredEnv('TALO_USER_ID'),
    environment: getEnvironment(),
  });
}

function getOption(args: string[], key: string): string | undefined {
  const longPrefix = `--${key}=`;
  const exactIndex = args.findIndex((arg) => arg === `--${key}`);

  if (exactIndex >= 0) {
    return args[exactIndex + 1];
  }

  const withPrefix = args.find((arg) => arg.startsWith(longPrefix));
  if (withPrefix) {
    return withPrefix.slice(longPrefix.length);
  }

  return undefined;
}

function printUsage(): void {
  console.log(`
Uso:
  npm run talo:playground -- create [--amount=1500] [--external-id=demo_123]
  npm run talo:playground -- get <paymentId>
  npm run talo:playground -- simulate --cvu=<CVU> [--amount=1500]

Variables requeridas:
  TALO_CLIENT_ID
  TALO_CLIENT_SECRET
  TALO_USER_ID
  TALO_ENVIRONMENT (sandbox|production)
  TALO_WEBHOOK_URL (requerida para create)
`);
}

async function runCreate(args: string[]): Promise<void> {
  const client = getClient();
  const amountInput = getOption(args, 'amount');
  const amount = amountInput ? Number(amountInput) : 1500;

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('El monto (--amount) debe ser un número mayor a 0');
  }

  const webhookUrl = getRequiredEnv('TALO_WEBHOOK_URL');
  const externalId = getOption(args, 'external-id') || `playground_${Date.now()}`;
  const redirectUrl = getOption(args, 'redirect-url') || process.env.FRONTEND_URL;
  const motive = getOption(args, 'motive') || 'Pago de prueba desde playground CLI';

  const request: CreatePaymentRequest = {
    user_id: getRequiredEnv('TALO_USER_ID'),
    price: {
      amount,
      currency: 'ARS',
    },
    payment_options: ['transfer'],
    external_id: externalId,
    webhook_url: webhookUrl,
    redirect_url: redirectUrl,
    motive,
  };

  const payment = await client.payments.create(request);

  console.log('Pago creado en playground:');
  console.log(
    JSON.stringify(
      {
        id: payment.id,
        status: payment.payment_status,
        paymentUrl: payment.payment_url ?? null,
        externalId: payment.external_id ?? externalId,
        redirectUrl: payment.redirect_url ?? redirectUrl ?? null,
      },
      null,
      2,
    ),
  );
}

async function runGet(args: string[]): Promise<void> {
  const paymentId = args[0];
  if (!paymentId) {
    throw new Error('Debes indicar el paymentId. Ej: npm run talo:playground -- get VAR-123');
  }

  const payment = await getClient().payments.get(paymentId);
  console.log('Estado del pago:');
  console.log(
    JSON.stringify(
      {
        id: payment.id,
        status: payment.payment_status,
        externalId: payment.external_id ?? null,
        paymentUrl: payment.payment_url ?? null,
        redirectUrl: payment.redirect_url ?? null,
      },
      null,
      2,
    ),
  );
}

async function runSimulate(args: string[]): Promise<void> {
  const cvu = getOption(args, 'cvu');
  if (!cvu) {
    throw new Error(
      'Debes indicar --cvu para simular transferencia. Ej: npm run talo:playground -- simulate --cvu=0000003100000000000000',
    );
  }

  const amountInput = getOption(args, 'amount') || '1500';
  const amount = Number(amountInput);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('El monto (--amount) debe ser un número mayor a 0');
  }

  const result = await getClient().sandbox.simulateCvuTransfer(cvu, {
    amount,
  });

  console.log('Resultado de simulación sandbox:');
  console.log(JSON.stringify(result, null, 2));
}

async function main(): Promise<void> {
  const [command, ...rest] = process.argv.slice(2);
  const selectedCommand = command as Command | undefined;

  if (!selectedCommand) {
    printUsage();
    return;
  }

  if (selectedCommand === 'create') {
    await runCreate(rest);
    return;
  }

  if (selectedCommand === 'get') {
    await runGet(rest);
    return;
  }

  if (selectedCommand === 'simulate') {
    await runSimulate(rest);
    return;
  }

  throw new Error(`Comando no reconocido: ${selectedCommand}`);
}

main().catch((error) => {
  console.error('Error ejecutando playground de Talo:');
  console.error(error);
  process.exit(1);
});
