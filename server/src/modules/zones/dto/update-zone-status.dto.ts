import {
    IsEnum,
} from 'class-validator';

import {
    Status,
} from '../../../generated/prisma/browser.js';


export class UpdateZoneStatusDto {
    @IsEnum(Status)
    status: Status;
}