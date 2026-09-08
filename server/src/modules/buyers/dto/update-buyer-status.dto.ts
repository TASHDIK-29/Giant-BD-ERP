import {
    IsEnum,
} from 'class-validator';

import {
    Status,
} from '../../../generated/prisma/browser.js';


export class UpdateBuyerStatusDto {
    @IsEnum(Status)
    status: Status;
}