import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
} from '@nestjs/common';

import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';

import { MaterialsService } from './materials.service.js';

import { CreateMaterialDto } from './dto/create-material.dto.js';
import { UpdateMaterialDto } from './dto/update-material.dto.js';
import { MaterialQueryDto } from './dto/material-query.dto.js';


@Controller('materials')
export class MaterialsController {
    constructor(
        private readonly materialsService: MaterialsService,
    ) {}


    /*
     * Create Material
     */
    @Post()
    @RequirePermission('material:create')
    async create(
        @Body()
        createMaterialDto: CreateMaterialDto,
    ) {
        return this.materialsService.create(
            createMaterialDto,
        );
    }


    /*
     * List Materials
     */
    @Get()
    @RequirePermission('material:read')
    async findAll(
        @Query()
        query: MaterialQueryDto,
    ) {
        return this.materialsService.findAll(
            query,
        );
    }


    /*
     * Get Single Material
     */
    @Get(':id')
    @RequirePermission('material:read')
    async findOne(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.materialsService.findOne(
            id,
        );
    }


    /*
     * Update Material
     */
    @Put(':id')
    @RequirePermission('material:update')
    async update(
        @Param('id', ParseIntPipe)
        id: number,

        @Body()
        updateMaterialDto: UpdateMaterialDto,
    ) {
        return this.materialsService.update(
            id,
            updateMaterialDto,
        );
    }


    /*
     * Delete Material
     */
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @RequirePermission('material:delete')
    async remove(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.materialsService.remove(id);
    }
}