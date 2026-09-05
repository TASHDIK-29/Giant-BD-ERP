import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Get,
    Query,
} from '@nestjs/common';

import { PermissionsService } from './permissions.service.js';

import { CreatePermissionGroupDto } from './dto/create-permission-group.dto.js';

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
}