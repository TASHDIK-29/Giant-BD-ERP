import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Get,
    Query,
    Param,
    ParseIntPipe,
    Put,
    Delete,
} from '@nestjs/common';

import { PermissionsService } from './permissions.service.js';

import { CreatePermissionGroupDto } from './dto/create-permission-group.dto.js';
import { UpdatePermissionGroupDto } from './dto/update-permission-group.dto.js';

import { QueryPermissionDto } from './dto/query-permission.dto.js';

@Controller('permissions')
export class PermissionsController {
    constructor(
        private readonly permissionsService: PermissionsService,
    ) { }




    @Post('groups')
    @HttpCode(HttpStatus.CREATED)
    async createPermissionGroup(
        @Body()
        createPermissionGroupDto: CreatePermissionGroupDto,
    ) {
        const permissionGroup =
            await this.permissionsService.createPermissionGroup(
                createPermissionGroupDto,
            );

        return {
            message: 'Permission group created successfully',
            data: permissionGroup,
        };
    }


    @Get('groups')
    async findAllPermissionGroups(
        @Query()
        queryPermissionDto: QueryPermissionDto,
    ) {
        return this.permissionsService.findAllPermissionGroups(
            queryPermissionDto,
        );
    }




    @Put('groups/:id')
    async updatePermissionGroup(
        @Param('id', ParseIntPipe)
        id: number,

        @Body()
        updatePermissionGroupDto: UpdatePermissionGroupDto,
    ) {
        const permissionGroup =
            await this.permissionsService.updatePermissionGroup(
                id,
                updatePermissionGroupDto,
            );

        return {
            message: 'Permission group updated successfully',
            data: permissionGroup,
        };
    }



    @Get('groups/:id')
    async findOnePermissionGroup(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        const permissionGroup =
            await this.permissionsService.findOnePermissionGroup(id);

        return {
            data: permissionGroup,
        };
    }




    @Delete('groups/:id')
    @HttpCode(HttpStatus.OK)
    async removePermissionGroup(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.permissionsService.removePermissionGroup(id);
    }



    
}