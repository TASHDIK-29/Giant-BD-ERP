// import { PartialType } from '@nestjs/mapped-types';

// import { CreateProductVariantsDto } from "./create-product-variants.dto.js";

// // import { CreateProductVariantDto } from './create-product-variant.dto.js';


// export class UpdateProductVariantDto extends PartialType(
//     CreateProductVariantsDto,
// ) {}


import {
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

import {
    Gender,
    PackagingType,
    Uom,
} from '../../../generated/prisma/browser.js';
import { Type } from 'class-transformer';


export class UpdateProductVariantDto {
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
    @IsString()
    size?: string;


    @IsOptional()
    @IsString()
    modelNumber?: string;


    @IsOptional()
    @IsEnum(Uom)
    uom?: Uom;


    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    productsPerPacket?: number;


    @IsOptional()
    @IsEnum(PackagingType)
    packagingType?: PackagingType;
}