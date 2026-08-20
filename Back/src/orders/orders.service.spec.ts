import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { OrderStatus } from '@prisma/client';
import { OrderStatusUpdate } from './dto/update-order.dto';
import { CreateOrderDto } from './dto/create-order.dto';

const ADMIN_EMAIL = 'admin@test.com';
const RESEND_KEY = 'test-resend-key';

function buildPrismaMock() {
  const txMock = {
    order: {
      create: jest.fn(),
      update: jest.fn(),
    },
    guestCustomer: {
      create: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    productFlavor: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  return {
    txMock,
    prisma: {
      $transaction: jest.fn((cb: (tx: any) => any) => cb(txMock)),
      order: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      product: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    },
  };
}

function buildEmailMock() {
  return {
    sendAdminNewOrderNotification: jest.fn().mockResolvedValue(true),
    sendOrderConfirmation: jest.fn().mockResolvedValue(true),
    sendTrackingUpdate: jest.fn().mockResolvedValue(true),
  };
}

describe('OrdersService.create — no GuestCustomer', () => {
  let service: OrdersService;
  let prismaMock: ReturnType<typeof buildPrismaMock>;
  let emailMock: ReturnType<typeof buildEmailMock>;

  beforeEach(async () => {
    process.env.ADMIN_ORDER_EMAIL = ADMIN_EMAIL;
    process.env.RESEND_API_KEY = RESEND_KEY;

    prismaMock = buildPrismaMock();
    emailMock = buildEmailMock();

    prismaMock.txMock.order.create.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.PENDING,
      totalAmount: 3000,
      createdAt: new Date('2026-08-20T10:00:00Z'),
      customerNotes: null,
      items: [
        {
          productId: 'p1',
          flavorId: null,
          productName: 'Creatina',
          flavorName: null,
          quantity: 3,
          unitPrice: 1000,
        },
      ],
      guestCustomer: null,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prismaMock.prisma },
        { provide: EmailService, useValue: emailMock },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    delete process.env.ADMIN_ORDER_EMAIL;
    delete process.env.RESEND_API_KEY;
  });

  it('creates an order with guestCustomerId null and no GuestCustomer row', async () => {
    const dto = new CreateOrderDto();
    dto.items = [
      {
        productId: 'p1',
        productName: 'Creatina',
        quantity: 3,
        unitPrice: 1000,
      },
    ];
    dto.totalAmount = 3000;

    const result = await service.create(dto);

    const createArg = prismaMock.txMock.order.create.mock.calls[0][0];
    expect(createArg.data.guestCustomerId).toBeNull();
    expect(prismaMock.txMock.guestCustomer.create).not.toHaveBeenCalled();
    expect(result.id).toBe('order-1');
    expect(result.status).toBe(OrderStatus.PENDING);
  });

  it('sends admin notification with a placeholder customer (no real buyer)', async () => {
    const dto = new CreateOrderDto();
    dto.items = [
      {
        productId: 'p1',
        productName: 'Creatina',
        quantity: 3,
        unitPrice: 1000,
      },
    ];
    dto.totalAmount = 3000;

    await service.create(dto);

    expect(emailMock.sendAdminNewOrderNotification).toHaveBeenCalledTimes(1);
    const arg = emailMock.sendAdminNewOrderNotification.mock.calls[0][0];
    expect(arg.customer.firstName).toBe('Cliente');
    expect(arg.customer.lastName).toBe('WhatsApp');
    expect(arg.customer.email).toBe('');
    expect(arg.customer.dni).toBe('');
  });
});

describe('OrdersService — client emails stopped', () => {
  let service: OrdersService;
  let prismaMock: ReturnType<typeof buildPrismaMock>;
  let emailMock: ReturnType<typeof buildEmailMock>;

  const guestCustomer = {
    id: 'gc-1',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan@ejemplo.com',
    phone: '12345678',
    dni: '12345678',
    street: 'Av. Corrientes 1234',
    apartment: null,
    city: 'CABA',
    province: 'Buenos Aires',
  };

  const existingOrder = {
    id: 'order-1',
    status: OrderStatus.PENDING,
    totalAmount: 3000,
    guestCustomer,
    items: [
      {
        productId: 'p1',
        flavorId: null,
        productName: 'Creatina',
        flavorName: null,
        quantity: 3,
        unitPrice: 1000,
      },
    ],
  };

  beforeEach(async () => {
    prismaMock = buildPrismaMock();
    emailMock = buildEmailMock();

    prismaMock.prisma.order.findUnique.mockResolvedValue(existingOrder);
    prismaMock.prisma.order.update.mockResolvedValue({
      ...existingOrder,
      status: OrderStatus.CONFIRMED,
    });
    prismaMock.prisma.product.findUnique.mockResolvedValue({
      id: 'p1',
      stockQuantity: 100,
      name: 'Creatina',
    });
    prismaMock.prisma.product.update.mockResolvedValue({});
    prismaMock.txMock.order.update.mockResolvedValue({
      ...existingOrder,
      status: OrderStatus.CONFIRMED,
    });
    prismaMock.txMock.product.findUnique.mockResolvedValue({
      id: 'p1',
      stockQuantity: 100,
      name: 'Creatina',
    });
    prismaMock.txMock.product.update.mockResolvedValue({});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prismaMock.prisma },
        { provide: EmailService, useValue: emailMock },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('does NOT send client confirmation email on CONFIRMED status update', async () => {
    await service.updateStatus('order-1', {
      status: OrderStatusUpdate.CONFIRMED,
    });

    expect(emailMock.sendOrderConfirmation).not.toHaveBeenCalled();
  });

  it('does NOT send client tracking email on tracking update', async () => {
    prismaMock.prisma.order.findUnique.mockResolvedValue({
      ...existingOrder,
      status: OrderStatus.CONFIRMED,
    });

    await service.updateTracking('order-1', {
      trackingCode: 'AA123',
      courierName: 'Correo',
    });

    expect(emailMock.sendTrackingUpdate).not.toHaveBeenCalled();
  });
});

describe('OrdersService — stock deducted on CONFIRMED', () => {
  let service: OrdersService;
  let prismaMock: ReturnType<typeof buildPrismaMock>;
  let emailMock: ReturnType<typeof buildEmailMock>;

  const existingOrder = {
    id: 'order-1',
    status: OrderStatus.PENDING,
    totalAmount: 3000,
    guestCustomer: null,
    items: [
      {
        productId: 'p1',
        flavorId: null,
        productName: 'Creatina',
        flavorName: null,
        quantity: 3,
        unitPrice: 1000,
      },
    ],
  };

  beforeEach(async () => {
    prismaMock = buildPrismaMock();
    emailMock = buildEmailMock();

    prismaMock.prisma.order.findUnique.mockResolvedValue(existingOrder);
    prismaMock.prisma.product.findUnique.mockResolvedValue({
      id: 'p1',
      stockQuantity: 100,
      name: 'Creatina',
    });
    prismaMock.prisma.product.update.mockResolvedValue({});
    prismaMock.txMock.order.update.mockResolvedValue({
      ...existingOrder,
      status: OrderStatus.CONFIRMED,
    });
    prismaMock.txMock.product.findUnique.mockResolvedValue({
      id: 'p1',
      stockQuantity: 100,
      name: 'Creatina',
    });
    prismaMock.txMock.product.update.mockResolvedValue({});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prismaMock.prisma },
        { provide: EmailService, useValue: emailMock },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('discounts stock by order item quantity when confirming', async () => {
    await service.updateStatus('order-1', {
      status: OrderStatusUpdate.CONFIRMED,
    });

    expect(prismaMock.txMock.product.update).toHaveBeenCalledTimes(1);
    const updateArg = prismaMock.txMock.product.update.mock.calls[0][0];
    expect(updateArg.where.id).toBe('p1');
    expect(updateArg.data.stockQuantity.decrement).toBe(3);
  });
});
