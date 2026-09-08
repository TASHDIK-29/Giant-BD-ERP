import { Type } from 'class-transformer';

import {
    ArrayMinSize,
    IsArray,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';

import {
    Gender,
    PackagingType,
    Status,
    Uom,
} from '../../../generated/prisma/browser.js';


export class CreateProductVariantsDto {
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


    @IsArray()
    @ArrayMinSize(1)
    @IsString({
        each: true,
    })
    @IsNotEmpty({
        each: true,
    })
    @MaxLength(50, {
        each: true,
    })
    sizes: string[];


    @IsOptional()
    @IsString()
    @MaxLength(100)
    modelNumber?: string;


    @IsEnum(Uom)
    uom: Uom;


    @Type(() => Number)
    @IsInt()
    @Min(1)
    productsPerPacket: number;


    @IsEnum(PackagingType)
    packagingType: PackagingType;


    @IsOptional()
    @IsEnum(Status)
    status?: Status;
}