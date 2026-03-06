import { IsEnum } from 'class-validator';
import { OrderStatus } from '../../../database/entities/order.entity';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
