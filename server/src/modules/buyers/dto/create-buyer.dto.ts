import {
    IsEnum,
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

import {
    BuyerType,
} from '../../../generated/prisma/browser.js';


export class CreateBuyerDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(150)
    name: string;


    @IsEnum(BuyerType)
    type: BuyerType;
}