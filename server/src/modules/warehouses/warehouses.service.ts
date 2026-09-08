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
    CreateWarehouseDto,
} from './dto/create-warehouse.dto.js';

import {
    UpdateWarehouseDto,
} from './dto/update-warehouse.dto.js';

import {
    WarehouseQueryDto,
} from './dto/warehouse-query.dto.js';


@Injectable()
export class WarehousesService {
    constructor(
        private readonly databaseService: DatabaseService,
    ) {}


    /*
     * Create Warehouse
     */
    async create(
        createWarehouseDto: CreateWarehouseDto,
    ) {
        const name = createWarehouseDto.name.trim();

        const code =
            createWarehouseDto.code
                .trim()
                .toUpperCase();


        const existingWarehouse =
            await this.databaseService.warehouse.findUnique({
                where: {
                    code,
                },
            });


        if (existingWarehouse) {
            throw new ConflictException(
                'Warehouse code already exists.',
            );
        }


        const warehouse =
            await this.databaseService.warehouse.create({
                data: {
                    name,
                    code,

                    ...(createWarehouseDto.description !== undefined && {
                        description:
                            createWarehouseDto.description.trim(),
                    }),
                },
            });


        return {
            message:
                'Warehouse created successfully.',

            data: warehouse,
        };
    }


    /*
     * List Warehouses
     */
    async findAll(
        query: WarehouseQueryDto,
    ) {
        const {
            page = 1,
            limit = 10,
            search,
            status,
        } = query;


        const skip = (page - 1) * limit;


        const where: Prisma.WarehouseWhereInput = {
            ...(status !== undefined && {
                status,
            }),

            ...(search?.trim() && {
                OR: [
                    {
                        name: {
                            contains: search.trim(),
                            mode: 'insensitive',
                        },
                    },

                    {
                        code: {
                            contains: search.trim(),
                            mode: 'insensitive',
                        },
                    },
                ],
            }),
        };


        const [
            warehouses,
            total,
        ] = await this.databaseService.$transaction([
            this.databaseService.warehouse.findMany({
                where,

                skip,

                take: limit,

                orderBy: {
                    createdAt: 'desc',
                },
            }),

            this.databaseService.warehouse.count({
                where,
            }),
        ]);


        return {
            data: warehouses,

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
     * Get Single Warehouse
     */
    async findOne(id: number) {
        const warehouse =
            await this.databaseService.warehouse.findUnique({
                where: {
                    id,
                },
            });


        if (!warehouse) {
            throw new NotFoundException(
                'Warehouse was not found.',
            );
        }


        return {
            data: warehouse,
        };
    }


    /*
     * Update Warehouse
     */
    async update(
        id: number,
        updateWarehouseDto: UpdateWarehouseDto,
    ) {
        const warehouse =
            await this.databaseService.warehouse.findUnique({
                where: {
                    id,
                },
            });


        if (!warehouse) {
            throw new NotFoundException(
                'Warehouse was not found.',
            );
        }


        const updateData:
            Prisma.WarehouseUpdateInput = {};


        if (
            updateWarehouseDto.name !== undefined
        ) {
            updateData.name =
                updateWarehouseDto.name.trim();
        }


        if (
            updateWarehouseDto.code !== undefined
        ) {
            const code =
                updateWarehouseDto.code
                    .trim()
                    .toUpperCase();


            if (code !== warehouse.code) {
                const existingWarehouse =
                    await this.databaseService.warehouse.findUnique({
                        where: {
                            code,
                        },
                    });


                if (existingWarehouse) {
                    throw new ConflictException(
                        'Warehouse code already exists.',
                    );
                }
            }


            updateData.code = code;
        }


        if (
            updateWarehouseDto.description !== undefined
        ) {
            updateData.description =
                updateWarehouseDto.description.trim();
        }


        const updatedWarehouse =
            await this.databaseService.warehouse.update({
                where: {
                    id,
                },

                data: updateData,
            });


        return {
            message:
                'Warehouse updated successfully.',

            data: updatedWarehouse,
        };
    }


    /*
     * Update Warehouse Status
     */
    async updateStatus(
        id: number,
        status: Status,
    ) {
        const warehouse =
            await this.databaseService.warehouse.findUnique({
                where: {
                    id,
                },
            });


        if (!warehouse) {
            throw new NotFoundException(
                'Warehouse was not found.',
            );
        }


        const updatedWarehouse =
            await this.databaseService.warehouse.update({
                where: {
                    id,
                },

                data: {
                    status,
                },
            });


        return {
            message:
                'Warehouse status updated successfully.',

            data: updatedWarehouse,
        };
    }


    /*
     * Delete Warehouse
     *
     * Currently there is no Zone model.
     *
     * When the Zone module is implemented,
     * we will update this method to prevent
     * deletion when Zones exist.
     */
    async remove(id: number) {
        const warehouse =
            await this.databaseService.warehouse.findUnique({
                where: {
                    id,
                },
            });


        if (!warehouse) {
            throw new NotFoundException(
                'Warehouse was not found.',
            );
        }


        await this.databaseService.warehouse.delete({
            where: {
                id,
            },
        });


        return {
            message:
                'Warehouse deleted successfully.',
        };
    }
}