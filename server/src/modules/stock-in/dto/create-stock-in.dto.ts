import { Type } from 'class-transformer';

import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  Min,
} from 'class-validator';


import { StockInItemDto } from './stock-in-item.dto.js';
import { Gender } from '../../../generated/prisma/enums.js';

export class CreateStockInDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  masterProductId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  colorId: number;

  @IsEnum(Gender)
  gender: Gender;

  @IsDateString()
  stockInDate: string;

  @IsDateString()
  productionDate: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => StockInItemDto)
  items: StockInItemDto[];
}