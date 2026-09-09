import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';

export class StockInItemDto {
  @IsString()
  @IsNotEmpty()
  size: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  warehouseId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  zoneId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  subZoneId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  rackId: number;
}