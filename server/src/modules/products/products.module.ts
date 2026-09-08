import { Module } from '@nestjs/common';

import { MasterProductsController } from './master-products.controller.js';

import { MasterProductsService } from './master-products.service.js';


@Module({
    controllers: [
        MasterProductsController,
    ],

    providers: [
        MasterProductsService,
    ],
})
export class ProductsModule {}