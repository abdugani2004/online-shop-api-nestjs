import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CartService } from './cart.service';

describe('CartService', () => {
  let service: CartService;

  const cartsRepositoryMock = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  } as any;

  const cartItemsRepositoryMock = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
    delete: jest.fn(),
  } as any;

  const productsRepositoryMock = {
    findOne: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CartService(
      cartsRepositoryMock,
      cartItemsRepositoryMock,
      productsRepositoryMock,
    );
  });

  it('addItem should throw when product not found', async () => {
    jest.spyOn(service, 'getOrCreateCart').mockResolvedValue({ id: 'cart1' } as any);
    productsRepositoryMock.findOne.mockResolvedValue(null);

    await expect(
      service.addItem('u1', { productId: 'p1', quantity: 1 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('addItem should throw when quantity exceeds stock', async () => {
    jest.spyOn(service, 'getOrCreateCart').mockResolvedValue({ id: 'cart1' } as any);
    productsRepositoryMock.findOne.mockResolvedValue({ id: 'p1', stock: 2 });
    cartItemsRepositoryMock.findOne.mockResolvedValue({ quantity: 2 });

    await expect(
      service.addItem('u1', { productId: 'p1', quantity: 1 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('getDetailedCart should include totalAmount', async () => {
    cartsRepositoryMock.findOne.mockResolvedValue({
      id: 'cart1',
      items: [
        { quantity: 2, product: { price: 10 } },
        { quantity: 1, product: { price: 5.5 } },
      ],
    });

    const result = await service.getDetailedCart('cart1');

    expect(result.totalAmount).toBe(25.5);
  });
});
