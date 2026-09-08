import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
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


}