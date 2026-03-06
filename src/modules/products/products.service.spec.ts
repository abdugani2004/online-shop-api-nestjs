import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Category } from '../../database/entities/category.entity';
import { Product } from '../../database/entities/product.entity';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;

  const qb = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  const productsRepositoryMock = {
    createQueryBuilder: jest.fn(() => qb),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  } as any;

  const categoriesRepositoryMock = {
    findOne: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProductsService(
      productsRepositoryMock,
      categoriesRepositoryMock,
    );
  });

  it('findAll should throw when minPrice > maxPrice', async () => {
    await expect(
      service.findAll({ minPrice: 100, maxPrice: 10 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('findOne should throw when product not found', async () => {
    productsRepositoryMock.findOne.mockResolvedValue(null);

    await expect(service.findOne('missing-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('create should save when category exists', async () => {
    categoriesRepositoryMock.findOne.mockResolvedValue({ id: 'c1' } as Category);
    productsRepositoryMock.create.mockReturnValue({ name: 'Phone' } as Product);
    productsRepositoryMock.save.mockResolvedValue({
      id: 'p1',
      name: 'Phone',
    } as Product);

    const result = await service.create({
      name: 'Phone',
      description: 'Smartphone',
      price: 999,
      stock: 3,
      categoryId: 'c1',
    });

    expect(result.id).toBe('p1');
    expect(productsRepositoryMock.save).toHaveBeenCalled();
  });
});
