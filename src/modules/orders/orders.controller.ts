import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { UserRole } from '../../common/enums/user-role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createFromCart(@CurrentUser() user: { id: string }) {
    return this.ordersService.createFromCart(user.id);
  }

  @Get('my')
  findMyOrders(
    @CurrentUser() user: { id: string },
    @Query() pagination: PaginationDto,
  ) {
    return this.ordersService.findMyOrders(user.id, pagination);
  }

  @Get('admin')
  @Roles(UserRole.ADMIN)
  findAll(@Query() pagination: PaginationDto) {
    return this.ordersService.findAll(pagination);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { id: string; role: UserRole }, @Param('id') id: string) {
    if (user.role === UserRole.ADMIN) {
      return this.ordersService.findOne(id);
    }

    return this.ordersService.findOne(id, user.id);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }
}
