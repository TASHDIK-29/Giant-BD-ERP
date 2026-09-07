import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
} from '@nestjs/common';

import { CategoriesService } from './categories.service.js';

import { CreateCategoryDto } from './dto/create-category.dto.js';

import { CreateSubCategoryDto } from './dto/create-sub-category.dto.js';

import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';


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








}