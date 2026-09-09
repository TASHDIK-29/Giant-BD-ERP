import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

import { StockOutService } from './stock-out.service.js';
import { CreateStockOutDto } from './dto/create-stock-out.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('stock-outs')
@UseGuards(JwtAuthGuard)
export class StockOutController {
  constructor(
    private readonly stockOutService: StockOutService,
  ) {}

  @Post()
  async create(
    @Body() createStockOutDto: CreateStockOutDto,
    // @Req() req: Request,
    @CurrentUser() user: { id: number }
  ) {
    // const user = req.user as {
    //   id: number;
    // };

    return this.stockOutService.create(
      createStockOutDto,
      user.id,
    );
  }
}