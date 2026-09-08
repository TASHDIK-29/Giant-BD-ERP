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
    CreateRackDto,
} from './dto/create-rack.dto.js';

import {
    UpdateRackDto,
} from './dto/update-rack.dto.js';

import {
    UpdateRackStatusDto,
} from './dto/update-rack-status.dto.js';

import {
    RackQueryDto,
} from './dto/rack-query.dto.js';

import {
    RacksService,
} from './racks.service.js';


@Controller('racks')
export class RacksController {
    constructor(
        private readonly racksService:
            RacksService,
    ) {}


    @Post()
    @HttpCode(HttpStatus.CREATED)
    @RequirePermission('rack:create')
    async create(
        @Body()
        createRackDto:
            CreateRackDto,
    ) {
        return this.racksService.create(
            createRackDto,
        );
    }


    @Get()
    @RequirePermission('rack:read')
    async findAll(
        @Query()
        query: RackQueryDto,
    ) {
        return this.racksService.findAll(
            query,
        );
    }


    @Get(':id')
    @RequirePermission('rack:read')
    async findOne(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.racksService.findOne(id);
    }


    @Patch(':id')
    @RequirePermission('rack:update')
    async update(
        @Param('id', ParseIntPipe)
        id: number,

        @Body()
        updateRackDto:
            UpdateRackDto,
    ) {
        return this.racksService.update(
            id,
            updateRackDto,
        );
    }


    @Patch(':id/status')
    @RequirePermission('rack:status')
    async updateStatus(
        @Param('id', ParseIntPipe)
        id: number,

        @Body()
        updateRackStatusDto:
            UpdateRackStatusDto,
    ) {
        return this.racksService.updateStatus(
            id,
            updateRackStatusDto.status,
        );
    }


    @Delete(':id')
    @RequirePermission('rack:delete')
    async remove(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.racksService.remove(id);
    }
}