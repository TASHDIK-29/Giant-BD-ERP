import {
    IsEnum,
} from 'class-validator';

import {
    Status,
} from '../../../generated/prisma/browser.js';


export class UpdateRackStatusDto {
    @IsEnum(Status)
    status: Status;
}