import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsPositive,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

export enum StockAdjustmentAction {
  ADD = 'ADD',
  SUBTRACT = 'SUBTRACT',
}

export class StockInAdjustmentItemDto {
  @IsInt()
  @IsPositive()
  productVariantId: number;

  @IsInt()
  @IsPositive()
  adjustmentNumber: number;

  @IsEnum(StockAdjustmentAction)
  action: StockAdjustmentAction;
}

export class UpdateStockInDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => StockInAdjustmentItemDto)
  adjustments: StockInAdjustmentItemDto[];
}