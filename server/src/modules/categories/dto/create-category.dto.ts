import {
    IsInt,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';

import { Type } from 'class-transformer';


export class CreateCategoryDto {
    @IsString()
    @MaxLength(150)
    name: string;


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