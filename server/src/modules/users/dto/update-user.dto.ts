import {
    IsEmail,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';

import { Type } from 'class-transformer';

import { Gender } from '../../../generated/prisma/client.js';


export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    name?: string;


    @IsOptional()
    @IsEmail()
    email?: string;


    @IsOptional()
    @IsString()
    @MaxLength(30)
    phone?: string;


    @IsOptional()
    @IsEnum(Gender)
    gender?: Gender;


    @IsOptional()
    @IsString()
    avatar?: string;


    @IsOptional()
    @IsString()
    signature?: string;


    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    roleId?: number;
}