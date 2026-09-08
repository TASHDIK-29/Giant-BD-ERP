import {
    IsEnum,
} from 'class-validator';

import {
    Status,
} from '../../../generated/prisma/browser.js';


export class UpdateSubZoneStatusDto {
    @IsEnum(Status)
    status: Status;
}