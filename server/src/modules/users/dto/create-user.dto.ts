import {
    IsEmail,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

import { Gender } from '../../../generated/prisma/client.js';


export class CreateUserDto {

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;


    @IsEmail()
    @IsNotEmpty()
    email: string;


    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;


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


    @IsInt()
    @IsNotEmpty()
    roleId: number;
}