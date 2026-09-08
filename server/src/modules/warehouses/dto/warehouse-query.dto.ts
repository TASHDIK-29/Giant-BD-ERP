import { Type } from 'class-transformer';

import {
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';

import {
    Status,
} from '../../../generated/prisma/browser.js';


export class WarehouseQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;


    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit: number = 10;


    @IsOptional()
    @IsString()
    search?: string;


    @IsOptional()
    @IsEnum(Status)
    status?: Status;
}