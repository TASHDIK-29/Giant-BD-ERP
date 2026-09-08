import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import {
    Prisma,
    Status,
} from '../../generated/prisma/browser.js';

import {
    DatabaseService,
} from '../../database/database.service.js';

import {
    CreateBuyerDto,
} from './dto/create-buyer.dto.js';

import {
    UpdateBuyerDto,
} from './dto/update-buyer.dto.js';

import {
    BuyerQueryDto,
} from './dto/buyer-query.dto.js';


@Injectable()
export class BuyersService {
    constructor(
        private readonly databaseService: DatabaseService,
    ) {}


    /*
     * Create Buyer
     */
    async create(
        createBuyerDto: CreateBuyerDto,
    ) {
        const name =
            createBuyerDto.name.trim();


        const existingBuyer =
            await this.databaseService.buyer.findFirst({
                where: {
                    name: {
                        equals: name,
                        mode: 'insensitive',
                    },

                    type:
                        createBuyerDto.type,
                },
            });


        if (existingBuyer) {
            throw new ConflictException(
                'A Buyer with this name and type already exists.',
            );
        }


        const buyer =
            await this.databaseService.buyer.create({
                data: {
                    name,
                    type:
                        createBuyerDto.type,
                },
            });


        return {
            message:
                'Buyer created successfully.',

            data: buyer,
        };
    }


    /*
     * List Buyers
     */
    async findAll(
        query: BuyerQueryDto,
    ) {
        const {
            page = 1,
            limit = 10,
            search,
            type,
            status,
        } = query;


        const skip =
            (page - 1) * limit;


        const where:
            Prisma.BuyerWhereInput = {
                ...(type !== undefined && {
                    type,
                }),

                ...(status !== undefined && {
                    status,
                }),

                ...(search?.trim() && {
                    name: {
                        contains:
                            search.trim(),
                        mode:
                            'insensitive',
                    },
                }),
            };


        const [
            buyers,
            total,
        ] =
            await this.databaseService.$transaction([
                this.databaseService.buyer.findMany({
                    where,

                    skip,
                    take: limit,

                    orderBy: {
                        createdAt: 'desc',
                    },
                }),

                this.databaseService.buyer.count({
                    where,
                }),
            ]);


        return {
            data: buyers,

            meta: {
                total,
                page,
                limit,

                totalPages:
                    Math.ceil(total / limit),
            },
        };
    }


    /*
     * Get Single Buyer
     */
    async findOne(
        id: number,
    ) {
        const buyer =
            await this.databaseService.buyer.findUnique({
                where: {
                    id,
                },
            });


        if (!buyer) {
            throw new NotFoundException(
                'Buyer was not found.',
            );
        }


        return {
            data: buyer,
        };
    }


    /*
     * Update Buyer
     */
    async update(
        id: number,
        updateBuyerDto: UpdateBuyerDto,
    ) {
        const buyer =
            await this.databaseService.buyer.findUnique({
                where: {
                    id,
                },
            });


        if (!buyer) {
            throw new NotFoundException(
                'Buyer was not found.',
            );
        }


        const targetName =
            updateBuyerDto.name !== undefined
                ? updateBuyerDto.name.trim()
                : buyer.name;


        const targetType =
            updateBuyerDto.type !== undefined
                ? updateBuyerDto.type
                : buyer.type;


        /*
         * Check uniqueness when
         * name or type changes.
         */
        if (
            targetName !== buyer.name ||
            targetType !== buyer.type
        ) {
            const existingBuyer =
                await this.databaseService.buyer.findFirst({
                    where: {
                        name: {
                            equals: targetName,
                            mode: 'insensitive',
                        },

                        type: targetType,

                        NOT: {
                            id,
                        },
                    },
                });


            if (existingBuyer) {
                throw new ConflictException(
                    'A Buyer with this name and type already exists.',
                );
            }
        }


        const updateData:
            Prisma.BuyerUpdateInput = {};


        if (
            updateBuyerDto.name !== undefined
        ) {
            updateData.name =
                targetName;
        }


        if (
            updateBuyerDto.type !== undefined
        ) {
            updateData.type =
                targetType;
        }


        const updatedBuyer =
            await this.databaseService.buyer.update({
                where: {
                    id,
                },

                data:
                    updateData,
            });


        return {
            message:
                'Buyer updated successfully.',

            data:
                updatedBuyer,
        };
    }


    /*
     * Update Buyer Status
     */
    async updateStatus(
        id: number,
        status: Status,
    ) {
        const buyer =
            await this.databaseService.buyer.findUnique({
                where: {
                    id,
                },
            });


        if (!buyer) {
            throw new NotFoundException(
                'Buyer was not found.',
            );
        }


        const updatedBuyer =
            await this.databaseService.buyer.update({
                where: {
                    id,
                },

                data: {
                    status,
                },
            });


        return {
            message:
                'Buyer status updated successfully.',

            data:
                updatedBuyer,
        };
    }


    /*
     * Delete Buyer
     */
    async remove(
        id: number,
    ) {
        const buyer =
            await this.databaseService.buyer.findUnique({
                where: {
                    id,
                },
            });


        if (!buyer) {
            throw new NotFoundException(
                'Buyer was not found.',
            );
        }


        /*
         * Currently no module references
         * Buyer yet.
         *
         * When Purchase Orders or Sales
         * modules are introduced, reference
         * checks should be added here.
         */
        await this.databaseService.buyer.delete({
            where: {
                id,
            },
        });


        return {
            message:
                'Buyer deleted successfully.',
        };
    }
}