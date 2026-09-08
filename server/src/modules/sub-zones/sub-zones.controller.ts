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
} from '@nestjs/common';

import {
    RequirePermission,
} from '../../common/decorators/require-permission.decorator.js';

import {
    CreateSubZoneDto,
} from './dto/create-sub-zone.dto.js';

import {
    UpdateSubZoneDto,
} from './dto/update-sub-zone.dto.js';

import {
    UpdateSubZoneStatusDto,
} from './dto/update-sub-zone-status.dto.js';

import {
    SubZoneQueryDto,
} from './dto/sub-zone-query.dto.js';

import {
    SubZonesService,
} from './sub-zones.service.js';


@Controller('sub-zones')
export class SubZonesController {
    constructor(
        private readonly subZonesService:
            SubZonesService,
    ) {}


    @Post()
    @HttpCode(HttpStatus.CREATED)
    @RequirePermission('sub-zone:create')
    async create(
        @Body()
        createSubZoneDto:
            CreateSubZoneDto,
    ) {
        return this.subZonesService.create(
            createSubZoneDto,
        );
    }


    @Get()
    @RequirePermission('sub-zone:read')
    async findAll(
        @Query()
        query: SubZoneQueryDto,
    ) {
        return this.subZonesService.findAll(
            query,
        );
    }


    @Get(':id')
    @RequirePermission('sub-zone:read')
    async findOne(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.subZonesService.findOne(
            id,
        );
    }


    @Patch(':id')
    @RequirePermission('sub-zone:update')
    async update(
        @Param('id', ParseIntPipe)
        id: number,

        @Body()
        updateSubZoneDto:
            UpdateSubZoneDto,
    ) {
        return this.subZonesService.update(
            id,
            updateSubZoneDto,
        );
    }


    @Patch(':id/status')
    @RequirePermission('sub-zone:status')
    async updateStatus(
        @Param('id', ParseIntPipe)
        id: number,

        @Body()
        updateSubZoneStatusDto:
            UpdateSubZoneStatusDto,
    ) {
        return this.subZonesService.updateStatus(
            id,
            updateSubZoneStatusDto.status,
        );
    }


    @Delete(':id')
    @RequirePermission('sub-zone:delete')
    async remove(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.subZonesService.remove(id);
    }
}