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
    CreateZoneDto,
} from './dto/create-zone.dto.js';

import {
    UpdateZoneDto,
} from './dto/update-zone.dto.js';

import {
    ZoneQueryDto,
} from './dto/zone-query.dto.js';


@Injectable()
export class ZonesService {
    constructor(
        private readonly databaseService: DatabaseService,
    ) { }


    /*
     * Create Zone
     */
    async create(
        createZoneDto: CreateZoneDto,
    ) {
        const warehouse =
            await this.databaseService.warehouse.findUnique({
                where: {
                    id: createZoneDto.warehouseId,
                },
            });


        if (!warehouse) {
            throw new NotFoundException(
                'Warehouse was not found.',
            );
        }


        if (warehouse.status !== Status.ACTIVE) {
            throw new ConflictException(
                'Cannot create a Zone under an inactive Warehouse.',
            );
        }


        const name =
            createZoneDto.name.trim();

        const code =
            createZoneDto.code
                .trim()
                .toUpperCase();


        const existingZone =
            await this.databaseService.zone.findUnique({
                where: {
                    warehouseId_code: {
                        warehouseId:
                            createZoneDto.warehouseId,
                        code,
                    },
                },
            });


        if (existingZone) {
            throw new ConflictException(
                'A Zone with this code already exists in this Warehouse.',
            );
        }


        const zone =
            await this.databaseService.zone.create({
                data: {
                    name,
                    code,

                    warehouseId:
                        createZoneDto.warehouseId,

                    ...(createZoneDto.description !== undefined && {
                        description:
                            createZoneDto.description.trim(),
                    }),
                },

                include: {
                    warehouse: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                },
            });


        return {
            message:
                'Zone created successfully.',

            data: zone,
        };
    }


    /*
     * List Zones
     */
    async findAll(
        query: ZoneQueryDto,
    ) {
        const {
            page = 1,
            limit = 10,
            search,
            warehouseId,
            status,
        } = query;


        const skip =
            (page - 1) * limit;


        const where:
            Prisma.ZoneWhereInput = {
            ...(warehouseId !== undefined && {
                warehouseId,
            }),

            ...(status !== undefined && {
                status,
            }),

            ...(search?.trim() && {
                OR: [
                    {
                        name: {
                            contains:
                                search.trim(),
                            mode:
                                'insensitive',
                        },
                    },

                    {
                        code: {
                            contains:
                                search.trim(),
                            mode:
                                'insensitive',
                        },
                    },
                ],
            }),
        };


        const [
            zones,
            total,
        ] = await this.databaseService.$transaction([
            this.databaseService.zone.findMany({
                where,

                skip,

                take: limit,

                orderBy: {
                    createdAt: 'desc',
                },

                include: {
                    warehouse: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                },
            }),

            this.databaseService.zone.count({
                where,
            }),
        ]);


        return {
            data: zones,

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
     * Get Single Zone
     */
    async findOne(
        id: number,
    ) {
        const zone =
            await this.databaseService.zone.findUnique({
                where: {
                    id,
                },

                include: {
                    warehouse: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                            status: true,
                        },
                    },
                },
            });


        if (!zone) {
            throw new NotFoundException(
                'Zone was not found.',
            );
        }


        return {
            data: zone,
        };
    }


    /*
     * Update Zone
     */
    async update(
        id: number,
        updateZoneDto: UpdateZoneDto,
    ) {
        const zone =
            await this.databaseService.zone.findUnique({
                where: {
                    id,
                },
            });


        if (!zone) {
            throw new NotFoundException(
                'Zone was not found.',
            );
        }


        let targetWarehouseId =
            zone.warehouseId;


        if (
            updateZoneDto.warehouseId !== undefined
        ) {
            const warehouse =
                await this.databaseService.warehouse.findUnique({
                    where: {
                        id:
                            updateZoneDto.warehouseId,
                    },
                });


            if (!warehouse) {
                throw new NotFoundException(
                    'Warehouse was not found.',
                );
            }


            if (warehouse.status !== Status.ACTIVE) {
                throw new ConflictException(
                    'Cannot assign a Zone to an inactive Warehouse.',
                );
            }


            targetWarehouseId =
                updateZoneDto.warehouseId;
        }


        const targetCode =
            updateZoneDto.code !== undefined
                ? updateZoneDto.code
                    .trim()
                    .toUpperCase()
                : zone.code;


        /*
         * Check the compound unique constraint.
         *
         * This check is important when either:
         *
         * - warehouseId changes
         * - code changes
         */
        if (
            targetWarehouseId !== zone.warehouseId ||
            targetCode !== zone.code
        ) {
            const existingZone =
                await this.databaseService.zone.findUnique({
                    where: {
                        warehouseId_code: {
                            warehouseId:
                                targetWarehouseId,
                            code:
                                targetCode,
                        },
                    },
                });


            if (
                existingZone &&
                existingZone.id !== id
            ) {
                throw new ConflictException(
                    'A Zone with this code already exists in the target Warehouse.',
                );
            }
        }


        const updateData:
            Prisma.ZoneUpdateInput = {};


        if (
            updateZoneDto.name !== undefined
        ) {
            updateData.name =
                updateZoneDto.name.trim();
        }


        if (
            updateZoneDto.code !== undefined
        ) {
            updateData.code =
                targetCode;
        }


        if (
            updateZoneDto.description !== undefined
        ) {
            updateData.description =
                updateZoneDto.description.trim();
        }


        if (
            updateZoneDto.warehouseId !== undefined
        ) {
            updateData.warehouse = {
                connect: {
                    id:
                        updateZoneDto.warehouseId,
                },
            };
        }


        const updatedZone =
            await this.databaseService.zone.update({
                where: {
                    id,
                },

                data:
                    updateData,

                include: {
                    warehouse: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                },
            });


        return {
            message:
                'Zone updated successfully.',

            data:
                updatedZone,
        };
    }


    /*
     * Update Zone Status
     */
    async updateStatus(
        id: number,
        status: Status,
    ) {
        const zone =
            await this.databaseService.zone.findUnique({
                where: {
                    id,
                },
            });


        if (!zone) {
            throw new NotFoundException(
                'Zone was not found.',
            );
        }


        /*
         * Optional business rule:
         *
         * An active Zone should not exist
         * under an inactive Warehouse.
         */
        if (
            status === Status.ACTIVE
        ) {
            const warehouse =
                await this.databaseService.warehouse.findUnique({
                    where: {
                        id:
                            zone.warehouseId,
                    },

                    select: {
                        status: true,
                    },
                });


            if (
                warehouse?.status !== Status.ACTIVE
            ) {
                throw new ConflictException(
                    'Cannot activate a Zone because its Warehouse is inactive.',
                );
            }
        }


        const updatedZone =
            await this.databaseService.zone.update({
                where: {
                    id,
                },

                data: {
                    status,
                },
            });


        return {
            message:
                'Zone status updated successfully.',

            data:
                updatedZone,
        };
    }


    /*
     * Delete Zone Safely
     *
     * SubZone does not exist yet.
     *
     * When Step 3 is implemented,
     * this method will be updated to prevent
     * deletion when Sub Zones exist.
     */
    async remove(
        id: number,
    ) {
        const zone =
            await this.databaseService.zone.findUnique({
                where: {
                    id,
                },

                include: {
                    _count: {
                        select: {
                            subZones: true,
                        },
                    },
                },
            });


        if (!zone) {
            throw new NotFoundException(
                'Zone was not found.',
            );
        }


        if (zone._count.subZones > 0) {
            throw new ConflictException(
                'Cannot delete this Zone because it contains Sub Zones.',
            );
        }


        await this.databaseService.zone.delete({
            where: {
                id,
            },
        });


        return {
            message:
                'Zone deleted successfully.',
        };
    }
}