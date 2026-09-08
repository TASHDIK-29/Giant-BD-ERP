import { Type } from 'class-transformer';

import {
    IsInt,
    IsOptional,
    IsString,
    MaxLength,
    Min,
    ValidateIf,
} from 'class-validator';


export class UpdateCategoryDto {
    @IsOptional()
    @IsString()
    @MaxLength(150)
    name?: string;


    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string | null;


    @IsOptional()
    @ValidateIf(
        (object) => object.mediaId !== null,
    )
    @Type(() => Number)
    @IsInt()
    @Min(1)
    mediaId?: number | null;


    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    sortOrder?: number;
}