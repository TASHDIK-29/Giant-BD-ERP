import {
    BadRequestException,
    ConflictException,
    Injectable,
} from '@nestjs/common';

import { DatabaseService } from '../../database/database.service.js';

import { CreatePermissionGroupDto } from './dto/create-permission-group.dto.js';

import { QueryPermissionDto } from './dto/query-permission.dto.js';

import {
    normalizePermissionAction,
    normalizePermissionKey,
} from './utils/permission-normalizer.util.js';

@Injectable()
export class PermissionsService {
    constructor(
        private readonly databaseService: DatabaseService,
    ) { }

    async createPermissionGroup(
        createPermissionGroupDto: CreatePermissionGroupDto,
    ) {
        const normalizedKey = normalizePermissionKey(
            createPermissionGroupDto.key,
        );

        const normalizedActions = [
            ...new Set(
                createPermissionGroupDto.actions
                    .map(normalizePermissionAction)
                    .filter(Boolean),
            ),
        ];

        if (!normalizedKey) {
            throw new BadRequestException(
                'Permission group key is invalid after normalization.',
            );
        }

        if (normalizedActions.length === 0) {
            throw new BadRequestException(
                'At least one valid permission action is required.',
            );
        }

        const existingGroup =
            await this.databaseService.permissionGroup.findUnique({
                where: {
                    key: normalizedKey,
                },
            });

        if (existingGroup) {
            throw new ConflictException(
                `Permission group with key "${normalizedKey}" already exists.`,
            );
        }

        const permissionNames = normalizedActions.map(
            (action) => `${normalizedKey}:${action}`,
        );

        const existingPermission =
            await this.databaseService.permission.findFirst({
                where: {
                    name: {
                        in: permissionNames,
                    },
                },
            });

        if (existingPermission) {
            throw new ConflictException(
                `Permission "${existingPermission.name}" already exists.`,
            );
        }

        const permissionGroup =
            await this.databaseService.permissionGroup.create({
                data: {
                    name: createPermissionGroupDto.name.trim(),
                    key: normalizedKey,
                    description:
                        createPermissionGroupDto.description?.trim() || null,

                    permissions: {
                        create: normalizedActions.map((action) => ({
                            name: `${normalizedKey}:${action}`,
                            action,
                        })),
                    },
                },

                include: {
                    permissions: {
                        orderBy: {
                            id: 'asc',
                        },
                    },
                },
            });

        return permissionGroup;
    }



    async findAllPermissionGroups(
        queryPermissionDto: QueryPermissionDto,
    ) {
        const {
            page = 1,
            limit = 10,
            search,
        } = queryPermissionDto;

        const skip = (page - 1) * limit;

        // const where = search
        //     ? {
        //         OR: [
        //             {
        //                 name: {
        //                     contains: search.trim(),
        //                     mode: 'insensitive' as const,
        //                 },
        //             },
        //             {
        //                 key: {
        //                     contains: search.trim(),
        //                     mode: 'insensitive' as const,
        //                 },
        //             },
        //         ],
        //     }
        //     : {};


        const normalizedSearch = search?.trim();

        const where = normalizedSearch
            ? {
                OR: [
                    {
                        name: {
                            contains: normalizedSearch,
                            mode: 'insensitive' as const,
                        },
                    },
                    {
                        key: {
                            contains: normalizedSearch,
                            mode: 'insensitive' as const,
                        },
                    },
                ],
            }
            : {};

            

        const [permissionGroups, total] =
            await this.databaseService.$transaction([
                this.databaseService.permissionGroup.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: {
                        id: 'desc',
                    },
                    include: {
                        permissions: {
                            orderBy: {
                                id: 'asc',
                            },
                        },
                        _count: {
                            select: {
                                permissions: true,
                            },
                        },
                    },
                }),

                this.databaseService.permissionGroup.count({
                    where,
                }),
            ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data: permissionGroups.map((group) => ({
                id: group.id,
                name: group.name,
                key: group.key,
                description: group.description,
                permissions: group.permissions,
                permissionCount: group._count.permissions,
                createdAt: group.createdAt,
                updatedAt: group.updatedAt,
            })),

            meta: {
                page,
                limit,
                total,
                totalPages,
            },
        };
    }
}