import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { DatabaseService } from '../../database/database.service.js';

import { CreatePermissionGroupDto } from './dto/create-permission-group.dto.js';
import { UpdatePermissionGroupDto } from './dto/update-permission-group.dto.js';

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


    // OLD VERSION OF createPermissionGroup
    // async createPermissionGroup(
    //     createPermissionGroupDto: CreatePermissionGroupDto,
    // ) {
    //     const normalizedKey = normalizePermissionKey(
    //         createPermissionGroupDto.key,
    //     );

    //     const normalizedActions = [
    //         ...new Set(
    //             createPermissionGroupDto.actions
    //                 .map(normalizePermissionAction)
    //                 .filter(Boolean),
    //         ),
    //     ];

    //     if (!normalizedKey) {
    //         throw new BadRequestException(
    //             'Permission group key is invalid after normalization.',
    //         );
    //     }

    //     if (normalizedActions.length === 0) {
    //         throw new BadRequestException(
    //             'At least one valid permission action is required.',
    //         );
    //     }

    //     const existingGroup =
    //         await this.databaseService.permissionGroup.findUnique({
    //             where: {
    //                 key: normalizedKey,
    //             },
    //         });

    //     if (existingGroup) {
    //         throw new ConflictException(
    //             `Permission group with key "${normalizedKey}" already exists.`,
    //         );
    //     }

    //     const permissionNames = normalizedActions.map(
    //         (action) => `${normalizedKey}:${action}`,
    //     );

    //     const existingPermission =
    //         await this.databaseService.permission.findFirst({
    //             where: {
    //                 name: {
    //                     in: permissionNames,
    //                 },
    //             },
    //         });

    //     if (existingPermission) {
    //         throw new ConflictException(
    //             `Permission "${existingPermission.name}" already exists.`,
    //         );
    //     }

    //     const permissionGroup =
    //         await this.databaseService.permissionGroup.create({
    //             data: {
    //                 name: createPermissionGroupDto.name.trim(),
    //                 key: normalizedKey,
    //                 description:
    //                     createPermissionGroupDto.description?.trim() || null,

    //                 permissions: {
    //                     create: normalizedActions.map((action) => ({
    //                         name: `${normalizedKey}:${action}`,
    //                         action,
    //                     })),
    //                 },
    //             },

    //             include: {
    //                 permissions: {
    //                     orderBy: {
    //                         id: 'asc',
    //                     },
    //                 },
    //             },
    //         });

    //     return permissionGroup;
    // }


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

        return this.databaseService.$transaction(async (tx) => {
            // 1. Check if permission group already exists
            const existingGroup = await tx.permissionGroup.findUnique({
                where: {
                    key: normalizedKey,
                },
            });

            if (existingGroup) {
                throw new ConflictException(
                    `Permission group with key "${normalizedKey}" already exists.`,
                );
            }

            // 2. Check if any permission already exists
            const permissionNames = normalizedActions.map(
                (action) => `${normalizedKey}:${action}`,
            );

            const existingPermission = await tx.permission.findFirst({
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

            // 3. Find super admin role
            const superAdminRole = await tx.role.findUnique({
                where: {
                    name: 'SUPER_ADMIN',
                    // isSystem: true,
                },
            });

            if (!superAdminRole) {
                throw new NotFoundException(
                    'Super admin role does not exist.',
                );
            }

            // 4. Create permission group + permissions
            const permissionGroup =
                await tx.permissionGroup.create({
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

            // 5. Assign newly created permissions to super admin
            await tx.rolePermission.createMany({
                data: permissionGroup.permissions.map((permission) => ({
                    roleId: superAdminRole.id,
                    permissionId: permission.id,
                })),
                skipDuplicates: true,
            });

            // 6. Return the created permission group
            return permissionGroup;
        });
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





    // async updatePermissionGroup(
    //     id: number,
    //     updatePermissionGroupDto: UpdatePermissionGroupDto,
    // ) {
    //     const existingGroup =
    //         await this.databaseService.permissionGroup.findUnique({
    //             where: {
    //                 id,
    //             },
    //             include: {
    //                 permissions: true,
    //             },
    //         });

    //     if (!existingGroup) {
    //         throw new NotFoundException(
    //             `Permission group with ID ${id} was not found.`,
    //         );
    //     }

    //     /*
    //      * ------------------------------
    //      * Normalize group key
    //      * ------------------------------
    //      */

    //     const normalizedKey = updatePermissionGroupDto.key
    //         ? normalizePermissionKey(updatePermissionGroupDto.key)
    //         : existingGroup.key;

    //     if (!normalizedKey) {
    //         throw new BadRequestException(
    //             'Permission group key is invalid after normalization.',
    //         );
    //     }

    //     /*
    //      * ------------------------------
    //      * Check duplicate group key
    //      * ------------------------------
    //      */

    //     if (normalizedKey !== existingGroup.key) {
    //         const duplicateGroup =
    //             await this.databaseService.permissionGroup.findUnique({
    //                 where: {
    //                     key: normalizedKey,
    //                 },
    //             });

    //         if (duplicateGroup) {
    //             throw new ConflictException(
    //                 `Permission group with key "${normalizedKey}" already exists.`,
    //             );
    //         }
    //     }

    //     /*
    //      * ------------------------------
    //      * Normalize actions
    //      * ------------------------------
    //      */

    //     const normalizedActions =
    //         updatePermissionGroupDto.actions !== undefined
    //             ? [
    //                 ...new Set(
    //                     updatePermissionGroupDto.actions
    //                         .map(normalizePermissionAction)
    //                         .filter(Boolean),
    //                 ),
    //             ]
    //             : existingGroup.permissions.map(
    //                 (permission) => permission.action,
    //             );

    //     if (normalizedActions.length === 0) {
    //         throw new BadRequestException(
    //             'At least one valid permission action is required.',
    //         );
    //     }

    //     /*
    //      * ------------------------------
    //      * Calculate permission changes
    //      * ------------------------------
    //      */

    //     const existingActions = new Set(
    //         existingGroup.permissions.map(
    //             (permission) => permission.action,
    //         ),
    //     );

    //     const requestedActions = new Set(normalizedActions);

    //     const actionsToAdd = normalizedActions.filter(
    //         (action) => !existingActions.has(action),
    //     );

    //     const permissionsToDelete =
    //         existingGroup.permissions.filter(
    //             (permission) =>
    //                 !requestedActions.has(permission.action),
    //         );

    //     /*
    //      * ------------------------------
    //      * Transaction
    //      * ------------------------------
    //      */

    //     return this.databaseService.$transaction(
    //         async (tx) => {
    //             /*
    //              * Update permission group
    //              */

    //             const updatedGroup =
    //                 await tx.permissionGroup.update({
    //                     where: {
    //                         id,
    //                     },
    //                     data: {
    //                         name:
    //                             updatePermissionGroupDto.name?.trim() ??
    //                             existingGroup.name,

    //                         key: normalizedKey,

    //                         description:
    //                             updatePermissionGroupDto.description !== undefined
    //                                 ? updatePermissionGroupDto.description.trim() ||
    //                                 null
    //                                 : existingGroup.description,
    //                     },
    //                 });

    //             /*
    //              * Rename existing permissions
    //              *
    //              * Necessary if group key changes:
    //              *
    //              * product:create
    //              *       ↓
    //              * inventory:create
    //              */

    //             if (normalizedKey !== existingGroup.key) {
    //                 for (const permission of existingGroup.permissions) {
    //                     if (
    //                         !permissionsToDelete.some(
    //                             (item) => item.id === permission.id,
    //                         )
    //                     ) {
    //                         await tx.permission.update({
    //                             where: {
    //                                 id: permission.id,
    //                             },
    //                             data: {
    //                                 name: `${normalizedKey}:${permission.action}`,
    //                             },
    //                         });
    //                     }
    //                 }
    //             }

    //             /*
    //              * Delete removed permissions
    //              *
    //              * Because RolePermission references Permission,
    //              * we must remove RolePermission records first.
    //              */

    //             if (permissionsToDelete.length > 0) {
    //                 const permissionIds =
    //                     permissionsToDelete.map(
    //                         (permission) => permission.id,
    //                     );

    //                 await tx.rolePermission.deleteMany({
    //                     where: {
    //                         permissionId: {
    //                             in: permissionIds,
    //                         },
    //                     },
    //                 });

    //                 await tx.permission.deleteMany({
    //                     where: {
    //                         id: {
    //                             in: permissionIds,
    //                         },
    //                     },
    //                 });
    //             }

    //             /*
    //              * Create new permissions
    //              */

    //             if (actionsToAdd.length > 0) {
    //                 await tx.permission.createMany({
    //                     data: actionsToAdd.map((action) => ({
    //                         name: `${normalizedKey}:${action}`,
    //                         action,
    //                         permissionGroupId: id,
    //                     })),
    //                 });
    //             }

    //             /*
    //              * Return updated group
    //              */

    //             return tx.permissionGroup.findUnique({
    //                 where: {
    //                     id: updatedGroup.id,
    //                 },
    //                 include: {
    //                     permissions: {
    //                         orderBy: {
    //                             id: 'asc',
    //                         },
    //                     },
    //                     _count: {
    //                         select: {
    //                             permissions: true,
    //                         },
    //                     },
    //                 },
    //             });
    //         },
    //     );
    // }



    async updatePermissionGroup(
        id: number,
        updatePermissionGroupDto: UpdatePermissionGroupDto,
    ) {
        const existingGroup =
            await this.databaseService.permissionGroup.findUnique({
                where: {
                    id,
                },
                include: {
                    permissions: true,
                },
            });

        if (!existingGroup) {
            throw new NotFoundException(
                `Permission group with ID ${id} was not found.`,
            );
        }

        /*
         * If actions are not provided,
         * keep the existing permissions unchanged.
         */

        const normalizedActions =
            updatePermissionGroupDto.actions !== undefined
                ? [
                    ...new Set(
                        updatePermissionGroupDto.actions
                            .map(normalizePermissionAction)
                            .filter(Boolean),
                    ),
                ]
                : existingGroup.permissions.map(
                    (permission) => permission.action,
                );

        if (normalizedActions.length === 0) {
            throw new BadRequestException(
                'At least one valid permission action is required.',
            );
        }

        const existingActions = new Set(
            existingGroup.permissions.map(
                (permission) => permission.action,
            ),
        );

        const requestedActions = new Set(normalizedActions);

        /*
         * Actions that need to be created
         */

        const actionsToAdd = normalizedActions.filter(
            (action) => !existingActions.has(action),
        );

        /*
         * Permissions that need to be removed
         */

        const permissionsToDelete =
            existingGroup.permissions.filter(
                (permission) =>
                    !requestedActions.has(permission.action),
            );

        /*
         * Run the entire update operation
         * inside a database transaction.
         */

        return this.databaseService.$transaction(
            async (tx) => {
                /*
                 * Update basic group information.
                 */

                const updatedGroup =
                    await tx.permissionGroup.update({
                        where: {
                            id,
                        },
                        data: {
                            name:
                                updatePermissionGroupDto.name?.trim() ??
                                existingGroup.name,

                            description:
                                updatePermissionGroupDto.description !== undefined
                                    ? updatePermissionGroupDto.description.trim() || null
                                    : existingGroup.description,
                        },
                    });

                /*
                 * Delete permissions that were removed.
                 *
                 * First delete RolePermission records
                 * referencing those permissions.
                 */

                if (permissionsToDelete.length > 0) {
                    const permissionIds =
                        permissionsToDelete.map(
                            (permission) => permission.id,
                        );

                    await tx.rolePermission.deleteMany({
                        where: {
                            permissionId: {
                                in: permissionIds,
                            },
                        },
                    });

                    await tx.permission.deleteMany({
                        where: {
                            id: {
                                in: permissionIds,
                            },
                        },
                    });
                }

                /*
                 * Create newly added permissions.
                 */

                if (actionsToAdd.length > 0) {
                    await tx.permission.createMany({
                        data: actionsToAdd.map((action) => ({
                            name: `${existingGroup.key}:${action}`,
                            action,
                            permissionGroupId: id,
                        })),
                    });
                }

                /*
                 * Return the final state.
                 */

                return tx.permissionGroup.findUnique({
                    where: {
                        id: updatedGroup.id,
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
                });
            },
        );
    }




    async findOnePermissionGroup(id: number) {
        const permissionGroup =
            await this.databaseService.permissionGroup.findUnique({
                where: {
                    id,
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
            });

        if (!permissionGroup) {
            throw new NotFoundException(
                `Permission group with ID ${id} was not found.`,
            );
        }

        console.log({ permissionGroup });

        return {
            id: permissionGroup.id,
            name: permissionGroup.name,
            key: permissionGroup.key,
            description: permissionGroup.description,

            permissions: permissionGroup.permissions,

            permissionCount:
                permissionGroup._count.permissions,

            createdAt: permissionGroup.createdAt,
            updatedAt: permissionGroup.updatedAt,
        };
    }




    async removePermissionGroup(id: number) {
        const existingGroup =
            await this.databaseService.permissionGroup.findUnique({
                where: {
                    id,
                },
                include: {
                    permissions: {
                        select: {
                            id: true,
                        },
                    },
                },
            });

        if (!existingGroup) {
            throw new NotFoundException(
                `Permission group with ID ${id} was not found.`,
            );
        }

        const permissionIds = existingGroup.permissions.map(
            (permission) => permission.id,
        );

        await this.databaseService.$transaction(
            async (tx) => {
                /*
                 * Step 1:
                 * Remove role-permission relationships.
                 */

                if (permissionIds.length > 0) {
                    await tx.rolePermission.deleteMany({
                        where: {
                            permissionId: {
                                in: permissionIds,
                            },
                        },
                    });
                }

                /*
                 * Step 2:
                 * Delete all permissions belonging to this group.
                 */

                await tx.permission.deleteMany({
                    where: {
                        permissionGroupId: id,
                    },
                });

                /*
                 * Step 3:
                 * Delete the permission group itself.
                 */

                await tx.permissionGroup.delete({
                    where: {
                        id,
                    },
                });
            },
        );

        return {
            message: 'Permission group deleted successfully',
        };
    }





}