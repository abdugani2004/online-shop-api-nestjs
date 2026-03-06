import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../../database/entities/cart.entity';
import { CartItem } from '../../database/entities/cart-item.entity';
import { Product } from '../../database/entities/product.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartsRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemsRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async getMyCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    return this.getDetailedCart(cart.id);
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const cart = await this.getOrCreateCart(userId);

    const product = await this.productsRepository.findOne({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existing = await this.cartItemsRepository.findOne({
      where: { cartId: cart.id, productId: dto.productId },
    });

    const nextQuantity = (existing?.quantity ?? 0) + dto.quantity;

    if (nextQuantity > product.stock) {
      throw new BadRequestException('Requested quantity exceeds stock');
    }

    if (existing) {
      existing.quantity = nextQuantity;
      await this.cartItemsRepository.save(existing);
    } else {
      await this.cartItemsRepository.save(
        this.cartItemsRepository.create({
          cartId: cart.id,
          productId: dto.productId,
          quantity: dto.quantity,
        }),
      );
    }

    return this.getDetailedCart(cart.id);
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const cart = await this.getOrCreateCart(userId);

    const item = await this.cartItemsRepository.findOne({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    const product = await this.productsRepository.findOne({
      where: { id: item.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (dto.quantity > product.stock) {
      throw new BadRequestException('Requested quantity exceeds stock');
    }

    item.quantity = dto.quantity;
    await this.cartItemsRepository.save(item);

    return this.getDetailedCart(cart.id);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateCart(userId);
    const item = await this.cartItemsRepository.findOne({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartItemsRepository.remove(item);
    return this.getDetailedCart(cart.id);
  }

  async clear(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    await this.cartItemsRepository.delete({ cartId: cart.id });
    return this.getDetailedCart(cart.id);
  }

  async getOrCreateCart(userId: string) {
    let cart = await this.cartsRepository.findOne({ where: { userId } });

    if (!cart) {
      cart = await this.cartsRepository.save(this.cartsRepository.create({ userId }));
    }

    return cart;
  }

  async getDetailedCart(cartId: string) {
    const cart = await this.cartsRepository.findOne({
      where: { id: cartId },
      relations: {
        items: {
          product: true,
        },
      },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const totalAmount = cart.items.reduce((sum, item) => {
      return sum + Number(item.product.price) * item.quantity;
    }, 0);

    return {
      ...cart,
      totalAmount,
    };
  }
}
