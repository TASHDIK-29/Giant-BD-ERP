import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
} from '@nestjs/common';

import { RolesService } from './roles.service.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { QueryRoleDto } from './dto/query-role.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';



@Controller('roles')
export class RolesController {
    constructor(
        private readonly rolesService: RolesService,
    ) { }



    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createRole(
        @Body()
        createRoleDto: CreateRoleDto,
    ) {
        const role =
            await this.rolesService.createRole(
                createRoleDto,
            );

        return {
            message: 'Role created successfully',
            data: role,
        };
    }



    @Get()
    @HttpCode(HttpStatus.OK)
    async findAllRoles(
        @Query() queryRoleDto: QueryRoleDto,
    ) {
        return this.rolesService.findAllRoles(
            queryRoleDto,
        );
    }



    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOneRole(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.rolesService.findOneRole(id);
    }



    @Put(':id')
    @HttpCode(HttpStatus.OK)
    async updateRole(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateRoleDto: UpdateRoleDto,
    ) {
        const role =
            await this.rolesService.updateRole(
                id,
                updateRoleDto,
            );

        return {
            message: 'Role updated successfully',
            data: role,
        };
    }




    @Delete(':id')
    async remove(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.rolesService.remove(id);
    }



}