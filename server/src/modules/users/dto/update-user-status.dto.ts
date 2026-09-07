import {
    IsEnum,
    IsNotEmpty,
} from 'class-validator';

import { Status } from '../../../generated/prisma/client.js';


export class UpdateUserStatusDto {
    @IsEnum(Status)
    @IsNotEmpty()
    status: Status;
}