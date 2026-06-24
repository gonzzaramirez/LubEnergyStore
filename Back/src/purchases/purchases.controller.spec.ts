import { Test, TestingModule } from '@nestjs/testing';
import { PurchasesController } from './purchases.controller';
import { PurchasesService } from './purchases.service';

describe('PurchasesController', () => {
  let controller: PurchasesController;
  let service: jest.Mocked<PurchasesService>;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    receive: jest.fn(),
    cancel: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchasesController],
      providers: [
        { provide: PurchasesService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<PurchasesController>(PurchasesController);
    service = module.get(PurchasesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call service.create with the DTO', async () => {
      const dto = { supplierId: 'sup-1', lines: [{ productName: 'A', quantity: 1, unitPurchasePrice: 500 }] };
      mockService.create.mockResolvedValue({ id: 'po-1', ...dto, totalAmount: 500, status: 'PENDING' });

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result.id).toBe('po-1');
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with query params', async () => {
      mockService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 });

      const result = await controller.findAll('1', '20', 'PENDING');

      expect(service.findAll).toHaveBeenCalledWith(1, 20, 'PENDING');
      expect(result).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with id', async () => {
      mockService.findOne.mockResolvedValue({ id: 'po-1', status: 'PENDING' });

      const result = await controller.findOne('po-1');

      expect(service.findOne).toHaveBeenCalledWith('po-1');
      expect(result.id).toBe('po-1');
    });
  });

  describe('receive', () => {
    it('should call service.receive with id', async () => {
      mockService.receive.mockResolvedValue({ id: 'po-1', status: 'RECEIVED' });

      const result = await controller.receive('po-1');

      expect(service.receive).toHaveBeenCalledWith('po-1');
      expect(result.status).toBe('RECEIVED');
    });
  });

  describe('cancel', () => {
    it('should call service.cancel with id', async () => {
      mockService.cancel.mockResolvedValue({ id: 'po-1', status: 'CANCELLED' });

      const result = await controller.cancel('po-1');

      expect(service.cancel).toHaveBeenCalledWith('po-1');
      expect(result.status).toBe('CANCELLED');
    });
  });
});
