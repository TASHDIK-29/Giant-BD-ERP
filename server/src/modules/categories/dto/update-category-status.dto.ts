import { IsEnum } from 'class-validator';

import { Status } from '../../../generated/prisma/client.js';


export class UpdateCategoryStatusDto {
    @IsEnum(Status)
    status: Status;
}