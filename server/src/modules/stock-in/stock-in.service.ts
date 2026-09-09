import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { DatabaseService } from '../../database/database.service.js';

import { CreateStockInDto } from './dto/create-stock-in.dto.js';

interface AuthenticatedUser {
    id: number;
    email: string;
    roleId: number;
}

@Injectable()
export class StockInService {
    constructor(
        private readonly databaseService: DatabaseService,
    ) { }

    async create(
        createStockInDto: CreateStockInDto,
        user: AuthenticatedUser,
    ) {
        const {
            masterProductId,
            colorId,
            gender,
            stockInDate,
            productionDate,
            expiryDate,
            items,
        } = createStockInDto;

        /*
         * --------------------------------------------------
         * 1. Prevent duplicate sizes in the same Stock In
         * --------------------------------------------------
         */

        const sizes = items.map((item) => item.size.trim());

        const uniqueSizes = new Set(sizes);

        if (sizes.length !== uniqueSizes.size) {
            throw new BadRequestException(
                'Duplicate sizes are not allowed in the same stock in request.',
            );
        }

        /*
         * --------------------------------------------------
         * 2. Validate dates
         * --------------------------------------------------
         */

        const stockInDateObject = new Date(stockInDate);
        const productionDateObject = new Date(productionDate);

        const expiryDateObject = expiryDate
            ? new Date(expiryDate)
            : null;

        if (productionDateObject > stockInDateObject) {
            throw new BadRequestException(
                'Production date cannot be later than stock in date.',
            );
        }

        if (
            expiryDateObject &&
            expiryDateObject <= productionDateObject
        ) {
            throw new BadRequestException(
                'Expiry date must be later than production date.',
            );
        }

        /*
         * --------------------------------------------------
         * 3. Validate Master Product
         * --------------------------------------------------
         */

        const masterProduct =
            await this.databaseService.masterProduct.findFirst({
                where: {
                    id: masterProductId,
                    status: 'ACTIVE',
                },
                select: {
                    id: true,
                    name: true,
                },
            });

        if (!masterProduct) {
            throw new NotFoundException(
                'Active master product not found.',
            );
        }

        /*
         * --------------------------------------------------
         * 4. Validate Color
         * --------------------------------------------------
         */

        const color =
            await this.databaseService.color.findUnique({
                where: {
                    id: colorId,
                },
                select: {
                    id: true,
                    name: true,
                },
            });

        if (!color) {
            throw new NotFoundException('Color not found.');
        }

        /*
         * --------------------------------------------------
         * 5. Find all requested Product Variants
         *
         * Product Variant identity:
         *
         * Master Product
         * + Color
         * + Gender
         * + Size
         * --------------------------------------------------
         */

        // const productVariants =
        //     await this.databaseService.productVariant.findMany({
        //         where: {
        //             masterProductId,
        //             colorId,
        //             gender,
        //             size: {
        //                 in: sizes,
        //             },
        //             status: 'ACTIVE',
        //         },
        //         select: {
        //             id: true,
        //             size: true,
        //             productsPerPacket: true,
        //         },
        //     });

        // /*
        //  * Every requested size must have an active variant.
        //  */

        // if (productVariants.length !== uniqueSizes.size) {
        //     const foundSizes = new Set(
        //         productVariants.map(
        //             (variant) => variant.size,
        //         ),
        //     );

        //     const missingSizes = sizes.filter(
        //         (size) => !foundSizes.has(size),
        //     );

        //     throw new BadRequestException(
        //         `Active product variants not found for size(s): ${[
        //             ...new Set(missingSizes),
        //         ].join(', ')}`,
        //     );
        // }

        const requestedSizes = [
            ...new Set(
                items.map((item) => item.size.trim()),
            ),
        ];

        const productVariants =
            await this.databaseService.productVariant.findMany({
                where: {
                    masterProductId,
                    colorId,
                    gender,
                    size: {
                        in: requestedSizes,
                    },
                    status: 'ACTIVE',
                },
                select: {
                    id: true,
                    size: true,
                    productsPerPacket: true,
                },
            });

        if (productVariants.length !== requestedSizes.length) {
            const foundSizes = new Set(
                productVariants.map((variant) => variant.size),
            );

            const missingSizes = requestedSizes.filter(
                (size) => !foundSizes.has(size),
            );

            throw new BadRequestException(
                `Active product variants not found for size(s): ${missingSizes.join(', ')}`,
            );
        }

        /*
         * --------------------------------------------------
         * 6. Create a Size -> ProductVariant lookup map
         * --------------------------------------------------
         */

        const variantMap = new Map(
            productVariants.map((variant) => [
                variant.size,
                variant,
            ]),
        );

        /*
         * --------------------------------------------------
         * 7. Validate location hierarchy
         *
         * Warehouse
         *     ↓
         * Zone
         *     ↓
         * SubZone
         *     ↓
         * Rack
         * --------------------------------------------------
         */

        // const validatedItems = [];

        const validatedItems: Array<
            (typeof items)[number] & {
                productVariantId: number;
                productsPerPacket: number;
            }
        > = [];

        for (const item of items) {
            const location =
                await this.databaseService.rack.findFirst({
                    where: {
                        id: item.rackId,
                        status: 'ACTIVE',

                        subZone: {
                            id: item.subZoneId,
                            status: 'ACTIVE',

                            zone: {
                                id: item.zoneId,
                                status: 'ACTIVE',

                                warehouse: {
                                    id: item.warehouseId,
                                    status: 'ACTIVE',
                                },
                            },
                        },
                    },

                    select: {
                        id: true,
                    },
                });

            if (!location) {
                throw new BadRequestException(
                    `Invalid or inactive location hierarchy for size ${item.size}.`,
                );
            }

            const variant = variantMap.get(
                item.size.trim(),
            );

            if (!variant) {
                throw new BadRequestException(
                    `Product variant not found for size ${item.size}.`,
                );
            }

            validatedItems.push({
                ...item,
                size: item.size.trim(),
                productVariantId: variant.id,
                productsPerPacket:
                    variant.productsPerPacket,
            });
        }

        /*
         * --------------------------------------------------
         * 8. Calculate Total Quantity
         * --------------------------------------------------
         */

        const totalQuantity = validatedItems.reduce(
            (sum, item) => sum + item.quantity,
            0,
        );

        /*
         * --------------------------------------------------
         * 9. Calculate Total Packages
         *
         * All variants in one Stock In request should have
         * the same productsPerPacket value.
         * --------------------------------------------------
         */

        const packetSizes = new Set(
            validatedItems.map(
                (item) => item.productsPerPacket,
            ),
        );

        if (packetSizes.size !== 1) {
            throw new BadRequestException(
                'All product variants in a single Stock In must have the same products per packet.',
            );
        }

        const productsPerPacket =
            validatedItems[0].productsPerPacket;

        const totalPackages = Math.ceil(
            totalQuantity / productsPerPacket,
        );

        /*
         * --------------------------------------------------
         * 10. Generate Batch ID
         * --------------------------------------------------
         *
         * Example:
         *
         * STI-20260909-123456
         *
         * A more robust generator can be added later.
         */

        const batchId = await this.generateBatchId();

        /*
         * --------------------------------------------------
         * 11. Execute Atomic Transaction
         * --------------------------------------------------
         */

        const result =
            await this.databaseService.$transaction(
                async (tx) => {
                    /*
                     * Create Stock In Header
                     */

                    const stockIn = await tx.stockIn.create({
                        data: {
                            batchId,

                            masterProductId,
                            colorId,
                            gender,

                            stockInDate: stockInDateObject,
                            productionDate: productionDateObject,
                            expiryDate: expiryDateObject,

                            totalQuantity,
                            totalPackages,

                            createdById: user.id,
                        },
                    });

                    /*
                     * Create Stock In Items
                     * and update Inventory
                     */

                    for (const item of validatedItems) {
                        await tx.stockInItem.create({
                            data: {
                                stockInId: stockIn.id,

                                productVariantId:
                                    item.productVariantId,

                                quantity: item.quantity,

                                warehouseId: item.warehouseId,
                                zoneId: item.zoneId,
                                subZoneId: item.subZoneId,
                                rackId: item.rackId,
                            },
                        });

                        /*
                         * Upsert Inventory
                         */

                        await tx.inventory.upsert({
                            where: {
                                productVariantId_warehouseId_zoneId_subZoneId_rackId: {
                                    productVariantId:
                                        item.productVariantId,

                                    warehouseId:
                                        item.warehouseId,

                                    zoneId:
                                        item.zoneId,

                                    subZoneId:
                                        item.subZoneId,

                                    rackId:
                                        item.rackId,
                                },
                            },

                            update: {
                                quantity: {
                                    increment: item.quantity,
                                },
                            },

                            create: {
                                productVariantId:
                                    item.productVariantId,

                                warehouseId:
                                    item.warehouseId,

                                zoneId:
                                    item.zoneId,

                                subZoneId:
                                    item.subZoneId,

                                rackId:
                                    item.rackId,

                                quantity: item.quantity,
                            },
                        });
                    }

                    /*
                     * Return complete Stock In
                     */

                    return tx.stockIn.findUnique({
                        where: {
                            id: stockIn.id,
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

                            createdBy: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },

                            items: {
                                include: {
                                    productVariant: {
                                        select: {
                                            id: true,
                                            size: true,
                                            sku: true,
                                            gender: true,
                                        },
                                    },

                                    warehouse: {
                                        select: {
                                            id: true,
                                            name: true,
                                            code: true,
                                        },
                                    },

                                    zone: {
                                        select: {
                                            id: true,
                                            name: true,
                                            code: true,
                                        },
                                    },

                                    subZone: {
                                        select: {
                                            id: true,
                                            name: true,
                                            code: true,
                                        },
                                    },

                                    rack: {
                                        select: {
                                            id: true,
                                            name: true,
                                            code: true,
                                        },
                                    },
                                },
                            },
                        },
                    });
                },
            );

        return {
            message: 'Stock in created successfully.',
            data: result,
        };
    }

    /*
     * --------------------------------------------------
     * Batch ID Generator
     * --------------------------------------------------
     */

    private async generateBatchId(): Promise<string> {
        let batchId: string;
        let exists = true;

        do {
            const date = new Date();

            const datePart = [
                date.getFullYear(),
                String(date.getMonth() + 1).padStart(
                    2,
                    '0',
                ),
                String(date.getDate()).padStart(2, '0'),
            ].join('');

            const randomPart = Math.floor(
                100000 + Math.random() * 900000,
            );

            batchId = `STI-${datePart}-${randomPart}`;

            const existing =
                await this.databaseService.stockIn.findUnique({
                    where: {
                        batchId,
                    },
                    select: {
                        id: true,
                    },
                });

            exists = Boolean(existing);
        } while (exists);

        return batchId!;
    }
}