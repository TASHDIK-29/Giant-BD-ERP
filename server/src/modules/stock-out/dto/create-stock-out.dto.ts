import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import { Gender } from '../../../generated/prisma/client.js';

export class CreateStockOutItemDto {
  @IsNotEmpty()
  batchId: string;

  @IsInt()
  @IsPositive()
  productVariantId: number;

  @IsInt()
  @IsPositive()
  quantity: number;
}

export class CreateStockOutDto {
  @IsInt()
  @IsPositive()
  buyerId: number;

  @IsInt()
  @IsPositive()
  letterOfCreditId: number;

  @IsInt()
  @IsPositive()
  purchaseOrderId: number;

  @IsInt()
  @IsPositive()
  masterProductId: number;

  @IsInt()
  @IsPositive()
  colorId: number;

  @IsEnum(Gender)
  gender: Gender;

  @IsDateString()
  requestDate: string;

  @IsOptional()
  @IsDateString()
  stockOutDate?: string;

  @ValidateNested({ each: true })
  @Type(() => CreateStockOutItemDto)
  items: CreateStockOutItemDto[];
}