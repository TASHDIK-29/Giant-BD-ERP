import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';


import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

import { StockOutService } from './stock-out.service.js';
import { CreateStockOutDto } from './dto/create-stock-out.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { QueryStockOutDto } from './dto/query-stock-out.dto.js';
import { UpdateStockOutDto } from './dto/update-stock-out-status.dto.js';

@Controller('stock-outs')
@UseGuards(JwtAuthGuard)
export class StockOutController {
  constructor(
    private readonly stockOutService: StockOutService,
  ) { }

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




  @Get()
  async findAll(
    @Query() query: QueryStockOutDto,
  ) {
    return this.stockOutService.findAll(query);
  }




  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.stockOutService.findOne(id);
  }



  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStockOutDto: UpdateStockOutDto,
  ) {
    return this.stockOutService.updateStatus(
      id,
      updateStockOutDto.status,
    );
  }




}