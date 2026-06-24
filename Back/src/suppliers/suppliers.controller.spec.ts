import { Test, TestingModule } from '@nestjs/testing';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

describe('SuppliersController', () => {
  let controller: SuppliersController;
  let service: jest.Mocked<SuppliersService>;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    deactivate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuppliersController],
      providers: [
        { provide: SuppliersService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<SuppliersController>(SuppliersController);
    service = module.get(SuppliersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call service.create with the DTO', async () => {
      const dto: CreateSupplierDto = { name: 'Test Supplier', contact: 'John' };
      mockService.create.mockResolvedValue({ id: 'uuid', ...dto });

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: 'uuid', ...dto });
    });
  });

  describe('findAll', () => {
    it('should return all suppliers', async () => {
      const expected = [{ id: 'uuid', name: 'Supplier' }];
      mockService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with the id', async () => {
      mockService.findOne.mockResolvedValue({ id: 'uuid-1', name: 'Supplier' });

      const result = await controller.findOne('uuid-1');

      expect(service.findOne).toHaveBeenCalledWith('uuid-1');
      expect(result).toEqual({ id: 'uuid-1', name: 'Supplier' });
    });
  });

  describe('update', () => {
    it('should call service.update with id and DTO', async () => {
      const dto: UpdateSupplierDto = { name: 'Updated' };
      mockService.update.mockResolvedValue({ id: 'uuid-1', name: 'Updated' });

      const result = await controller.update('uuid-1', dto);

      expect(service.update).toHaveBeenCalledWith('uuid-1', dto);
      expect(result).toEqual({ id: 'uuid-1', name: 'Updated' });
    });
  });

  describe('deactivate', () => {
    it('should call service.deactivate with the id', async () => {
      mockService.deactivate.mockResolvedValue({ id: 'uuid-1', isActive: false });

      const result = await controller.deactivate('uuid-1');

      expect(service.deactivate).toHaveBeenCalledWith('uuid-1');
      expect(result).toEqual({ id: 'uuid-1', isActive: false });
    });
  });
});
