import { Type } from 'class-transformer';
import {
    IsEnum,
    IsInt,
    IsOptional,
    IsPositive,
    IsString,
    Min,
} from 'class-validator';

import { Status } from '../../../generated/prisma/client.js';

export class QueryUsersDto {
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
    @IsPositive()
    roleId?: number;

    @IsOptional()
    @IsEnum(Status)
    status?: Status;
}