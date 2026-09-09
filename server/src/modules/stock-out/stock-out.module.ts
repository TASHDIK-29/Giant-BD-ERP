// import { Module } from '@nestjs/common';
// import { StockOutController } from './stock-out.controller.js';
// import { StockOutService } from './stock-out.service.js';

// @Module({
//   controllers: [StockOutController],
//   providers: [StockOutService]
// })
// export class StockOutModule {}


import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module.js';

import { StockOutController } from './stock-out.controller.js';
import { StockOutService } from './stock-out.service.js';

@Module({
  imports: [DatabaseModule],

  controllers: [StockOutController],

  providers: [StockOutService],

  exports: [StockOutService],
})
export class StockOutModule {}