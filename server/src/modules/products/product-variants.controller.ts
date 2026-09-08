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
    CreateProductVariantsDto,
} from './dto/create-product-variants.dto.js';

import {
    ProductVariantsService,
} from './product-variants.service.js';
import { ProductVariantQueryDto } from './dto/product-variant-query.dto.js';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto.js';
import { UpdateProductVariantStatusDto } from './dto/update-product-variant-status.dto.js';


@Controller('products/variants')
export class ProductVariantsController {
    constructor(
        private readonly productVariantsService:
            ProductVariantsService,
    ) { }


    @Post()
    @HttpCode(HttpStatus.CREATED)
    @RequirePermission(
        'product-variant:create',
    )
    async create(
        @Body()
        createProductVariantsDto:
            CreateProductVariantsDto,
    ) {
        return this.productVariantsService.create(
            createProductVariantsDto,
        );
    }




    @Get()
    @RequirePermission('product-variant:read')
    async findAll(
        @Query()
        query: ProductVariantQueryDto,
    ) {
        return this.productVariantsService.findAll(
            query,
        );
    }



    @Get(':id')
    @RequirePermission('product-variant:read')
    async findOne(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.productVariantsService.findOne(
            id,
        );
    }



    @Patch(':id')
    @RequirePermission('product-variant:update')
    async update(
        @Param('id', ParseIntPipe)
        id: number,

        @Body()
        updateProductVariantDto:
            UpdateProductVariantDto,
    ) {
        return this.productVariantsService.update(
            id,
            updateProductVariantDto,
        );
    }

    

    @Patch(':id/status')
    @RequirePermission('product-variant:status')
    async updateStatus(
        @Param('id', ParseIntPipe)
        id: number,

        @Body()
        updateProductVariantStatusDto:
            UpdateProductVariantStatusDto,
    ) {
        return this.productVariantsService.updateStatus(
            id,
            updateProductVariantStatusDto.status,
        );
    }


    @Delete(':id')
    @RequirePermission('product-variant:delete')
    async remove(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.productVariantsService.remove(id);
    }


}