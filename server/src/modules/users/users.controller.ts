import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
} from '@nestjs/common';

import { UsersService } from './users.service.js';

import { CreateUserDto } from './dto/create-user.dto.js';

import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';


@Controller('users')
export class UsersController {

    constructor(
        private readonly usersService: UsersService,
    ) { }


    @Post()
    @HttpCode(HttpStatus.CREATED)
    @RequirePermission('user:create')
    async create(
        @Body() createUserDto: CreateUserDto,
    ) {
        return this.usersService.create(
            createUserDto,
        );
    }
}