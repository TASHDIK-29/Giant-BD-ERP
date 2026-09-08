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
    CreateBuyerDto,
} from './dto/create-buyer.dto.js';

import {
    UpdateBuyerDto,
} from './dto/update-buyer.dto.js';

import {
    UpdateBuyerStatusDto,
} from './dto/update-buyer-status.dto.js';

import {
    BuyerQueryDto,
} from './dto/buyer-query.dto.js';

import {
    BuyersService,
} from './buyers.service.js';


@Controller('buyers')
export class BuyersController {
    constructor(
        private readonly buyersService:
            BuyersService,
    ) {}


    @Post()
    @HttpCode(HttpStatus.CREATED)
    @RequirePermission('buyer:create')
    async create(
        @Body()
        createBuyerDto:
            CreateBuyerDto,
    ) {
        return this.buyersService.create(
            createBuyerDto,
        );
    }


    @Get()
    @RequirePermission('buyer:read')
    async findAll(
        @Query()
        query: BuyerQueryDto,
    ) {
        return this.buyersService.findAll(
            query,
        );
    }


    @Get(':id')
    @RequirePermission('buyer:read')
    async findOne(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.buyersService.findOne(id);
    }


    @Patch(':id')
    @RequirePermission('buyer:update')
    async update(
        @Param('id', ParseIntPipe)
        id: number,

        @Body()
        updateBuyerDto:
            UpdateBuyerDto,
    ) {
        return this.buyersService.update(
            id,
            updateBuyerDto,
        );
    }


    @Patch(':id/status')
    @RequirePermission('buyer:status')
    async updateStatus(
        @Param('id', ParseIntPipe)
        id: number,

        @Body()
        updateBuyerStatusDto:
            UpdateBuyerStatusDto,
    ) {
        return this.buyersService.updateStatus(
            id,
            updateBuyerStatusDto.status,
        );
    }


    @Delete(':id')
    @RequirePermission('buyer:delete')
    async remove(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.buyersService.remove(id);
    }
}