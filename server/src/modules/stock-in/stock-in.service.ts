import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { DatabaseService } from '../../database/database.service.js';

import { CreateStockInDto } from './dto/create-stock-in.dto.js';
import { Prisma } from '../../generated/prisma/client.js';
import { QueryStockInDto } from './dto/query-stock-in.dto.js';
import { StockAdjustmentAction, UpdateStockInDto } from './dto/update-stock-in.dto.js';

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







    async findAll(query: QueryStockInDto) {
        const {
            page = 1,
            limit = 10,
            search,
            masterProductId,
            colorId,
            gender,
            startDate,
            endDate,
        } = query;

        /*
         * ---------------------------------------------
         * Validate date range
         * ---------------------------------------------
         */

        if (startDate && endDate) {
            const startDateObject = new Date(startDate);
            const endDateObject = new Date(endDate);

            if (startDateObject > endDateObject) {
                throw new BadRequestException(
                    'Start date cannot be later than end date.',
                );
            }
        }

        /*
         * ---------------------------------------------
         * Pagination
         * ---------------------------------------------
         */

        const skip = (page - 1) * limit;

        /*
         * ---------------------------------------------
         * Dynamic filtering
         * ---------------------------------------------
         */

        const where: Prisma.StockInWhereInput = {};

        if (masterProductId) {
            where.masterProductId = masterProductId;
        }

        if (colorId) {
            where.colorId = colorId;
        }

        if (gender) {
            where.gender = gender;
        }

        /*
         * ---------------------------------------------
         * Search
         *
         * Batch ID
         * Master Product Name
         * Master Product SKU
         * ---------------------------------------------
         */

        if (search) {
            where.OR = [
                {
                    batchId: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    masterProduct: {
                        name: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                },
                {
                    masterProduct: {
                        sku: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                },
            ];
        }

        /*
         * ---------------------------------------------
         * Date range
         *
         * Filter using Stock In Date
         * ---------------------------------------------
         */

        if (startDate || endDate) {
            where.stockInDate = {};

            if (startDate) {
                where.stockInDate.gte = new Date(startDate);
            }

            if (endDate) {
                /*
                 * Include the complete end date.
                 *
                 * Example:
                 * 2026-09-09
                 * becomes
                 * 2026-09-09T23:59:59.999
                 */

                const endDateObject = new Date(endDate);

                endDateObject.setHours(
                    23,
                    59,
                    59,
                    999,
                );

                where.stockInDate.lte = endDateObject;
            }
        }

        /*
         * ---------------------------------------------
         * Fetch records and count in parallel
         * ---------------------------------------------
         */

        const [stockIns, total] =
            await this.databaseService.$transaction([
                this.databaseService.stockIn.findMany({
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

                        _count: {
                            select: {
                                items: true,
                            },
                        },
                    },
                }),

                this.databaseService.stockIn.count({
                    where,
                }),
            ]);

        /*
         * ---------------------------------------------
         * Return pagination response
         * ---------------------------------------------
         */

        return {
            data: stockIns.map((stockIn) => ({
                ...stockIn,

                itemCount: stockIn._count.items,

                _count: undefined,
            })),

            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }





    async findOne(id: number) {
        const stockIn =
            await this.databaseService.stockIn.findUnique({
                where: {
                    id,
                },

                include: {
                    masterProduct: {
                        select: {
                            id: true,
                            name: true,
                            sku: true,

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
                        orderBy: {
                            id: 'asc',
                        },

                        include: {
                            productVariant: {
                                select: {
                                    id: true,
                                    size: true,
                                    sku: true,
                                    gender: true,
                                    modelNumber: true,
                                    uom: true,
                                    productsPerPacket: true,
                                    packagingType: true,
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

        if (!stockIn) {
            throw new NotFoundException(
                `Stock In record with ID ${id} not found.`,
            );
        }

        return {
            data: stockIn,
        };
    }




    async update(
        id: number,
        updateStockInDto: UpdateStockInDto,
    ) {
        const { adjustments } = updateStockInDto;

        /*
         * ---------------------------------------------
         * 1. Prevent duplicate variant adjustments
         * ---------------------------------------------
         */

        const productVariantIds = adjustments.map(
            (adjustment) => adjustment.productVariantId,
        );

        const uniqueProductVariantIds = new Set(
            productVariantIds,
        );

        if (
            productVariantIds.length !==
            uniqueProductVariantIds.size
        ) {
            throw new BadRequestException(
                'The same product variant cannot be adjusted more than once in a single request.',
            );
        }

        /*
         * ---------------------------------------------
         * 2. Find Stock In
         * ---------------------------------------------
         */

        const stockIn =
            await this.databaseService.stockIn.findUnique({
                where: {
                    id,
                },

                include: {
                    items: {
                        select: {
                            id: true,
                            quantity: true,
                            productVariantId: true,

                            warehouseId: true,
                            zoneId: true,
                            subZoneId: true,
                            rackId: true,

                            productVariant: {
                                select: {
                                    id: true,
                                    productsPerPacket: true,
                                },
                            },
                        },
                    },
                },
            });

        if (!stockIn) {
            throw new NotFoundException(
                `Stock In record with ID ${id} not found.`,
            );
        }

        /*
         * ---------------------------------------------
         * 3. Create Stock In Item lookup
         * ---------------------------------------------
         */

        const stockInItemMap = new Map(
            stockIn.items.map((item) => [
                item.productVariantId,
                item,
            ]),
        );

        /*
         * ---------------------------------------------
         * 4. Validate requested variants
         * ---------------------------------------------
         */

        for (const adjustment of adjustments) {
            const stockInItem = stockInItemMap.get(
                adjustment.productVariantId,
            );

            if (!stockInItem) {
                throw new BadRequestException(
                    `Product variant ID ${adjustment.productVariantId} does not belong to Stock In ID ${id}.`,
                );
            }

            /*
             * Prevent negative Stock In quantity
             */

            if (
                adjustment.action ===
                StockAdjustmentAction.SUBTRACT &&
                adjustment.adjustmentNumber >
                stockInItem.quantity
            ) {
                throw new BadRequestException(
                    `Cannot subtract ${adjustment.adjustmentNumber} units from product variant ID ${adjustment.productVariantId}. Current batch quantity is ${stockInItem.quantity}.`,
                );
            }
        }

        /*
         * ---------------------------------------------
         * 5. Atomic Transaction
         * ---------------------------------------------
         */

        const result =
            await this.databaseService.$transaction(
                async (tx) => {
                    /*
                     * Update every Stock In Item
                     * and corresponding Inventory
                     */

                    for (const adjustment of adjustments) {
                        const stockInItem =
                            stockInItemMap.get(
                                adjustment.productVariantId,
                            );

                        if (!stockInItem) {
                            throw new BadRequestException(
                                'Stock In item not found.',
                            );
                        }

                        const isAdd =
                            adjustment.action ===
                            StockAdjustmentAction.ADD;

                        const quantityChange =
                            isAdd
                                ? adjustment.adjustmentNumber
                                : -adjustment.adjustmentNumber;

                        /*
                         * ---------------------------------
                         * Update Stock In Item
                         * ---------------------------------
                         */

                        await tx.stockInItem.update({
                            where: {
                                id: stockInItem.id,
                            },

                            data: {
                                quantity: {
                                    increment: quantityChange,
                                },
                            },
                        });

                        /*
                         * ---------------------------------
                         * Find Inventory
                         * ---------------------------------
                         */

                        const inventory =
                            await tx.inventory.findUnique({
                                where: {
                                    productVariantId_warehouseId_zoneId_subZoneId_rackId:
                                    {
                                        productVariantId:
                                            stockInItem.productVariantId,

                                        warehouseId:
                                            stockInItem.warehouseId,

                                        zoneId:
                                            stockInItem.zoneId,

                                        subZoneId:
                                            stockInItem.subZoneId,

                                        rackId:
                                            stockInItem.rackId,
                                    },
                                },

                                select: {
                                    id: true,
                                    quantity: true,
                                },
                            });

                        if (!inventory) {
                            throw new BadRequestException(
                                `Inventory record not found for product variant ID ${stockInItem.productVariantId}.`,
                            );
                        }

                        /*
                         * ---------------------------------
                         * Prevent negative Inventory
                         * ---------------------------------
                         */

                        if (
                            !isAdd &&
                            adjustment.adjustmentNumber >
                            inventory.quantity
                        ) {
                            throw new BadRequestException(
                                `Cannot subtract ${adjustment.adjustmentNumber} units because current inventory is ${inventory.quantity}.`,
                            );
                        }

                        /*
                         * ---------------------------------
                         * Update Inventory
                         * ---------------------------------
                         */

                        await tx.inventory.update({
                            where: {
                                id: inventory.id,
                            },

                            data: {
                                quantity: {
                                    increment: quantityChange,
                                },
                            },
                        });
                    }

                    /*
                     * ---------------------------------
                     * 6. Recalculate Stock In totals
                     * ---------------------------------
                     */

                    const updatedItems =
                        await tx.stockInItem.findMany({
                            where: {
                                stockInId: id,
                            },

                            include: {
                                productVariant: {
                                    select: {
                                        productsPerPacket: true,
                                    },
                                },
                            },
                        });

                    const totalQuantity =
                        updatedItems.reduce(
                            (total, item) =>
                                total + item.quantity,
                            0,
                        );

                    /*
                     * All variants in a Stock In should
                     * have the same productsPerPacket value.
                     */

                    const productsPerPacketSet = new Set(
                        updatedItems.map(
                            (item) =>
                                item.productVariant.productsPerPacket,
                        ),
                    );

                    if (productsPerPacketSet.size !== 1) {
                        throw new BadRequestException(
                            'Stock In contains variants with different products per packet values.',
                        );
                    }

                    const productsPerPacket =
                        updatedItems[0].productVariant
                            .productsPerPacket;

                    const totalPackages = Math.ceil(
                        totalQuantity / productsPerPacket,
                    );

                    /*
                     * ---------------------------------
                     * 7. Update Stock In Header
                     * ---------------------------------
                     */

                    await tx.stockIn.update({
                        where: {
                            id,
                        },

                        data: {
                            totalQuantity,
                            totalPackages,
                        },
                    });

                    /*
                     * ---------------------------------
                     * Return updated record
                     * ---------------------------------
                     */

                    return tx.stockIn.findUnique({
                        where: {
                            id,
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
            message: 'Stock In adjusted successfully.',
            data: result,
        };
    }





}