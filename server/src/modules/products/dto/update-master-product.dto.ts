import { Type } from 'class-transformer';

import {
    IsInt,
    IsOptional,
    IsString,
    MaxLength,
    Min,
    MinLength,
    ValidateIf,
} from 'class-validator';


export class UpdateMasterProductDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(255)
    name?: string;


    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    categoryId?: number;


    @ValidateIf(
        (_, value) => value !== null,
    )
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    subCategoryId?: number | null;


    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    materialId?: number;
}