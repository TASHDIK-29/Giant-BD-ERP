import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

import { Type } from 'class-transformer';

import {
  Gender,
  StockOutStatus,
} from '../../../generated/prisma/client.js';

export class QueryStockOutDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  buyerId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  letterOfCreditId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  purchaseOrderId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  masterProductId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  colorId?: number;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsEnum(StockOutStatus)
  status?: StockOutStatus;

  @IsOptional()
  @IsDateString()
  requestDateFrom?: string;

  @IsOptional()
  @IsDateString()
  requestDateTo?: string;
}