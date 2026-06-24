import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { SalesService } from './sales.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SalesService', () => {
  let service: SalesService;
  let prisma: any;

  const mockTx = {
    product: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    sale: {
      create: jest.fn(),
    },
    purchaseOrderLine: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockPrisma = {
    product: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    sale: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    // Handle both interactive tx (callback) and batch (array) patterns
    mockPrisma.$transaction.mockImplementation(async (arg: any) => {
      if (Array.isArray(arg)) {
        // Batch pattern: [findMany, count, ...] — resolve all
        return Promise.all(arg);
      }
      // Interactive transaction pattern: (tx) => { ... }
      return arg(mockTx);
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
    prisma = module.get(PrismaService);
  });

  describe('create', () => {
    const baseDto = {
      productId: 'product-1',
      quantity: 3,
      paymentMethod: 'CASH' as const,
      location: 'CORRIENTES' as const,
    };

    it('should create sale and decrement stock when stock is sufficient', async () => {
      mockTx.product.findUnique.mockResolvedValue({
        stockQuantity: 10,
        price: 100,
        name: 'Test Product',
      });
      mockTx.purchaseOrderLine.findMany.mockResolvedValue([]);
      const expectedSale = {
        id: 'sale-1',
        ...baseDto,
        purchasePrice: null,
        totalAmount: 300,
        createdAt: new Date().toISOString(),
        product: { name: 'Test Product', price: 100 },
      };
      mockTx.sale.create.mockResolvedValue(expectedSale);

      const result = await service.create(baseDto);

      expect(mockTx.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'product-1' },
        select: { stockQuantity: true, price: true, name: true },
      });
      expect(mockTx.product.update).toHaveBeenCalledWith({
        where: { id: 'product-1' },
        data: { stockQuantity: { decrement: 3 } },
      });
      expect(mockTx.sale.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          productId: 'product-1',
          quantity: 3,
          totalAmount: 300,
          purchasePrice: null,
          paymentMethod: 'CASH',
          location: 'CORRIENTES',
        }),
        include: { product: { select: { name: true, price: true } }, flavor: { select: { id: true, name: true } } },
      });
      expect(result.totalAmount).toBe(300);
    });

    it('should throw BadRequestException when stock is insufficient', async () => {
      mockTx.product.findUnique.mockResolvedValue({
        stockQuantity: 2,
        price: 100,
        name: 'Low Stock Product',
      });

      await expect(service.create(baseDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockTx.product.update).not.toHaveBeenCalled();
      expect(mockTx.sale.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when product is not found', async () => {
      mockTx.product.findUnique.mockResolvedValue(null);

      await expect(service.create(baseDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockTx.product.update).not.toHaveBeenCalled();
      expect(mockTx.sale.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when stock is zero', async () => {
      mockTx.product.findUnique.mockResolvedValue({
        stockQuantity: 0,
        price: 100,
        name: 'Zero Stock Product',
      });

      await expect(service.create(baseDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockTx.product.update).not.toHaveBeenCalled();
      expect(mockTx.sale.create).not.toHaveBeenCalled();
    });

    // --- FIFO Cost Allocation Tests (R-FIFO-01 through R-FIFO-05) ---

    it('should compute purchasePrice from FIFO lots and pass to sale.create', async () => {
      mockTx.product.findUnique.mockResolvedValue({
        stockQuantity: 10,
        price: 100,
        name: 'Test Product',
      });

      // Two FIFO lots: oldest has 2 units at 500, newer has 5 units at 600
      mockTx.purchaseOrderLine.findMany.mockResolvedValue([
        { id: 'line-1', productId: 'product-1', flavorId: null, remaining: 2, unitPurchasePrice: 500, unitSalePrice: null },
        { id: 'line-2', productId: 'product-1', flavorId: null, remaining: 5, unitPurchasePrice: 600, unitSalePrice: null },
      ]);

      const expectedSale = {
        id: 'sale-1',
        ...baseDto,
        totalAmount: 300,
        purchasePrice: null,
        unitSalePrice: null,
        createdAt: new Date().toISOString(),
        product: { name: 'Test Product', price: 100 },
      };
      mockTx.sale.create.mockImplementation(async (args: any) => ({
        ...expectedSale,
        purchasePrice: args.data.purchasePrice ?? null,
        unitSalePrice: args.data.unitSalePrice ?? null,
      }));

      const result = await service.create(baseDto);

      // Should consume 2 @ 500 + 1 @ 600 = 1600 / 3 = 533 (weighted)
      expect(mockTx.purchaseOrderLine.findMany).toHaveBeenCalledWith({
        where: { productId: 'product-1', remaining: { gt: 0 } },
        orderBy: { purchaseOrder: { receivedAt: 'asc' } },
      });
      // First lot fully consumed (2 units)
      expect(mockTx.purchaseOrderLine.update).toHaveBeenCalledWith({
        where: { id: 'line-1' },
        data: { remaining: { decrement: 2 } },
      });
      // Second lot partially consumed (1 unit)
      expect(mockTx.purchaseOrderLine.update).toHaveBeenCalledWith({
        where: { id: 'line-2' },
        data: { remaining: { decrement: 1 } },
      });
      // purchasePrice = Math.round((2*500 + 1*600) / 3) = Math.round(1600/3) = Math.round(533.33) = 533
      expect(mockTx.sale.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ purchasePrice: 533, unitSalePrice: null }),
        }),
      );
    });

    it('should set purchasePrice to null when no FIFO lots exist', async () => {
      mockTx.product.findUnique.mockResolvedValue({
        stockQuantity: 10,
        price: 100,
        name: 'Test Product',
      });

      // No FIFO lots available
      mockTx.purchaseOrderLine.findMany.mockResolvedValue([]);

      const expectedSale = {
        id: 'sale-2',
        ...baseDto,
        totalAmount: 300,
        purchasePrice: null,
        unitSalePrice: null,
        createdAt: new Date().toISOString(),
        product: { name: 'Test Product', price: 100 },
      };
      mockTx.sale.create.mockImplementation(async (args: any) => ({
        ...expectedSale,
        purchasePrice: args.data.purchasePrice ?? null,
        unitSalePrice: args.data.unitSalePrice ?? null,
      }));

      const result = await service.create(baseDto);

      expect(result.purchasePrice).toBeNull();
      expect(result.unitSalePrice).toBeNull();
      expect(mockTx.purchaseOrderLine.update).not.toHaveBeenCalled();
    });

    it('should use weighted average for multi-lot purchasePrice', async () => {
      mockTx.product.findUnique.mockResolvedValue({
        stockQuantity: 10,
        price: 100,
        name: 'Test Product',
      });

      // Three lots: 2@1000, 3@1500 (need 4 units)
      mockTx.purchaseOrderLine.findMany.mockResolvedValue([
        { id: 'line-1', productId: 'product-1', flavorId: null, remaining: 2, unitPurchasePrice: 1000, unitSalePrice: null },
        { id: 'line-2', productId: 'product-1', flavorId: null, remaining: 3, unitPurchasePrice: 1500, unitSalePrice: null },
      ]);

      const expectedSale = {
        id: 'sale-3',
        ...baseDto,
        totalAmount: 300,
        purchasePrice: null,
        unitSalePrice: null,
        createdAt: new Date().toISOString(),
        product: { name: 'Test Product', price: 100 },
      };
      mockTx.sale.create.mockImplementation(async (args: any) => ({
        ...expectedSale,
        purchasePrice: args.data.purchasePrice ?? null,
        unitSalePrice: args.data.unitSalePrice ?? null,
      }));

      // Need 3 units — consume 2@1000 + 1@1500 = 3500/3 = 1167
      const result = await service.create({ ...baseDto, quantity: 3 });

      expect(result.purchasePrice).toBe(1167);
    });

    it('should compute unitSalePrice from FIFO lots when available', async () => {
      mockTx.product.findUnique.mockResolvedValue({
        stockQuantity: 10,
        price: 100,
        name: 'Test Product',
      });

      mockTx.purchaseOrderLine.findMany.mockResolvedValue([
        { id: 'line-1', productId: 'product-1', flavorId: null, remaining: 5, unitPurchasePrice: 500, unitSalePrice: 1500 },
        { id: 'line-2', productId: 'product-1', flavorId: null, remaining: 5, unitPurchasePrice: 600, unitSalePrice: 1800 },
      ]);

      const expectedSale = {
        id: 'sale-4',
        ...baseDto,
        totalAmount: 300,
        purchasePrice: null,
        unitSalePrice: null,
        createdAt: new Date().toISOString(),
        product: { name: 'Test Product', price: 100 },
      };
      mockTx.sale.create.mockImplementation(async (args: any) => ({
        ...expectedSale,
        purchasePrice: args.data.purchasePrice ?? null,
        unitSalePrice: args.data.unitSalePrice ?? null,
      }));

      // Consume 3 units: 3@500 with salePrice 1500 = same weighted avg
      const result = await service.create({ ...baseDto, quantity: 3 });

      // purchasePrice = all from line-1: 3*500/3 = 500
      expect(result.purchasePrice).toBe(500);
      // unitSalePrice = all from line-1: 3*1500/3 = 1500
      expect(result.unitSalePrice).toBe(1500);
    });
  });

  describe('findAll', () => {
    const mockSales = Array.from({ length: 5 }, (_, i) => ({
      id: `sale-${i + 1}`,
      productId: `product-${(i % 2) + 1}`,
      quantity: i + 1,
      totalAmount: (i + 1) * 100,
      paymentMethod: 'CASH' as const,
      location: 'CORRIENTES' as const,
      createdAt: new Date(2024, 0, i + 1).toISOString(),
      product: { name: `Product ${(i % 2) + 1}`, price: 100 },
    }));

    it('should return paginated response with defaults', async () => {
      mockPrisma.sale.findMany.mockResolvedValue(mockSales);
      mockPrisma.sale.count.mockResolvedValue(25);

      const result = await service.findAll();

      expect(result).toEqual({
        data: mockSales,
        total: 25,
        page: 1,
        limit: 20,
        totalPages: 2,
      });
      expect(mockPrisma.sale.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });

    it('should accept custom page and limit', async () => {
      mockPrisma.sale.findMany.mockResolvedValue(mockSales);
      mockPrisma.sale.count.mockResolvedValue(50);

      const result = await service.findAll(undefined, undefined, 2, 10);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(5);
      expect(mockPrisma.sale.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });

    it('should return last page with remaining items', async () => {
      mockPrisma.sale.findMany.mockResolvedValue(mockSales.slice(0, 5));
      mockPrisma.sale.count.mockResolvedValue(25);

      const result = await service.findAll(undefined, undefined, 2, 20);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
      expect(result.total).toBe(25);
      expect(result.totalPages).toBe(2);
    });

    it('should return empty data for page beyond total', async () => {
      mockPrisma.sale.findMany.mockResolvedValue([]);
      mockPrisma.sale.count.mockResolvedValue(30);

      const result = await service.findAll(undefined, undefined, 10, 10);

      expect(result.data).toEqual([]);
      expect(result.page).toBe(10);
      expect(result.limit).toBe(10);
      expect(result.total).toBe(30);
      expect(result.totalPages).toBe(3);
    });

    it('should return totalPages 0 when there are no sales', async () => {
      mockPrisma.sale.findMany.mockResolvedValue([]);
      mockPrisma.sale.count.mockResolvedValue(0);

      const result = await service.findAll();

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('should filter by date range', async () => {
      mockPrisma.sale.findMany.mockResolvedValue(mockSales);
      mockPrisma.sale.count.mockResolvedValue(5);

      await service.findAll('2024-01-01', '2024-01-31', 1, 20);

      // The findMany should include a createdAt filter
      const findManyCall = mockPrisma.sale.findMany.mock.calls[0][0];
      expect(findManyCall.where.createdAt).toBeDefined();
      expect(findManyCall.where.createdAt.gte).toBeInstanceOf(Date);
      expect(findManyCall.where.createdAt.lte).toBeInstanceOf(Date);

      const countCall = mockPrisma.sale.count.mock.calls[0][0];
      expect(countCall.where.createdAt).toBeDefined();
    });
  });

  describe('getReports', () => {
    it('should return netProfit = totalRevenue - totalCost when sales have purchasePrice but no unitSalePrice', async () => {
      const salesWithCost = [
        { id: 's1', productId: 'p1', quantity: 2, totalAmount: 10000, purchasePrice: 2000, unitSalePrice: null, paymentMethod: 'CASH', location: 'CORRIENTES', createdAt: new Date('2024-01-01'), product: { name: 'P1', price: 5000, category: { id: 1, name: 'Cat1' } } },
        { id: 's2', productId: 'p2', quantity: 3, totalAmount: 15000, purchasePrice: 3000, unitSalePrice: null, paymentMethod: 'TRANSFER', location: 'MONTE_CASEROS', createdAt: new Date('2024-01-02'), product: { name: 'P2', price: 5000, category: { id: 2, name: 'Cat2' } } },
      ];
      mockPrisma.sale.findMany.mockResolvedValue(salesWithCost);

      const result = await service.getReports({});

      // totalRevenue = 10000 + 15000 = 25000
      // totalCost = 2*2000 + 3*3000 = 4000 + 9000 = 13000
      // Fallback: (10000-4000) + (15000-9000) = 6000+6000 = 12000
      expect(result.summary.totalRevenue).toBe(25000);
      expect(result.summary.totalCost).toBe(13000);
      expect(result.summary.netProfit).toBe(12000);
    });

    it('should use unitSalePrice when available for netProfit', async () => {
      const salesWithPrice = [
        { id: 's1', productId: 'p1', quantity: 2, totalAmount: 10000, purchasePrice: 2000, unitSalePrice: 5000, paymentMethod: 'CASH', location: 'CORRIENTES', createdAt: new Date('2024-01-01'), product: { name: 'P1', price: 5000, category: { id: 1, name: 'Cat1' } } },
        { id: 's2', productId: 'p2', quantity: 3, totalAmount: 15000, purchasePrice: 3000, unitSalePrice: 6000, paymentMethod: 'TRANSFER', location: 'MONTE_CASEROS', createdAt: new Date('2024-01-02'), product: { name: 'P2', price: 5000, category: { id: 2, name: 'Cat2' } } },
      ];
      mockPrisma.sale.findMany.mockResolvedValue(salesWithPrice);

      const result = await service.getReports({});

      // totalCost = 2*2000 + 3*3000 = 13000
      // netProfit = 2*(5000-2000) + 3*(6000-3000) = 6000 + 9000 = 15000
      expect(result.summary.totalCost).toBe(13000);
      expect(result.summary.netProfit).toBe(15000);
    });

    it('should exclude sales with null purchasePrice from totalCost', async () => {
      const mixedSales = [
        { id: 's1', productId: 'p1', quantity: 2, totalAmount: 10000, purchasePrice: 2000, unitSalePrice: null, paymentMethod: 'CASH', location: 'CORRIENTES', createdAt: new Date('2024-01-01'), product: { name: 'P1', price: 5000, category: { id: 1, name: 'Cat1' } } },
        { id: 's2', productId: 'p2', quantity: 3, totalAmount: 15000, purchasePrice: null, unitSalePrice: null, paymentMethod: 'TRANSFER', location: 'MONTE_CASEROS', createdAt: new Date('2024-01-02'), product: { name: 'P2', price: 5000, category: { id: 2, name: 'Cat2' } } },
      ];
      mockPrisma.sale.findMany.mockResolvedValue(mixedSales);

      const result = await service.getReports({});

      // totalRevenue = 25000
      // totalCost = 2*2000 = 4000 (s2 has null purchasePrice, excluded)
      // netProfit = (10000-4000) + 15000 = 21000
      expect(result.summary.totalRevenue).toBe(25000);
      expect(result.summary.totalCost).toBe(4000);
      expect(result.summary.netProfit).toBe(21000);
    });

    it('should handle all sales with null purchasePrice', async () => {
      const noCostSales = [
        { id: 's1', productId: 'p1', quantity: 2, totalAmount: 10000, purchasePrice: null, unitSalePrice: null, paymentMethod: 'CASH', location: 'CORRIENTES', createdAt: new Date('2024-01-01'), product: { name: 'P1', price: 5000, category: { id: 1, name: 'Cat1' } } },
      ];
      mockPrisma.sale.findMany.mockResolvedValue(noCostSales);

      const result = await service.getReports({});

      expect(result.summary.totalRevenue).toBe(10000);
      expect(result.summary.totalCost).toBe(0);
      expect(result.summary.netProfit).toBe(10000);
    });
  });
});
