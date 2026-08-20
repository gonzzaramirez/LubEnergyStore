import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateOrderDto } from './create-order.dto';

const VALID_ITEM = {
  productId: '123e4567-e89b-42d3-a456-426614174000',
  productName: 'Creatina',
  quantity: 1,
  unitPrice: 1000,
};

describe('CreateOrderDto', () => {
  it('passes validation when buyer fields are omitted (buyer fields optional)', async () => {
    const dto = plainToInstance(CreateOrderDto, {
      items: [VALID_ITEM],
      totalAmount: 1000,
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('still requires items and totalAmount', async () => {
    const dto = plainToInstance(CreateOrderDto, {});
    const errors = await validate(dto);
    const props = errors.map((e) => e.property);

    expect(props).toContain('items');
    expect(props).toContain('totalAmount');
  });

  it('still validates buyer fields when they are provided', async () => {
    const dto = plainToInstance(CreateOrderDto, {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@ejemplo.com',
      phone: '12345678',
      dni: '12345678',
      street: 'Av. Corrientes 1234',
      city: 'CABA',
      province: 'Buenos Aires',
      items: [{ ...VALID_ITEM, quantity: 2 }],
      totalAmount: 2000,
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });
});
