import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';

import { Type } from 'class-transformer';


export class CreateSubCategoryDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    name: string;


    @IsInt()
    @Min(1)
    @Type(() => Number)
    parentId: number;


    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string;


    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    mediaId?: number;


    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    sortOrder?: number;
}