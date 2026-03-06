import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CartItem } from '../../database/entities/cart-item.entity';
import { Cart } from '../../database/entities/cart.entity';
import { OrderItem } from '../../database/entities/order-item.entity';
import { Order } from '../../database/entities/order.entity';
import { Product } from '../../database/entities/product.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Cart)
    private readonly cartsRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemsRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async createFromCart(userId: string) {
    const cart = await this.cartsRepository.findOne({ where: { userId } });
    if (!cart) {
      throw new BadRequestException('Cart is empty');
    }

    const cartItems = await this.cartItemsRepository.find({
      where: { cartId: cart.id },
      relations: { product: true },
    });

    if (!cartItems.length) {
      throw new BadRequestException('Cart is empty');
    }

    return this.dataSource.transaction(async (manager) => {
      let totalAmount = 0;

      for (const item of cartItems) {
        if (item.quantity > item.product.stock) {
          throw new BadRequestException(
            `Not enough stock for product ${item.product.name}`,
          );
        }

        totalAmount += Number(item.product.price) * item.quantity;
      }

      const order = await manager.save(
        Order,
        manager.create(Order, {
          userId,
          totalAmount,
        }),
      );

      for (const item of cartItems) {
        await manager.save(
          OrderItem,
          manager.create(OrderItem, {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.product.price,
          }),
        );

        item.product.stock -= item.quantity;
        await manager.save(Product, item.product);
      }

      await manager.delete(CartItem, { cartId: cart.id });

      return this.findOne(order.id, userId);
    });
  }

  async findMyOrders(userId: string, pagination: PaginationDto) {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;

    const [items, total] = await this.ordersRepository.findAndCount({
      where: { userId },
      relations: {
        items: {
          product: true,
        },
      },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAll(pagination: PaginationDto) {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;

    const [items, total] = await this.ordersRepository.findAndCount({
      relations: {
        items: {
          product: true,
        },
        user: true,
      },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(orderId: string, userId?: string) {
    const order = await this.ordersRepository.findOne({
      where: userId ? { id: orderId, userId } : { id: orderId },
      relations: {
        items: {
          product: true,
        },
        user: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this.findOne(orderId);
    order.status = dto.status;
    return this.ordersRepository.save(order);
  }
}
