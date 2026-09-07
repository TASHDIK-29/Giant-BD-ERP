import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Put,
    Query,
} from '@nestjs/common';

import { CategoriesService } from './categories.service.js';

import { CreateCategoryDto } from './dto/create-category.dto.js';

import { CreateSubCategoryDto } from './dto/create-sub-category.dto.js';

import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';
import { QueryCategoryDto } from './dto/query-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { UpdateCategoryStatusDto } from './dto/update-category-status.dto.js';


@Controller('categories')
export class CategoriesController {
    constructor(
        private readonly categoriesService: CategoriesService,
    ) { }


    @Post()
    @HttpCode(HttpStatus.CREATED)
    @RequirePermission('category:create')
    async createCategory(
        @Body()
        createCategoryDto: CreateCategoryDto,
    ) {
        return this.categoriesService.createCategory(
            createCategoryDto,
        );
    }



    @Post('sub-categories')
    @HttpCode(HttpStatus.CREATED)
    @RequirePermission('category:create')
    async createSubCategory(
        @Body()
        createSubCategoryDto: CreateSubCategoryDto,
    ) {
        return this.categoriesService.createSubCategory(
            createSubCategoryDto,
        );
    }



    @Get()
    @RequirePermission('category:read')
    async findAll(
        @Query() query: QueryCategoryDto,
    ) {
        return this.categoriesService.findAll(query);
    }



    @Get('tree')
    @RequirePermission('category:read')
    async getTree() {
        return this.categoriesService.getTree();
    }



    @Get(':id')
    @RequirePermission('category:read')
    async findOne(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.categoriesService.findOne(id);
    }



    @Put(':id')
    @RequirePermission('category:update')
    async update(
        @Param('id', ParseIntPipe)
        id: number,

        @Body()
        updateCategoryDto: UpdateCategoryDto,
    ) {
        return this.categoriesService.update(
            id,
            updateCategoryDto,
        );
    }


    @Patch(':id/status')
    @RequirePermission('category:status')
    async updateStatus(
        @Param('id', ParseIntPipe)
        id: number,

        @Body()
        updateCategoryStatusDto:
            UpdateCategoryStatusDto,
    ) {
        return this.categoriesService.updateStatus(
            id,
            updateCategoryStatusDto.status,
        );
    }





}