import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsPositive,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import { Gender } from '../../../generated/prisma/client.js';

import { StockOutItemDto } from './stock-out-item.dto.js';

export class CreateStockOutDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  buyerId: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  letterOfCreditId: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  purchaseOrderId: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  masterProductId: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  colorId: number;

  @IsEnum(Gender)
  gender: Gender;

  @IsDateString()
  requestDate: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => StockOutItemDto)
  items: StockOutItemDto[];
}