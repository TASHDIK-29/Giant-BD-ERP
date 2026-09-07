import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    Req,
} from '@nestjs/common';

import type Request from 'express';

import { UsersService } from './users.service.js';

import { CreateUserDto } from './dto/create-user.dto.js';

import { QueryUsersDto } from './dto/query-users.dto.js';

import { UpdateUserDto } from './dto/update-user.dto.js';

import { UpdateUserStatusDto } from './dto/update-user-status.dto.js';

import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';



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






    @Patch(':id/status')
    @RequirePermission('user:update')
    async updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateUserStatusDto: UpdateUserStatusDto,
        @CurrentUser()
        user: {
            id: number;
            email: string;
            name: string;
            role: string;
        },
    ) {
        const currentUserId = user.id;

        return this.usersService.updateStatus(
            id,
            updateUserStatusDto.status,
            currentUserId,
        );
    }




    @Patch(':id')
    @RequirePermission('user:update')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateUserDto: UpdateUserDto,
        @CurrentUser()
        user: {
            id: number;
            email: string;
            name: string;
            role: string;
        },
    ) {
        const currentUserId = user.id;

        return this.usersService.update(
            id,
            updateUserDto,
            currentUserId
        );
    }


    @Delete(':id')
    @RequirePermission('user:delete')
    async remove(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser()
        user: {
            id: number;
        },
    ) {

        return this.usersService.remove(id, user.id);
    }

}