import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
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


@Controller('products/variants')
export class ProductVariantsController {
    constructor(
        private readonly productVariantsService:
            ProductVariantsService,
    ) {}


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
}