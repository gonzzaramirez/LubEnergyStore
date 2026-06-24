import { Test, TestingModule } from '@nestjs/testing';
import { SuppliersService } from './suppliers.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SuppliersService', () => {
  let service: SuppliersService;
  let prisma: jest.Mocked<PrismaService>;

  const mockPrisma = {
    supplier: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((cb: any) => cb(mockPrisma)),
  } as unknown as jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuppliersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SuppliersService>(SuppliersService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // R-SUP-01: Create Supplier
  describe('create', () => {
    it('should create a supplier with name, contact, phone, email, notes, isActive defaults to true', async () => {
      const dto = {
        name: 'Proveedor Test',
        contact: 'Juan Perez',
        phone: '123456789',
        email: 'juan@test.com',
        notes: 'Nota de prueba',
      };
      const expected = { id: 'uuid-1', ...dto, isActive: true, createdAt: new Date(), updatedAt: new Date() };
      mockPrisma.supplier.create.mockResolvedValue(expected);

      const result = await service.create(dto);

      expect(mockPrisma.supplier.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toEqual(expected);
    });

    it('should create a supplier with only name (minimum required)', async () => {
      const dto = { name: 'Minimal Supplier' };
      const expected = { id: 'uuid-2', name: 'Minimal Supplier', contact: null, phone: null, email: null, notes: null, isActive: true, createdAt: new Date(), updatedAt: new Date() };
      mockPrisma.supplier.create.mockResolvedValue(expected);

      const result = await service.create(dto);

      expect(mockPrisma.supplier.create).toHaveBeenCalledWith({ data: dto });
      expect(result.name).toBe('Minimal Supplier');
    });
  });

  // R-SUP-02: List Suppliers
  describe('findAll', () => {
    it('should return all suppliers', async () => {
      const expected = [
        { id: 'uuid-1', name: 'Supplier A', isActive: true },
        { id: 'uuid-2', name: 'Supplier B', isActive: false },
      ];
      mockPrisma.supplier.findMany.mockResolvedValue(expected);

      const result = await service.findAll();

      expect(mockPrisma.supplier.findMany).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });

    it('should return empty array when no suppliers exist', async () => {
      mockPrisma.supplier.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  // R-SUP-03: Get Single Supplier
  describe('findOne', () => {
    it('should return a supplier by id', async () => {
      const expected = { id: 'uuid-1', name: 'Supplier A', isActive: true };
      mockPrisma.supplier.findUnique.mockResolvedValue(expected);

      const result = await service.findOne('uuid-1');

      expect(mockPrisma.supplier.findUnique).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
      expect(result).toEqual(expected);
    });

    it('should throw NotFoundException when supplier not found', async () => {
      mockPrisma.supplier.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow('Proveedor con ID nonexistent no encontrado');
    });
  });

  // R-SUP-04: Update Supplier
  describe('update', () => {
    it('should update supplier fields', async () => {
      const existing = { id: 'uuid-1', name: 'Old Name', isActive: true };
      mockPrisma.supplier.findUnique.mockResolvedValueOnce(existing);
      const updated = { ...existing, name: 'New Name' };
      mockPrisma.supplier.update.mockResolvedValue(updated);

      const result = await service.update('uuid-1', { name: 'New Name' });

      expect(mockPrisma.supplier.update).toHaveBeenCalledWith({ where: { id: 'uuid-1' }, data: { name: 'New Name' } });
      expect(result.name).toBe('New Name');
    });

    it('should throw NotFoundException when updating nonexistent supplier', async () => {
      mockPrisma.supplier.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', { name: 'New' })).rejects.toThrow('Proveedor con ID nonexistent no encontrado');
    });
  });

  // R-SUP-05: Deactivate Supplier
  describe('deactivate', () => {
    it('should soft-deactivate a supplier by setting isActive to false', async () => {
      const existing = { id: 'uuid-1', name: 'Supplier A', isActive: true };
      mockPrisma.supplier.findUnique.mockResolvedValueOnce(existing);
      const deactivated = { ...existing, isActive: false };
      mockPrisma.supplier.update.mockResolvedValue(deactivated);

      const result = await service.deactivate('uuid-1');

      expect(mockPrisma.supplier.update).toHaveBeenCalledWith({ where: { id: 'uuid-1' }, data: { isActive: false } });
      expect(result.isActive).toBe(false);
    });

    it('should throw NotFoundException when deactivating nonexistent supplier', async () => {
      mockPrisma.supplier.findUnique.mockResolvedValue(null);

      await expect(service.deactivate('nonexistent')).rejects.toThrow('Proveedor con ID nonexistent no encontrado');
    });
  });
});
