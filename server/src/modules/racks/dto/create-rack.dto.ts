import {
    IsInt,
    IsOptional,
    IsString,
    MaxLength,
    Min,
    MinLength,
} from 'class-validator';

import {
    Type,
} from 'class-transformer';


export class CreateRackDto {
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name: string;


    @IsString()
    @MinLength(1)
    @MaxLength(50)
    code: string;


    @Type(() => Number)
    @IsInt()
    @Min(1)
    subZoneId: number;


    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;
}