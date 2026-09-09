import {
  IsDateString,
  IsEnum,
  IsOptional,
} from 'class-validator';

import { StockOutStatus } from '../../../generated/prisma/client.js';

export class UpdateStockOutStatusDto {
  @IsEnum(StockOutStatus)
  status: StockOutStatus;

  @IsOptional()
  @IsDateString()
  stockOutDate?: string;
}