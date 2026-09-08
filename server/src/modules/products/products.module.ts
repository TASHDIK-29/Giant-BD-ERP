import { Module } from '@nestjs/common';

import { MasterProductsController } from './master-products.controller.js';

import { MasterProductsService } from './master-products.service.js';
import { ProductVariantsController } from './product-variants.controller.js';
import { ProductVariantsService } from './product-variants.service.js';


@Module({
    controllers: [
        MasterProductsController,
        ProductVariantsController
    ],

    providers: [
        MasterProductsService,
        ProductVariantsService
    ],
})
export class ProductsModule {}