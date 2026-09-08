import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { DatabaseService } from '../../database/database.service.js';

import {
    CreateProductVariantsDto,
} from './dto/create-product-variants.dto.js';


@Injectable()
export class ProductVariantsService {
    constructor(
        private readonly databaseService: DatabaseService,
    ) { }



    /*
    * --------------------------------
    * SKU Helpers
    * --------------------------------
    */

    private normalizeSkuPart(
        value: string,
    ): string {
        return value
            .trim()
            .toUpperCase()
            .replace(
                /[^A-Z0-9]+/g,
                '-',
            )
            .replace(
                /^-+|-+$/g,
                '',
            );
    }


    private generateVariantSku(
        masterSku: string,
        size: string,
        colorName: string,
        gender: string,
    ): string {
        return [
            this.normalizeSkuPart(masterSku),

            this.normalizeSkuPart(size),

            this.normalizeSkuPart(colorName),

            this.normalizeSkuPart(gender),
        ].join('-');
    }


    async create(
        createProductVariantsDto: CreateProductVariantsDto,
    ) {
        // console.log('Exe : 1');

        const {
            masterProductId,
            colorId,
            gender,
            sizes,
            modelNumber,
            uom,
            productsPerPacket,
            packagingType,
            status,
        } = createProductVariantsDto;


        /*
         * --------------------------------
         * 1. Normalize sizes
         * --------------------------------
         */

        const normalizedSizes = sizes.map(
            (size) => size.trim(),
        );


        /*
         * --------------------------------
         * 2. Validate duplicate sizes
         * --------------------------------
         */

        const uniqueSizes = new Set(
            normalizedSizes.map(
                (size) => size.toLowerCase(),
            ),
        );


        if (
            uniqueSizes.size !==
            normalizedSizes.length
        ) {
            throw new BadRequestException(
                'Duplicate sizes are not allowed.',
            );
        }


        /*
         * --------------------------------
         * 3. Fetch Master Product
         * --------------------------------
         */

        const masterProduct =
            await this.databaseService.masterProduct.findUnique({
                where: {
                    id: masterProductId,
                },

                select: {
                    id: true,
                    name: true,
                    sku: true,
                    status: true,
                },
            });


        // console.log('Exe : 2');


        if (!masterProduct) {
            throw new NotFoundException(
                'Master Product was not found.',
            );
        }

        // console.log('Exe : 3');


        /*
         * --------------------------------
         * 4. Validate Master Product status
         * --------------------------------
         */

        if (
            masterProduct.status !==
            'ACTIVE'
        ) {
            throw new ConflictException(
                'Cannot create variants for an inactive Master Product.',
            );
        }

        // console.log('Exe : 4');


        /*
         * --------------------------------
         * 5. Fetch Color
         * --------------------------------
         */

        const color =
            await this.databaseService.color.findUnique({
                where: {
                    id: colorId,
                },

                select: {
                    id: true,
                    name: true,
                    // status: true,
                },
            });


        // console.log('Exe : 5');

        if (!color) {
            throw new NotFoundException(
                'Color was not found.',
            );
        }


        // console.log('Exe : 6');

        /*
         * --------------------------------
         * 6. Validate Color status
         * --------------------------------
         */

        // if (color.status !== 'ACTIVE') {
        //     throw new ConflictException(
        //         'Cannot create variants using an inactive Color.',
        //     );
        // }


        // console.log('Exe : 7');


        /*
         * --------------------------------
         * 7. Check existing combinations
         * --------------------------------
         */

        const existingVariants =
            await this.databaseService.productVariant.findMany({
                where: {
                    masterProductId,
                    colorId,
                    gender,

                    size: {
                        in: normalizedSizes,
                    },
                },

                select: {
                    size: true,
                },
            });


        // console.log('Exe : 8');


        if (existingVariants.length > 0) {
            throw new ConflictException(
                `Variants already exist for sizes: ${existingVariants
                    .map(
                        (variant) =>
                            variant.size,
                    )
                    .join(', ')}.`,
            );
        }

        // console.log('Exe : 9');


        /*
         * --------------------------------
         * 8. Generate SKUs
         * --------------------------------
         */

        const variantsToCreate = normalizedSizes.map(
            (size) => ({
                size,

                sku: this.generateVariantSku(
                    masterProduct.sku,
                    size,
                    // color.name,
                    "color",
                    gender,
                ),

                masterProductId,

                colorId,

                gender,

                ...(modelNumber !== undefined && {
                    modelNumber: modelNumber.trim(),
                }),

                uom,

                productsPerPacket,

                packagingType,

                ...(status !== undefined && {
                    status,
                }),
            }),
        );

        // console.log('Exe : 10');


        /*
         * --------------------------------
         * 9. Check SKU collisions
         * --------------------------------
         */

        const generatedSkus =
            variantsToCreate.map(
                (variant) => variant.sku,
            );


        const existingSkus =
            await this.databaseService.productVariant.findMany({
                where: {
                    sku: {
                        in: generatedSkus,
                    },
                },

                select: {
                    sku: true,
                },
            });


        if (existingSkus.length > 0) {
            throw new ConflictException(
                `Generated SKU already exists: ${existingSkus
                    .map(
                        (variant) =>
                            variant.sku,
                    )
                    .join(', ')}.`,
            );
        }


        // console.log('Exe : 11');


        /*
         * --------------------------------
         * 10. Create all variants
         * inside a transaction
         * --------------------------------
         */

        const createdVariants =
            await this.databaseService.$transaction(
                async (transaction) => {
                    const variants = [];

                    for (
                        const variantData of variantsToCreate
                    ) {
                        const variant =
                            await transaction.productVariant.create({
                                data: variantData,

                                include: {
                                    masterProduct: {
                                        select: {
                                            id: true,
                                            name: true,
                                            sku: true,
                                        },
                                    },

                                    color: {
                                        select: {
                                            id: true,
                                            name: true,
                                        },
                                    },
                                },
                            });

                        variants.push(
                            variant,
                        );
                    }

                    return variants;
                },
            );


        return {
            message:
                `${createdVariants.length} Product Variant(s) created successfully.`,

            data: createdVariants,
        };
    }



}