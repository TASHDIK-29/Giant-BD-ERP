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

import { ColorsService } from './colors.service.js';

import { CreateColorDto } from './dto/create-color.dto.js';
import { UpdateColorDto } from './dto/update-color.dto.js';
import { ColorQueryDto } from './dto/color-query.dto.js';


@Controller('colors')
export class ColorsController {
    constructor(
        private readonly colorsService: ColorsService,
    ) {}


    @Post()
    @RequirePermission('color:create')
    async create(
        @Body()
        createColorDto: CreateColorDto,
    ) {
        return this.colorsService.create(
            createColorDto,
        );
    }


    @Get()
    @RequirePermission('color:read')
    async findAll(
        @Query()
        query: ColorQueryDto,
    ) {
        return this.colorsService.findAll(
            query,
        );
    }


    @Get(':id')
    @RequirePermission('color:read')
    async findOne(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.colorsService.findOne(id);
    }


    @Put(':id')
    @RequirePermission('color:update')
    async update(
        @Param('id', ParseIntPipe)
        id: number,

        @Body()
        updateColorDto: UpdateColorDto,
    ) {
        return this.colorsService.update(
            id,
            updateColorDto,
        );
    }


    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @RequirePermission('color:delete')
    async remove(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.colorsService.remove(id);
    }
}