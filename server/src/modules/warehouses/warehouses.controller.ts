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
    CreateWarehouseDto,
} from './dto/create-warehouse.dto.js';

import {
    UpdateWarehouseDto,
} from './dto/update-warehouse.dto.js';

import {
    UpdateWarehouseStatusDto,
} from './dto/update-warehouse-status.dto.js';

import {
    WarehouseQueryDto,
} from './dto/warehouse-query.dto.js';

import {
    WarehousesService,
} from './warehouses.service.js';


@Controller('warehouses')
export class WarehousesController {
    constructor(
        private readonly warehousesService:
            WarehousesService,
    ) {}


    @Post()
    @HttpCode(HttpStatus.CREATED)
    @RequirePermission('warehouse:create')
    async create(
        @Body()
        createWarehouseDto:
            CreateWarehouseDto,
    ) {
        return this.warehousesService.create(
            createWarehouseDto,
        );
    }


    @Get()
    @RequirePermission('warehouse:read')
    async findAll(
        @Query()
        query: WarehouseQueryDto,
    ) {
        return this.warehousesService.findAll(
            query,
        );
    }


    @Get(':id')
    @RequirePermission('warehouse:read')
    async findOne(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.warehousesService.findOne(
            id,
        );
    }


    @Patch(':id')
    @RequirePermission('warehouse:update')
    async update(
        @Param('id', ParseIntPipe)
        id: number,

        @Body()
        updateWarehouseDto:
            UpdateWarehouseDto,
    ) {
        return this.warehousesService.update(
            id,
            updateWarehouseDto,
        );
    }


    @Patch(':id/status')
    @RequirePermission('warehouse:status')
    async updateStatus(
        @Param('id', ParseIntPipe)
        id: number,

        @Body()
        updateWarehouseStatusDto:
            UpdateWarehouseStatusDto,
    ) {
        return this.warehousesService.updateStatus(
            id,
            updateWarehouseStatusDto.status,
        );
    }


    @Delete(':id')
    @RequirePermission('warehouse:delete')
    async remove(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.warehousesService.remove(id);
    }
}