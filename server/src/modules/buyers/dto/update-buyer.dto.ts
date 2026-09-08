import {
    IsEnum,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

import {
    BuyerType,
} from '../../../generated/prisma/browser.js';


export class UpdateBuyerDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(150)
    name?: string;


    @IsOptional()
    @IsEnum(BuyerType)
    type?: BuyerType;
}