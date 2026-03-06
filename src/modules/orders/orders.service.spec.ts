import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OrderStatus } from '../../database/entities/order.entity';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;

  const dataSourceMock = {
    transaction: jest.fn(),
  } as unknown as DataSource;

  const ordersRepositoryMock = {
    findOne: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
  } as any;

  const orderItemsRepositoryMock = {} as any;

  const cartsRepositoryMock = {
    findOne: jest.fn(),
  } as any;

  const cartItemsRepositoryMock = {
    find: jest.fn(),
  } as any;

  const productsRepositoryMock = {} as any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OrdersService(
      dataSourceMock,
      ordersRepositoryMock,
      orderItemsRepositoryMock,
      cartsRepositoryMock,
      cartItemsRepositoryMock,
      productsRepositoryMock,
    );
  });

  it('createFromCart should throw when cart does not exist', async () => {
    cartsRepositoryMock.findOne.mockResolvedValue(null);

    await expect(service.createFromCart('u1')).rejects.toThrow(BadRequestException);
  });

  it('createFromCart should throw when cart has no items', async () => {
    cartsRepositoryMock.findOne.mockResolvedValue({ id: 'cart1' });
    cartItemsRepositoryMock.find.mockResolvedValue([]);

    await expect(service.createFromCart('u1')).rejects.toThrow(BadRequestException);
  });

  it('findOne should throw when order not found', async () => {
    ordersRepositoryMock.findOne.mockResolvedValue(null);

    await expect(service.findOne('o1')).rejects.toThrow(NotFoundException);
  });

  it('updateStatus should save updated status', async () => {
    const order = { id: 'o1', status: OrderStatus.PENDING };
    ordersRepositoryMock.findOne.mockResolvedValue(order);
    ordersRepositoryMock.save.mockImplementation(async (input: any) => input);

    const result = await service.updateStatus('o1', { status: OrderStatus.PAID });

    expect(result.status).toBe(OrderStatus.PAID);
    expect(ordersRepositoryMock.save).toHaveBeenCalled();
  });
});
