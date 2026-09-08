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
    CreateZoneDto,
} from './dto/create-zone.dto.js';

import {
    UpdateZoneDto,
} from './dto/update-zone.dto.js';

import {
    UpdateZoneStatusDto,
} from './dto/update-zone-status.dto.js';

import {
    ZoneQueryDto,
} from './dto/zone-query.dto.js';

import {
    ZonesService,
} from './zones.service.js';


@Controller('zones')
export class ZonesController {
    constructor(
        private readonly zonesService:
            ZonesService,
    ) {}


    @Post()
    @HttpCode(HttpStatus.CREATED)
    @RequirePermission('zone:create')
    async create(
        @Body()
        createZoneDto: CreateZoneDto,
    ) {
        return this.zonesService.create(
            createZoneDto,
        );
    }


    @Get()
    @RequirePermission('zone:read')
    async findAll(
        @Query()
        query: ZoneQueryDto,
    ) {
        return this.zonesService.findAll(
            query,
        );
    }


    @Get(':id')
    @RequirePermission('zone:read')
    async findOne(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.zonesService.findOne(
            id,
        );
    }


    @Patch(':id')
    @RequirePermission('zone:update')
    async update(
        @Param('id', ParseIntPipe)
        id: number,

        @Body()
        updateZoneDto:
            UpdateZoneDto,
    ) {
        return this.zonesService.update(
            id,
            updateZoneDto,
        );
    }


    @Patch(':id/status')
    @RequirePermission('zone:status')
    async updateStatus(
        @Param('id', ParseIntPipe)
        id: number,

        @Body()
        updateZoneStatusDto:
            UpdateZoneStatusDto,
    ) {
        return this.zonesService.updateStatus(
            id,
            updateZoneStatusDto.status,
        );
    }


    @Delete(':id')
    @RequirePermission('zone:delete')
    async remove(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.zonesService.remove(id);
    }
}