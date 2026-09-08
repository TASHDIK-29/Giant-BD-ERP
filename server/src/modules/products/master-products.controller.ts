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
    Patch,
    Delete
} from '@nestjs/common';

import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';

import { MasterProductsService } from './master-products.service.js';

import { CreateMasterProductDto } from './dto/create-master-product.dto.js';
import { MasterProductQueryDto } from './dto/master-product-query.dto.js';
import { UpdateMasterProductDto } from './dto/update-master-product.dto.js';
import { UpdateMasterProductStatusDto } from './dto/update-master-product-status.dto.js';


@Controller('products/master')
export class MasterProductsController {
    constructor(
        private readonly masterProductsService:
            MasterProductsService,
    ) { }


    @Post()
    @HttpCode(HttpStatus.CREATED)
    @RequirePermission('master-product:create')
    async create(
        @Body()
        createMasterProductDto: CreateMasterProductDto,
    ) {
        return this.masterProductsService.create(
            createMasterProductDto,
        );
    }




    @Get()
    @RequirePermission('master-product:read')
    async findAll(
        @Query()
        query: MasterProductQueryDto,
    ) {
        return this.masterProductsService.findAll(
            query,
        );
    }



    @Get(':id')
    @RequirePermission('master-product:read')
    async findOne(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.masterProductsService.findOne(id);
    }



    @Put(':id')
    @RequirePermission('master-product:update')
    async update(
        @Param('id', ParseIntPipe)
        id: number,

        @Body()
        updateMasterProductDto: UpdateMasterProductDto,
    ) {
        return this.masterProductsService.update(
            id,
            updateMasterProductDto,
        );
    }



    @Patch(':id/status')
    @RequirePermission('master-product:status')
    async updateStatus(
        @Param('id', ParseIntPipe)
        id: number,

        @Body()
        updateMasterProductStatusDto:
            UpdateMasterProductStatusDto,
    ) {
        return this.masterProductsService.updateStatus(
            id,
            updateMasterProductStatusDto.status,
        );
    }



    @Delete(':id')
    @RequirePermission('master-product:delete')
    async remove(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.masterProductsService.remove(id);
    }




}