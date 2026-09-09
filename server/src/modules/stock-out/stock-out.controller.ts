import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionGuard } from '../../common/guards/permission.guard.js';

import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';

import { StockOutService } from './stock-out.service.js';

import { AvailableInventoryQueryDto } from './dto/available-inventory-query.dto.js';

@Controller('stock-out')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class StockOutController {
  constructor(
    private readonly stockOutService: StockOutService,
  ) {}

  @Get('available-inventory')
  @RequirePermission('stock-out:read')
  getAvailableInventory(
    @Query() query: AvailableInventoryQueryDto,
  ) {
    return this.stockOutService.getAvailableInventory(query);
  }
}