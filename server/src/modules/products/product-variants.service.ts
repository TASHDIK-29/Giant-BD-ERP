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
import { Prisma, Status } from '../../generated/prisma/client.js';
import { ProductVariantQueryDto } from './dto/product-variant-query.dto.js';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto.js';


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




    async findAll(
        query: ProductVariantQueryDto,
    ) {
        const {
            page = 1,
            limit = 10,
            search,
            masterProductId,
            colorId,
            gender,
            status,
        } = query;


        const skip = (page - 1) * limit;


        const where: Prisma.ProductVariantWhereInput = {
            ...(masterProductId && {
                masterProductId,
            }),

            ...(colorId && {
                colorId,
            }),

            ...(gender && {
                gender,
            }),

            ...(status && {
                status,
            }),

            ...(search && {
                OR: [
                    {
                        sku: {
                            contains: search.trim(),
                            mode: 'insensitive',
                        },
                    },

                    {
                        size: {
                            contains: search.trim(),
                            mode: 'insensitive',
                        },
                    },

                    {
                        modelNumber: {
                            contains: search.trim(),
                            mode: 'insensitive',
                        },
                    },

                    {
                        masterProduct: {
                            name: {
                                contains: search.trim(),
                                mode: 'insensitive',
                            },
                        },
                    },

                    {
                        color: {
                            name: {
                                contains: search.trim(),
                                mode: 'insensitive',
                            },
                        },
                    },
                ],
            }),
        };


        const [
            variants,
            total,
        ] = await this.databaseService.$transaction([
            this.databaseService.productVariant.findMany({
                where,

                skip,

                take: limit,

                orderBy: {
                    createdAt: 'desc',
                },

                include: {
                    masterProduct: {
                        select: {
                            id: true,
                            name: true,
                            sku: true,
                            status: true,
                        },
                    },

                    color: {
                        select: {
                            id: true,
                            name: true,
                            // status: true,
                        },
                    },
                },
            }),

            this.databaseService.productVariant.count({
                where,
            }),
        ]);


        return {
            data: variants,

            meta: {
                total,

                page,

                limit,

                totalPages: Math.ceil(
                    total / limit,
                ),
            },
        };
    }




    async findOne(id: number) {
        const variant =
            await this.databaseService.productVariant.findUnique({
                where: {
                    id,
                },

                include: {
                    masterProduct: {
                        select: {
                            id: true,
                            name: true,
                            sku: true,
                            status: true,

                            category: {
                                select: {
                                    id: true,
                                    name: true,
                                    slug: true,
                                },
                            },

                            subCategory: {
                                select: {
                                    id: true,
                                    name: true,
                                    slug: true,
                                },
                            },

                            material: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },

                    color: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            // status: true,
                        },
                    },
                },
            });


        if (!variant) {
            throw new NotFoundException(
                'Product Variant was not found.',
            );
        }


        return {
            data: variant,
        };
    }




    async update(
        id: number,
        updateProductVariantDto: UpdateProductVariantDto,
    ) {
        const existingVariant =
            await this.databaseService.productVariant.findUnique({
                where: {
                    id,
                },
            });


        if (!existingVariant) {
            throw new NotFoundException(
                'Product Variant was not found.',
            );
        }


        const {
            masterProductId,
            colorId,
            gender,
            size,
            modelNumber,
            uom,
            productsPerPacket,
            packagingType,
        } = updateProductVariantDto;


        /*
         * Determine the final values.
         *
         * If a value is not provided in the update request,
         * keep the existing value.
         */
        const finalMasterProductId =
            masterProductId ?? existingVariant.masterProductId;

        const finalColorId =
            colorId ?? existingVariant.colorId;

        const finalGender =
            gender ?? existingVariant.gender;

        const finalSize =
            size?.trim() ?? existingVariant.size;


        /*
         * Validate Master Product when changed.
         */
        if (
            masterProductId !== undefined &&
            masterProductId !== existingVariant.masterProductId
        ) {
            const masterProduct =
                await this.databaseService.masterProduct.findFirst({
                    where: {
                        id: masterProductId,
                        status: 'ACTIVE',
                    },
                });


            if (!masterProduct) {
                throw new NotFoundException(
                    'Master Product was not found.',
                );
            }
        }


        /*
         * Validate Color when changed.
         */
        if (
            colorId !== undefined &&
            colorId !== existingVariant.colorId
        ) {
            const color =
                await this.databaseService.color.findUnique({
                    where: {
                        id: colorId,
                    },
                });


            if (!color) {
                throw new NotFoundException(
                    'Color was not found.',
                );
            }
        }


        /*
         * Check whether SKU-defining fields changed.
         */
        const shouldRegenerateSku =
            finalMasterProductId !==
            existingVariant.masterProductId ||
            finalColorId !== existingVariant.colorId ||
            finalGender !== existingVariant.gender ||
            finalSize !== existingVariant.size;


        let updatedSku = existingVariant.sku;


        if (shouldRegenerateSku) {
            const masterProduct =
                await this.databaseService.masterProduct.findUnique({
                    where: {
                        id: finalMasterProductId,
                    },

                    select: {
                        sku: true,
                    },
                });


            const color =
                await this.databaseService.color.findUnique({
                    where: {
                        id: finalColorId,
                    },

                    select: {
                        name: true,
                    },
                });


            if (!masterProduct || !color) {
                throw new BadRequestException(
                    'Unable to generate Product Variant SKU.',
                );
            }


            updatedSku = this.generateVariantSku(
                masterProduct.sku,
                finalSize,
                color.name,
                finalGender,
            );


            /*
             * Prevent duplicate SKU.
             */
            const duplicateVariant =
                await this.databaseService.productVariant.findFirst({
                    where: {
                        sku: updatedSku,

                        id: {
                            not: id,
                        },
                    },
                });


            if (duplicateVariant) {
                throw new ConflictException(
                    `Another Product Variant already exists with SKU: ${updatedSku}`,
                );
            }
        }


        const updatedVariant =
            await this.databaseService.productVariant.update({
                where: {
                    id,
                },

                data: {
                    ...(masterProductId !== undefined && {
                        masterProductId,
                    }),

                    ...(colorId !== undefined && {
                        colorId,
                    }),

                    ...(gender !== undefined && {
                        gender,
                    }),

                    ...(size !== undefined && {
                        size: finalSize,
                    }),

                    ...(modelNumber !== undefined && {
                        modelNumber: modelNumber.trim(),
                    }),

                    ...(uom !== undefined && {
                        uom,
                    }),

                    ...(productsPerPacket !== undefined && {
                        productsPerPacket,
                    }),

                    ...(packagingType !== undefined && {
                        packagingType,
                    }),

                    ...(shouldRegenerateSku && {
                        sku: updatedSku,
                    }),
                },

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


        return {
            message: 'Product Variant updated successfully.',
            data: updatedVariant,
        };
    }






    async updateStatus(
        id: number,
        status: Status,
    ) {
        const variant =
            await this.databaseService.productVariant.findUnique({
                where: {
                    id,
                },
            });


        if (!variant) {
            throw new NotFoundException(
                'Product Variant was not found.',
            );
        }


        const updatedVariant =
            await this.databaseService.productVariant.update({
                where: {
                    id,
                },

                data: {
                    status,
                },

                select: {
                    id: true,
                    sku: true,
                    status: true,
                },
            });


        return {
            message:
                'Product Variant status updated successfully.',

            data: updatedVariant,
        };
    }




    async remove(id: number) {
        const variant =
            await this.databaseService.productVariant.findUnique({
                where: {
                    id,
                },

                select: {
                    id: true,
                    sku: true,
                },
            });


        if (!variant) {
            throw new NotFoundException(
                'Product Variant was not found.',
            );
        }


        await this.databaseService.productVariant.delete({
            where: {
                id,
            },
        });


        return {
            message:
                'Product Variant deleted successfully.',
        };
    }

}