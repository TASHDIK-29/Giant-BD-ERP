import { IsEnum } from 'class-validator';

import { StockOutStatus } from '../../../generated/prisma/client.js';

export class UpdateStockOutDto {
  @IsEnum(StockOutStatus)
  status: StockOutStatus;
}