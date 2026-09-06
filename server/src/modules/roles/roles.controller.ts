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

import { RolesService } from './roles.service.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { QueryRoleDto } from './dto/query-role.dto.js';

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




    
}