import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from '../../database/entities/cart-item.entity';
import { Cart } from '../../database/entities/cart.entity';
import { OrderItem } from '../../database/entities/order-item.entity';
import { Order } from '../../database/entities/order.entity';
import { Product } from '../../database/entities/product.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Cart, CartItem, Product])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
