import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Query,
} from '@nestjs/common';

import { UsersService } from './users.service.js';

import { CreateUserDto } from './dto/create-user.dto.js';

import { QueryUsersDto } from './dto/query-users.dto.js';

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




    @Get()
    @RequirePermission('user:read')
    async findAll(
        @Query() queryUsersDto: QueryUsersDto,
    ) {
        return this.usersService.findAll(
            queryUsersDto,
        );
    }



    @Get(':id')
    @RequirePermission('user:read')
    async findOne(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.usersService.findOne(id);
    }




    

}