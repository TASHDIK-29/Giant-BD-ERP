import {
    IsEnum,
} from 'class-validator';

import {
    Status,
} from '../../../generated/prisma/client.js';


export class UpdateMasterProductStatusDto {
    @IsEnum(Status)
    status: Status;
}