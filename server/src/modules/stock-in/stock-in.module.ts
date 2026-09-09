import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module.js';

import { StockInController } from './stock-in.controller.js';
import { StockInService } from './stock-in.service.js';

@Module({
  imports: [DatabaseModule],
  controllers: [StockInController],
  providers: [StockInService],
})
export class StockInModule {}