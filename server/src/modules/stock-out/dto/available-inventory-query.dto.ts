import {
  IsEnum,
  IsInt,
  IsPositive,
} from 'class-validator';

import { Type } from 'class-transformer';

import { Gender } from '../../../generated/prisma/client.js';

export class AvailableInventoryQueryDto {
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
}