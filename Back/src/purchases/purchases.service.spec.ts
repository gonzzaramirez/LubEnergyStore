import { Test, TestingModule } from '@nestjs/testing';
import { PurchasesService } from './purchases.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PurchasesService', () => {
  let service: PurchasesService;
  let prisma: any;

  // Mock transaction context with all needed operations
  const createTx = () => ({
    product: { update: jest.fn() },
    productFlavor: { update: jest.fn() },
    purchaseOrderLine: { updateMany: jest.fn() },
    purchaseOrder: {
      create: jest.fn(),
      update: jest.fn(),
    },
  });

  const mockPrisma = {
    supplier: { findUnique: jest.fn() },
    product: { findUnique: jest.fn() },
    purchaseOrder: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    purchaseOrderLine: {
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchasesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PurchasesService>(PurchasesService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // R-PO-01: Create Purchase Order
  describe('create', () => {
    it('should create a PO with lines and compute totalAmount', async () => {
      const dto = {
        supplierId: 'sup-1',
        notes: 'Test order',
        lines: [
          { productId: 'prod-1', productName: 'Product A', quantity: 2, unitPurchasePrice: 1000 },
          { productId: 'prod-2', productName: 'Product B', quantity: 3, unitPurchasePrice: 1500 },
        ],
      };

      mockPrisma.supplier.findUnique.mockResolvedValue({ id: 'sup-1', isActive: true });

      const expectedOrder = {
        id: 'po-1',
        supplierId: 'sup-1',
        status: 'PENDING',
        notes: 'Test order',
        totalAmount: 6500,
        lines: [
          { id: 'line-1', productId: 'prod-1', quantity: 2, unitPurchasePrice: 1000 },
          { id: 'line-2', productId: 'prod-2', quantity: 3, unitPurchasePrice: 1500 },
        ],
        supplier: { id: 'sup-1', name: 'Test' },
      };

      const tx = createTx();
      tx.purchaseOrder.create.mockResolvedValue(expectedOrder);
      mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(tx));

      const result = await service.create(dto);

      expect(mockPrisma.supplier.findUnique).toHaveBeenCalledWith({ where: { id: 'sup-1' } });
      expect(result.totalAmount).toBe(6500);
    });

    it('should throw BadRequestException when supplier not found', async () => {
      mockPrisma.supplier.findUnique.mockResolvedValue(null);

      const dto = {
        supplierId: 'nonexistent',
        lines: [{ productName: 'Product A', quantity: 1, unitPurchasePrice: 500 }],
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when supplier is inactive', async () => {
      mockPrisma.supplier.findUnique.mockResolvedValue({ id: 'sup-1', isActive: false });

      const dto = {
        supplierId: 'sup-1',
        lines: [{ productName: 'Product A', quantity: 1, unitPurchasePrice: 500 }],
      };

      await expect(service.create(dto)).rejects.toThrow('no está activo');
    });

    it('should throw BadRequestException when no lines provided', async () => {
      mockPrisma.supplier.findUnique.mockResolvedValue({ id: 'sup-1', isActive: true });

      const dto = { supplierId: 'sup-1', lines: [] };

      await expect(service.create(dto)).rejects.toThrow('Al menos una línea');
    });
  });

  // R-PO-05: List Purchase Orders
  describe('findAll', () => {
    it('should return paginated POs with supplier and line count', async () => {
      const expectedData = [
        { id: 'po-1', supplier: { name: 'Supplier A' }, status: 'PENDING', lines: [{ id: 'l1' }], totalAmount: 5000 },
      ];
      mockPrisma.purchaseOrder.findMany.mockResolvedValue(expectedData);
      mockPrisma.purchaseOrder.count.mockResolvedValue(1);
      mockPrisma.$transaction.mockImplementation(async (queries: any) => {
        // $transaction with array: resolve each element
        return Promise.all(queries);
      });

      const result = await service.findAll();

      expect(result.data).toBeDefined();
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should filter by status', async () => {
      mockPrisma.purchaseOrder.findMany.mockResolvedValue([]);
      mockPrisma.purchaseOrder.count.mockResolvedValue(0);
      mockPrisma.$transaction.mockImplementation(async (queries: any) => Promise.all(queries));

      await service.findAll(1, 20, 'PENDING');

      expect(mockPrisma.purchaseOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'PENDING' } }),
      );
    });
  });

  // R-PO-06: Get Single Purchase Order
  describe('findOne', () => {
    it('should return a PO with lines and supplier', async () => {
      const expected = {
        id: 'po-1',
        supplier: { name: 'Supplier A' },
        lines: [{ id: 'line-1', productName: 'Product A', quantity: 2 }],
        status: 'PENDING',
      };
      mockPrisma.purchaseOrder.findUnique.mockResolvedValue(expected);

      const result = await service.findOne('po-1');

      expect(mockPrisma.purchaseOrder.findUnique).toHaveBeenCalledWith({
        where: { id: 'po-1' },
        include: {
          supplier: true,
          lines: { include: { product: true, flavor: true } },
        },
      });
      expect(result).toEqual(expected);
    });

    it('should throw NotFoundException when PO not found', async () => {
      mockPrisma.purchaseOrder.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  // R-PO-02: Receive Purchase Order
  describe('receive', () => {
    it('should transition PENDING to RECEIVED, update stock, set remaining', async () => {
      const po = {
        id: 'po-1',
        status: 'PENDING',
        lines: [
          { id: 'line-1', productId: 'prod-1', flavorId: null, quantity: 5, unitPurchasePrice: 1000, unitSalePrice: null, remaining: 0 },
        ],
      };
      mockPrisma.purchaseOrder.findUnique.mockResolvedValue(po);

      const tx = createTx();
      const updatedPo = { ...po, status: 'RECEIVED', receivedAt: new Date() };
      tx.purchaseOrder.update.mockResolvedValue(updatedPo);
      mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(tx));

      const result = await service.receive('po-1');

      expect(tx.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: { stockQuantity: { increment: 5 } },
      });
      expect(tx.purchaseOrder.update).toHaveBeenCalledWith({
        where: { id: 'po-1' },
        data: { status: 'RECEIVED', receivedAt: expect.any(Date) },
        include: {
          supplier: true,
          lines: { include: { product: true, flavor: true } },
        },
      });
      expect(result.status).toBe('RECEIVED');
    });

    it('should update Product.price when unitSalePrice is set', async () => {
      const po = {
        id: 'po-1',
        status: 'PENDING',
        lines: [
          { id: 'line-1', productId: 'prod-1', flavorId: null, quantity: 10, unitPurchasePrice: 500, unitSalePrice: 1500, remaining: 0 },
        ],
      };
      mockPrisma.purchaseOrder.findUnique.mockResolvedValue(po);

      const tx = createTx();
      const updatedPo = { ...po, status: 'RECEIVED', receivedAt: new Date() };
      tx.purchaseOrder.update.mockResolvedValue(updatedPo);
      mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(tx));

      await service.receive('po-1');

      expect(tx.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: { stockQuantity: { increment: 10 }, price: 1500 },
      });
    });

    it('should NOT update Product.price when unitSalePrice is null', async () => {
      const po = {
        id: 'po-1',
        status: 'PENDING',
        lines: [
          { id: 'line-1', productId: 'prod-1', flavorId: null, quantity: 10, unitPurchasePrice: 500, unitSalePrice: null, remaining: 0 },
        ],
      };
      mockPrisma.purchaseOrder.findUnique.mockResolvedValue(po);

      const tx = createTx();
      const updatedPo = { ...po, status: 'RECEIVED', receivedAt: new Date() };
      tx.purchaseOrder.update.mockResolvedValue(updatedPo);
      mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(tx));

      await service.receive('po-1');

      expect(tx.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: { stockQuantity: { increment: 10 } },
      });
      // price should NOT be in the update — only stockQuantity
      const updateArg = tx.product.update.mock.calls[0][0];
      expect(updateArg.data.price).toBeUndefined();
    });

    it('should throw BadRequestException when PO is not PENDING', async () => {
      mockPrisma.purchaseOrder.findUnique.mockResolvedValue({ id: 'po-1', status: 'RECEIVED', lines: [] });

      await expect(service.receive('po-1')).rejects.toThrow(BadRequestException);
    });
  });

  // R-PO-03: Cancel Purchase Order
  describe('cancel', () => {
    it('should transition PENDING to CANCELLED', async () => {
      const po = { id: 'po-1', status: 'PENDING', lines: [] };
      mockPrisma.purchaseOrder.findUnique.mockResolvedValue(po);
      const cancelled = { ...po, status: 'CANCELLED' };
      mockPrisma.purchaseOrder.update.mockResolvedValue(cancelled);

      const result = await service.cancel('po-1');

      expect(mockPrisma.purchaseOrder.update).toHaveBeenCalledWith({
        where: { id: 'po-1' },
        data: { status: 'CANCELLED' },
        include: {
          supplier: true,
          lines: { include: { product: true, flavor: true } },
        },
      });
      expect(result.status).toBe('CANCELLED');
    });

    it('should throw BadRequestException when PO is not PENDING', async () => {
      mockPrisma.purchaseOrder.findUnique.mockResolvedValue({ id: 'po-1', status: 'RECEIVED' });

      await expect(service.cancel('po-1')).rejects.toThrow(BadRequestException);
    });
  });
});
