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
    CreateSubZoneDto,
} from './dto/create-sub-zone.dto.js';

import {
    UpdateSubZoneDto,
} from './dto/update-sub-zone.dto.js';

import {
    SubZoneQueryDto,
} from './dto/sub-zone-query.dto.js';


@Injectable()
export class SubZonesService {
    constructor(
        private readonly databaseService: DatabaseService,
    ) {}


    /*
     * Create Sub Zone
     */
    async create(
        createSubZoneDto: CreateSubZoneDto,
    ) {
        const zone =
            await this.databaseService.zone.findUnique({
                where: {
                    id: createSubZoneDto.zoneId,
                },

                include: {
                    warehouse: {
                        select: {
                            id: true,
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


        if (zone.status !== Status.ACTIVE) {
            throw new ConflictException(
                'Cannot create a Sub Zone under an inactive Zone.',
            );
        }


        if (zone.warehouse.status !== Status.ACTIVE) {
            throw new ConflictException(
                'Cannot create a Sub Zone because its Warehouse is inactive.',
            );
        }


        const name =
            createSubZoneDto.name.trim();

        const code =
            createSubZoneDto.code
                .trim()
                .toUpperCase();


        const existingSubZone =
            await this.databaseService.subZone.findUnique({
                where: {
                    zoneId_code: {
                        zoneId:
                            createSubZoneDto.zoneId,

                        code,
                    },
                },
            });


        if (existingSubZone) {
            throw new ConflictException(
                'A Sub Zone with this code already exists in this Zone.',
            );
        }


        const subZone =
            await this.databaseService.subZone.create({
                data: {
                    name,
                    code,

                    zoneId:
                        createSubZoneDto.zoneId,

                    ...(createSubZoneDto.description !== undefined && {
                        description:
                            createSubZoneDto.description.trim(),
                    }),
                },

                include: {
                    zone: {
                        select: {
                            id: true,
                            name: true,
                            code: true,

                            warehouse: {
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


        return {
            message:
                'Sub Zone created successfully.',

            data: subZone,
        };
    }


    /*
     * List Sub Zones
     */
    async findAll(
        query: SubZoneQueryDto,
    ) {
        const {
            page = 1,
            limit = 10,
            search,
            zoneId,
            status,
        } = query;


        const skip =
            (page - 1) * limit;


        const where:
            Prisma.SubZoneWhereInput = {
                ...(zoneId !== undefined && {
                    zoneId,
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
            subZones,
            total,
        ] = await this.databaseService.$transaction([
            this.databaseService.subZone.findMany({
                where,

                skip,
                take: limit,

                orderBy: {
                    createdAt: 'desc',
                },

                include: {
                    zone: {
                        select: {
                            id: true,
                            name: true,
                            code: true,

                            warehouse: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true,
                                },
                            },
                        },
                    },
                },
            }),

            this.databaseService.subZone.count({
                where,
            }),
        ]);


        return {
            data: subZones,

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
     * Get Single Sub Zone
     */
    async findOne(
        id: number,
    ) {
        const subZone =
            await this.databaseService.subZone.findUnique({
                where: {
                    id,
                },

                include: {
                    zone: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                            status: true,

                            warehouse: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true,
                                    status: true,
                                },
                            },
                        },
                    },
                },
            });


        if (!subZone) {
            throw new NotFoundException(
                'Sub Zone was not found.',
            );
        }


        return {
            data: subZone,
        };
    }


    /*
     * Update Sub Zone
     */
    async update(
        id: number,
        updateSubZoneDto: UpdateSubZoneDto,
    ) {
        const subZone =
            await this.databaseService.subZone.findUnique({
                where: {
                    id,
                },
            });


        if (!subZone) {
            throw new NotFoundException(
                'Sub Zone was not found.',
            );
        }


        let targetZoneId =
            subZone.zoneId;


        if (
            updateSubZoneDto.zoneId !== undefined
        ) {
            const zone =
                await this.databaseService.zone.findUnique({
                    where: {
                        id:
                            updateSubZoneDto.zoneId,
                    },

                    include: {
                        warehouse: {
                            select: {
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


            if (zone.status !== Status.ACTIVE) {
                throw new ConflictException(
                    'Cannot move a Sub Zone to an inactive Zone.',
                );
            }


            if (
                zone.warehouse.status !== Status.ACTIVE
            ) {
                throw new ConflictException(
                    'Cannot move a Sub Zone because the target Warehouse is inactive.',
                );
            }


            targetZoneId =
                updateSubZoneDto.zoneId;
        }


        const targetCode =
            updateSubZoneDto.code !== undefined
                ? updateSubZoneDto.code
                    .trim()
                    .toUpperCase()
                : subZone.code;


        /*
         * Validate the compound unique constraint
         * when the Zone or code changes.
         */
        if (
            targetZoneId !== subZone.zoneId ||
            targetCode !== subZone.code
        ) {
            const existingSubZone =
                await this.databaseService.subZone.findUnique({
                    where: {
                        zoneId_code: {
                            zoneId:
                                targetZoneId,

                            code:
                                targetCode,
                        },
                    },
                });


            if (
                existingSubZone &&
                existingSubZone.id !== id
            ) {
                throw new ConflictException(
                    'A Sub Zone with this code already exists in the target Zone.',
                );
            }
        }


        const updateData:
            Prisma.SubZoneUpdateInput = {};


        if (
            updateSubZoneDto.name !== undefined
        ) {
            updateData.name =
                updateSubZoneDto.name.trim();
        }


        if (
            updateSubZoneDto.code !== undefined
        ) {
            updateData.code =
                targetCode;
        }


        if (
            updateSubZoneDto.description !== undefined
        ) {
            updateData.description =
                updateSubZoneDto.description.trim();
        }


        if (
            updateSubZoneDto.zoneId !== undefined
        ) {
            updateData.zone = {
                connect: {
                    id:
                        updateSubZoneDto.zoneId,
                },
            };
        }


        const updatedSubZone =
            await this.databaseService.subZone.update({
                where: {
                    id,
                },

                data:
                    updateData,

                include: {
                    zone: {
                        select: {
                            id: true,
                            name: true,
                            code: true,

                            warehouse: {
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


        return {
            message:
                'Sub Zone updated successfully.',

            data:
                updatedSubZone,
        };
    }


    /*
     * Update Sub Zone Status
     */
    async updateStatus(
        id: number,
        status: Status,
    ) {
        const subZone =
            await this.databaseService.subZone.findUnique({
                where: {
                    id,
                },

                include: {
                    zone: {
                        select: {
                            status: true,

                            warehouse: {
                                select: {
                                    status: true,
                                },
                            },
                        },
                    },
                },
            });


        if (!subZone) {
            throw new NotFoundException(
                'Sub Zone was not found.',
            );
        }


        if (
            status === Status.ACTIVE
        ) {
            if (
                subZone.zone.status !== Status.ACTIVE
            ) {
                throw new ConflictException(
                    'Cannot activate a Sub Zone because its Zone is inactive.',
                );
            }


            if (
                subZone.zone.warehouse.status !==
                Status.ACTIVE
            ) {
                throw new ConflictException(
                    'Cannot activate a Sub Zone because its Warehouse is inactive.',
                );
            }
        }


        const updatedSubZone =
            await this.databaseService.subZone.update({
                where: {
                    id,
                },

                data: {
                    status,
                },
            });


        return {
            message:
                'Sub Zone status updated successfully.',

            data:
                updatedSubZone,
        };
    }


    /*
     * Delete Sub Zone
     *
     * Rack does not exist yet.
     *
     * In Step 4, we will prevent deletion
     * when Racks exist.
     */
    async remove(
        id: number,
    ) {
        const subZone =
            await this.databaseService.subZone.findUnique({
                where: {
                    id,
                },
            });


        if (!subZone) {
            throw new NotFoundException(
                'Sub Zone was not found.',
            );
        }


        await this.databaseService.subZone.delete({
            where: {
                id,
            },
        });


        return {
            message:
                'Sub Zone deleted successfully.',
        };
    }
}