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
    CreateRackDto,
} from './dto/create-rack.dto.js';

import {
    UpdateRackDto,
} from './dto/update-rack.dto.js';

import {
    RackQueryDto,
} from './dto/rack-query.dto.js';


@Injectable()
export class RacksService {
    constructor(
        private readonly databaseService: DatabaseService,
    ) {}


    /*
     * Create Rack
     */
    async create(
        createRackDto: CreateRackDto,
    ) {
        const subZone =
            await this.databaseService.subZone.findUnique({
                where: {
                    id: createRackDto.subZoneId,
                },

                include: {
                    zone: {
                        include: {
                            warehouse: {
                                select: {
                                    id: true,
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


        /*
         * Prevent creating a Rack
         * under an inactive hierarchy.
         */
        if (
            subZone.status !== Status.ACTIVE
        ) {
            throw new ConflictException(
                'Cannot create a Rack under an inactive Sub Zone.',
            );
        }


        if (
            subZone.zone.status !== Status.ACTIVE
        ) {
            throw new ConflictException(
                'Cannot create a Rack because its Zone is inactive.',
            );
        }


        if (
            subZone.zone.warehouse.status !==
            Status.ACTIVE
        ) {
            throw new ConflictException(
                'Cannot create a Rack because its Warehouse is inactive.',
            );
        }


        const name =
            createRackDto.name.trim();

        const code =
            createRackDto.code
                .trim()
                .toUpperCase();


        const existingRack =
            await this.databaseService.rack.findUnique({
                where: {
                    subZoneId_code: {
                        subZoneId:
                            createRackDto.subZoneId,

                        code,
                    },
                },
            });


        if (existingRack) {
            throw new ConflictException(
                'A Rack with this code already exists in this Sub Zone.',
            );
        }


        const rack =
            await this.databaseService.rack.create({
                data: {
                    name,
                    code,

                    subZoneId:
                        createRackDto.subZoneId,

                    ...(createRackDto.description !==
                        undefined && {
                        description:
                            createRackDto.description.trim(),
                    }),
                },

                include: {
                    subZone: {
                        select: {
                            id: true,
                            name: true,
                            code: true,

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
                    },
                },
            });


        return {
            message:
                'Rack created successfully.',

            data: rack,
        };
    }


    /*
     * List Racks
     */
    async findAll(
        query: RackQueryDto,
    ) {
        const {
            page = 1,
            limit = 10,
            search,
            subZoneId,
            status,
        } = query;


        const skip =
            (page - 1) * limit;


        const where:
            Prisma.RackWhereInput = {
                ...(subZoneId !== undefined && {
                    subZoneId,
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
            racks,
            total,
        ] = await this.databaseService.$transaction([
            this.databaseService.rack.findMany({
                where,

                skip,
                take: limit,

                orderBy: {
                    createdAt: 'desc',
                },

                include: {
                    subZone: {
                        select: {
                            id: true,
                            name: true,
                            code: true,

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
                    },
                },
            }),

            this.databaseService.rack.count({
                where,
            }),
        ]);


        return {
            data: racks,

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
     * Get Single Rack
     */
    async findOne(
        id: number,
    ) {
        const rack =
            await this.databaseService.rack.findUnique({
                where: {
                    id,
                },

                include: {
                    subZone: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                            status: true,

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
                    },
                },
            });


        if (!rack) {
            throw new NotFoundException(
                'Rack was not found.',
            );
        }


        return {
            data: rack,
        };
    }


    /*
     * Update Rack
     */
    async update(
        id: number,
        updateRackDto: UpdateRackDto,
    ) {
        const rack =
            await this.databaseService.rack.findUnique({
                where: {
                    id,
                },
            });


        if (!rack) {
            throw new NotFoundException(
                'Rack was not found.',
            );
        }


        let targetSubZoneId =
            rack.subZoneId;


        /*
         * Validate target Sub Zone
         * if the Rack is being moved.
         */
        if (
            updateRackDto.subZoneId !== undefined
        ) {
            const subZone =
                await this.databaseService.subZone.findUnique({
                    where: {
                        id:
                            updateRackDto.subZoneId,
                    },

                    include: {
                        zone: {
                            include: {
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
                subZone.status !== Status.ACTIVE
            ) {
                throw new ConflictException(
                    'Cannot move a Rack to an inactive Sub Zone.',
                );
            }


            if (
                subZone.zone.status !== Status.ACTIVE
            ) {
                throw new ConflictException(
                    'Cannot move a Rack because the target Zone is inactive.',
                );
            }


            if (
                subZone.zone.warehouse.status !==
                Status.ACTIVE
            ) {
                throw new ConflictException(
                    'Cannot move a Rack because the target Warehouse is inactive.',
                );
            }


            targetSubZoneId =
                updateRackDto.subZoneId;
        }


        const targetCode =
            updateRackDto.code !== undefined
                ? updateRackDto.code
                    .trim()
                    .toUpperCase()
                : rack.code;


        /*
         * Check compound uniqueness if
         * the parent or Rack code changes.
         */
        if (
            targetSubZoneId !== rack.subZoneId ||
            targetCode !== rack.code
        ) {
            const existingRack =
                await this.databaseService.rack.findUnique({
                    where: {
                        subZoneId_code: {
                            subZoneId:
                                targetSubZoneId,

                            code:
                                targetCode,
                        },
                    },
                });


            if (
                existingRack &&
                existingRack.id !== id
            ) {
                throw new ConflictException(
                    'A Rack with this code already exists in the target Sub Zone.',
                );
            }
        }


        const updateData:
            Prisma.RackUpdateInput = {};


        if (
            updateRackDto.name !== undefined
        ) {
            updateData.name =
                updateRackDto.name.trim();
        }


        if (
            updateRackDto.code !== undefined
        ) {
            updateData.code =
                targetCode;
        }


        if (
            updateRackDto.description !== undefined
        ) {
            updateData.description =
                updateRackDto.description.trim();
        }


        if (
            updateRackDto.subZoneId !== undefined
        ) {
            updateData.subZone = {
                connect: {
                    id:
                        updateRackDto.subZoneId,
                },
            };
        }


        const updatedRack =
            await this.databaseService.rack.update({
                where: {
                    id,
                },

                data:
                    updateData,

                include: {
                    subZone: {
                        select: {
                            id: true,
                            name: true,
                            code: true,

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
                    },
                },
            });


        return {
            message:
                'Rack updated successfully.',

            data:
                updatedRack,
        };
    }


    /*
     * Update Rack Status
     */
    async updateStatus(
        id: number,
        status: Status,
    ) {
        const rack =
            await this.databaseService.rack.findUnique({
                where: {
                    id,
                },

                include: {
                    subZone: {
                        select: {
                            status: true,

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
                    },
                },
            });


        if (!rack) {
            throw new NotFoundException(
                'Rack was not found.',
            );
        }


        /*
         * A Rack cannot become ACTIVE
         * when any parent is inactive.
         */
        if (
            status === Status.ACTIVE
        ) {
            if (
                rack.subZone.status !==
                Status.ACTIVE
            ) {
                throw new ConflictException(
                    'Cannot activate a Rack because its Sub Zone is inactive.',
                );
            }


            if (
                rack.subZone.zone.status !==
                Status.ACTIVE
            ) {
                throw new ConflictException(
                    'Cannot activate a Rack because its Zone is inactive.',
                );
            }


            if (
                rack.subZone.zone.warehouse.status !==
                Status.ACTIVE
            ) {
                throw new ConflictException(
                    'Cannot activate a Rack because its Warehouse is inactive.',
                );
            }
        }


        const updatedRack =
            await this.databaseService.rack.update({
                where: {
                    id,
                },

                data: {
                    status,
                },
            });


        return {
            message:
                'Rack status updated successfully.',

            data:
                updatedRack,
        };
    }


    /*
     * Delete Rack
     *
     * Currently Rack is the lowest
     * level of the hierarchy.
     */
    async remove(
        id: number,
    ) {
        const rack =
            await this.databaseService.rack.findUnique({
                where: {
                    id,
                },
            });


        if (!rack) {
            throw new NotFoundException(
                'Rack was not found.',
            );
        }


        await this.databaseService.rack.delete({
            where: {
                id,
            },
        });


        return {
            message:
                'Rack deleted successfully.',
        };
    }
}