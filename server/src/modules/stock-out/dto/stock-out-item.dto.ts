import {
  IsInt,
  IsPositive,
} from 'class-validator';

import { Type } from 'class-transformer';

export class StockOutItemDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  inventoryBatchId: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  quantity: number;
}