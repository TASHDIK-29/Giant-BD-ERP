import {
    IsInt,
    IsOptional,
    IsString,
    MaxLength,
    Min,
    MinLength,
} from 'class-validator';

import { Type } from 'class-transformer';


export class CreateMasterProductDto {
    @IsString()
    @MinLength(2)
    @MaxLength(255)
    name: string;


    @Type(() => Number)
    @IsInt()
    @Min(1)
    categoryId: number;


    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    subCategoryId?: number;


    @Type(() => Number)
    @IsInt()
    @Min(1)
    materialId: number;
}