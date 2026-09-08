import {
    IsEnum,
} from 'class-validator';

import {
    Status,
} from '../../../generated/prisma/browser.js';


export class UpdateWarehouseStatusDto {
    @IsEnum(Status)
    status: Status;
}