import { Type } from 'class-transformer';

import {
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

import {
    Gender,
    Status,
} from '../../../generated/prisma/browser.js';


export class ProductVariantQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;


    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;


    @IsOptional()
    @IsString()
    search?: string;


    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    masterProductId?: number;


    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    colorId?: number;


    @IsOptional()
    @IsEnum(Gender)
    gender?: Gender;


    @IsOptional()
    @IsEnum(Status)
    status?: Status;
}