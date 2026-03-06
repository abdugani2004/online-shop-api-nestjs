import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Category } from './database/entities/category.entity';
import { Product } from './database/entities/product.entity';
import { User } from './database/entities/user.entity';
import { Cart } from './database/entities/cart.entity';
import { CartItem } from './database/entities/cart-item.entity';
import { Order } from './database/entities/order.entity';
import { OrderItem } from './database/entities/order-item.entity';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const dbSync = configService.get<string>('DB_SYNC', 'true') === 'true';
        const useSsl = configService.get<string>('DB_SSL', 'false') === 'true';

        return {
          type: 'postgres' as const,
          ...(databaseUrl
            ? { url: databaseUrl }
            : {
                host: configService.get<string>('DB_HOST', 'localhost'),
                port: Number(configService.get<string>('DB_PORT', '5432')),
                username: configService.get<string>('DB_USERNAME', 'postgres'),
                password: configService.get<string>('DB_PASSWORD', 'postgres'),
                database: configService.get<string>('DB_NAME', 'online_shop'),
              }),
          ssl: useSsl ? { rejectUnauthorized: false } : false,
          entities: [User, Category, Product, Cart, CartItem, Order, OrderItem],
          synchronize: dbSync,
        };
      },
    }),
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    CartModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
