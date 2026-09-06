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


import {
  RequirePermission,
} from '../../common/decorators/require-permission.decorator.js';


@Controller('permissions')
export class PermissionsController {
    constructor(
        private readonly permissionsService: PermissionsService,
    ) { }




    @Post('groups')
    @HttpCode(HttpStatus.CREATED)
    @RequirePermission('permission:create')
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
    @RequirePermission('permission:read')
    async findAllPermissionGroups(
        @Query()
        queryPermissionDto: QueryPermissionDto,
    ) {
        return this.permissionsService.findAllPermissionGroups(
            queryPermissionDto,
        );
    }




    @Put('groups/:id')
    @RequirePermission('permission:read')
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
    @RequirePermission('permission:update')
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
    @RequirePermission('permission:delete')
    async removePermissionGroup(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.permissionsService.removePermissionGroup(id);
    }



    
}