import {
    IsEnum,
} from 'class-validator';

import {
    Status,
} from '../../../generated/prisma/browser.js';


export class UpdateProductVariantStatusDto {
    @IsEnum(Status)
    status: Status;
}