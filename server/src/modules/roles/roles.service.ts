import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';



import { Prisma, Status } from '../../generated/prisma/client.js';

import { DatabaseService } from '../../database/database.service.js';

import { CreateRoleDto } from './dto/create-role.dto.js';

import { QueryRoleDto } from './dto/query-role.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';

@Injectable()
export class RolesService {
    constructor(
        private readonly databaseService: DatabaseService,
    ) { }




    private readonly criticalRolePermissions: string[] = [
        'role:update',
        'role:delete',
    ];



    private async preventSuperAdminLockout(
        roleId: number,
        newPermissionIds: number[],
    ) {
        const targetRole =
            await this.databaseService.role.findUnique({
                where: {
                    id: roleId,
                },

                select: {
                    id: true,
                    name: true,
                    status: true,
                    isSystem: true,
                },
            });

        if (!targetRole) {
            throw new NotFoundException(
                `Role with ID ${roleId} was not found.`,
            );
        }

        /*
         * Only protect the active SUPER_ADMIN
         * system role.
         */

        const isProtectedSuperAdmin =
            targetRole.isSystem &&
            targetRole.name === 'SUPER_ADMIN' &&
            targetRole.status === 'ACTIVE';

        if (!isProtectedSuperAdmin) {
            return;
        }

        /*
         * Fetch the permissions that would exist
         * after synchronization.
         */

        const permissions =
            await this.databaseService.permission.findMany({
                where: {
                    id: {
                        in: newPermissionIds,
                    },
                },

                select: {
                    permissionGroup: {
                        select: {
                            key: true,
                        },
                    },
                },
            });

        const newPermissionKeys =
            new Set(
                permissions.map(
                    (permission) => permission.permissionGroup.key,
                ),
            );

        /*
         * Determine whether critical permissions
         * would be removed.
         */

        const missingCriticalPermissions =
            this.criticalRolePermissions.filter(
                (permissionKey) =>
                    !newPermissionKeys.has(permissionKey),
            );

        if (missingCriticalPermissions.length > 0) {
            throw new BadRequestException(
                `Cannot remove critical permissions from the SUPER_ADMIN role: ${missingCriticalPermissions.join(', ')}`,
            );
        }
    }



    // private async preventSuperAdminLockout(
    //     roleId: number,
    //     newPermissionIds: number[],
    // ) {
    //     /*
    //      * Find the role being modified.
    //      */

    //     const targetRole =
    //         await this.databaseService.role.findUnique({
    //             where: {
    //                 id: roleId,
    //             },

    //             include: {
    //                 permissions: {
    //                     include: {
    //                         permission: true,
    //                     },
    //                 },

    //                 _count: {
    //                     select: {
    //                         users: true,
    //                     },
    //                 },
    //             },
    //         });

    //     if (!targetRole) {
    //         throw new NotFoundException(
    //             `Role with ID ${roleId} was not found.`,
    //         );
    //     }

    //     /*
    //      * Only apply this protection to
    //      * the SUPER_ADMIN system role.
    //      */

    //     const isSuperAdminRole =
    //         targetRole.isSystem &&
    //         targetRole.name === 'SUPER_ADMIN';

    //     if (!isSuperAdminRole) {
    //         return;
    //     }

    //     /*
    //      * Find all active SUPER_ADMIN roles.
    //      *
    //      * Currently, your system should only have
    //      * one protected SUPER_ADMIN role.
    //      *
    //      * We still write the logic defensively.
    //      */

    //     const activeSuperAdminRoles =
    //         await this.databaseService.role.findMany({
    //             where: {
    //                 name: 'SUPER_ADMIN',
    //                 status: 'ACTIVE',
    //             },

    //             include: {
    //                 permissions: {
    //                     include: {
    //                         permission: {
    //                             select: {
    //                                 id: true,
    //                                 key: true,
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //         });

    //     /*
    //      * Determine whether this is the last
    //      * active SUPER_ADMIN role.
    //      */

    //     if (activeSuperAdminRoles.length !== 1) {
    //         return;
    //     }

    //     /*
    //      * Fetch the permissions that will remain
    //      * after this update.
    //      */

    //     const newPermissions =
    //         await this.databaseService.permission.findMany({
    //             where: {
    //                 id: {
    //                     in: newPermissionIds,
    //                 },
    //             },

    //             select: {
    //                 id: true,
    //                 key: true,
    //             },
    //         });

    //     const newPermissionKeys =
    //         new Set<string>(
    //             newPermissions.map(
    //                 (permission) => permission.key,
    //             ),
    //         );

    //     /*
    //      * Check whether all critical permissions
    //      * will remain.
    //      */

    //     const missingCriticalPermissions =
    //         this.criticalRolePermissions.filter(
    //             (permissionKey) =>
    //                 !newPermissionKeys.has(permissionKey),
    //         );

    //     if (missingCriticalPermissions.length > 0) {
    //         throw new BadRequestException(
    //             `Cannot revoke critical permissions from the last active SUPER_ADMIN role: ${missingCriticalPermissions.join(', ')}`,
    //         );
    //     }
    // }




    async createRole(
        createRoleDto: CreateRoleDto,
    ) {
        const {
            name,
            description,
            permissionIds,
            grantAll,
        } = createRoleDto;

        /*
         * Normalize the role name.
         */

        const normalizedName = name.trim();

        /*
         * Prevent creating the protected
         * SUPER_ADMIN role through this endpoint.
         */

        if (
            normalizedName.toUpperCase() === 'SUPER_ADMIN'
        ) {
            throw new BadRequestException(
                'SUPER_ADMIN is a protected system role and cannot be created through this endpoint.',
            );
        }

        /*
         * Validate grantAll and permissionIds.
         */

        if (
            grantAll === true &&
            permissionIds !== undefined
        ) {
            throw new BadRequestException(
                'grantAll and permissionIds cannot be used together.',
            );
        }

        /*
         * Check whether the role already exists.
         *
         * We use case-insensitive checking to prevent:
         *
         * Manager
         * manager
         * MANAGER
         *
         * from being treated as different roles.
         */

        const existingRole =
            await this.databaseService.role.findFirst({
                where: {
                    name: {
                        equals: normalizedName,
                        mode: 'insensitive',
                    },
                },
            });

        if (existingRole) {
            throw new ConflictException(
                `Role "${normalizedName}" already exists.`,
            );
        }

        /*
         * Determine which permissions should
         * be assigned.
         */

        let finalPermissionIds: number[] = [];

        /*
         * Case 1: Grant all existing permissions.
         */

        if (grantAll === true) {
            const permissions =
                await this.databaseService.permission.findMany({
                    select: {
                        id: true,
                    },
                });

            finalPermissionIds = permissions.map(
                (permission) => permission.id,
            );
        }

        /*
         * Case 2: Selected permissions.
         */

        else if (permissionIds !== undefined) {
            const uniquePermissionIds = [
                ...new Set(permissionIds),
            ];

            const existingPermissions =
                await this.databaseService.permission.findMany({
                    where: {
                        id: {
                            in: uniquePermissionIds,
                        },
                    },
                    select: {
                        id: true,
                    },
                });

            /*
             * Ensure every requested permission exists.
             */

            if (
                existingPermissions.length !==
                uniquePermissionIds.length
            ) {
                const existingPermissionIds =
                    new Set(
                        existingPermissions.map(
                            (permission) => permission.id,
                        ),
                    );

                const invalidPermissionIds =
                    uniquePermissionIds.filter(
                        (id) =>
                            !existingPermissionIds.has(id),
                    );

                throw new BadRequestException(
                    `Invalid permission IDs: ${invalidPermissionIds.join(', ')}`,
                );
            }

            finalPermissionIds = uniquePermissionIds;
        }

        /*
         * Create the role and permission relationships
         * inside a transaction.
         */

        const role =
            await this.databaseService.$transaction(
                async (tx) => {
                    const createdRole =
                        await tx.role.create({
                            data: {
                                name: normalizedName,
                                description:
                                    description?.trim() || null,

                                isSystem: false,
                            },
                        });

                    /*
                     * Create RolePermission relationships.
                     */

                    if (finalPermissionIds.length > 0) {
                        await tx.rolePermission.createMany({
                            data: finalPermissionIds.map(
                                (permissionId) => ({
                                    roleId: createdRole.id,
                                    permissionId,
                                }),
                            ),
                        });
                    }

                    /*
                     * Return the complete role.
                     */

                    return tx.role.findUnique({
                        where: {
                            id: createdRole.id,
                        },
                        include: {
                            permissions: {
                                include: {
                                    permission: {
                                        include: {
                                            permissionGroup: true,
                                        },
                                    },
                                },
                            },
                            _count: {
                                select: {
                                    users: true,
                                    permissions: true,
                                },
                            },
                        },
                    });
                },
            );

        return role;
    }




    async findAllRoles(queryRoleDto: QueryRoleDto) {
        const {
            page = 1,
            limit = 10,
            search,
            status,
        } = queryRoleDto;

        const skip = (page - 1) * limit;

        const where: Prisma.RoleWhereInput = {};

        /*
         * Search by role name or description.
         */

        if (search?.trim()) {
            const searchTerm = search.trim();

            where.OR = [
                {
                    name: {
                        contains: searchTerm,
                        mode: 'insensitive',
                    },
                },
                {
                    description: {
                        contains: searchTerm,
                        mode: 'insensitive',
                    },
                },
            ];
        }

        /*
         * Filter by status.
         */

        if (status) {
            where.status = status;
        }

        /*
         * Fetch roles and total count simultaneously.
         */

        const [roles, total] =
            await this.databaseService.$transaction([
                this.databaseService.role.findMany({
                    where,
                    skip,
                    take: limit,

                    orderBy: [
                        {
                            isSystem: 'desc',
                        },
                        {
                            id: 'asc',
                        },
                    ],

                    include: {
                        _count: {
                            select: {
                                users: true,
                                permissions: true,
                            },
                        },
                    },
                }),

                this.databaseService.role.count({
                    where,
                }),
            ]);

        /*
         * Format the response.
         */

        const data = roles.map((role) => ({
            id: role.id,
            name: role.name,
            description: role.description,
            status: role.status,
            isSystem: role.isSystem,

            userCount: role._count.users,

            permissionCount:
                role._count.permissions,

            createdAt: role.createdAt,
            updatedAt: role.updatedAt,
        }));

        return {
            data,

            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }




    async findOneRole(id: number) {
        const role =
            await this.databaseService.role.findUnique({
                where: {
                    id,
                },

                include: {
                    permissions: {
                        include: {
                            permission: {
                                include: {
                                    permissionGroup: true,
                                },
                            },
                        },

                        orderBy: {
                            permission: {
                                permissionGroup: {
                                    key: 'asc',
                                },
                            },
                        },
                    },

                    _count: {
                        select: {
                            users: true,
                            permissions: true,
                        },
                    },
                },
            });

        if (!role) {
            throw new NotFoundException(
                `Role with ID ${id} was not found.`,
            );
        }

        return {
            id: role.id,
            name: role.name,
            description: role.description,
            status: role.status,
            isSystem: role.isSystem,

            permissions: role.permissions.map(
                (rolePermission) => ({
                    id: rolePermission.permission.id,

                    key: rolePermission.permission.permissionGroup.key,

                    action: rolePermission.permission.action,

                    permissionGroup: {
                        id:
                            rolePermission.permission.permissionGroup.id,

                        name:
                            rolePermission.permission.permissionGroup.name,

                        key:
                            rolePermission.permission.permissionGroup.key,

                        description:
                            rolePermission.permission.permissionGroup.description,
                    },
                }),
            ),

            userCount: role._count.users,

            permissionCount:
                role._count.permissions,

            createdAt: role.createdAt,
            updatedAt: role.updatedAt,
        };
    }



    async updateRole(
        id: number,
        updateRoleDto: UpdateRoleDto,
    ) {
        const {
            name,
            description,
            status,
            permissionIds,
            grantAll,
        } = updateRoleDto;

        /*
         * Find the role first.
         */

        const existingRole =
            await this.databaseService.role.findUnique({
                where: {
                    id,
                },
            });

        if (!existingRole) {
            throw new NotFoundException(
                `Role with ID ${id} was not found.`,
            );
        }

        /*
         * Prevent modification of protected
         * system role identity/status.
         */

        if (existingRole.isSystem) {
            if (name !== undefined) {
                throw new BadRequestException(
                    'System role name cannot be changed.',
                );
            }

            if (status !== undefined) {
                throw new BadRequestException(
                    'System role status cannot be changed.',
                );
            }
        }

        /*
         * Validate grantAll and permissionIds.
         */

        if (
            grantAll === true &&
            permissionIds !== undefined
        ) {
            throw new BadRequestException(
                'grantAll and permissionIds cannot be used together.',
            );
        }

        /*
         * Normalize role name.
         */

        const normalizedName =
            name !== undefined
                ? name.trim()
                : undefined;

        /*
         * Check duplicate role name.
         */

        if (
            normalizedName !== undefined &&
            normalizedName.toUpperCase() === 'SUPER_ADMIN' &&
            !existingRole.isSystem
        ) {
            throw new BadRequestException(
                'SUPER_ADMIN is a protected system role name.',
            );
        }

        if (
            normalizedName !== undefined &&
            normalizedName !== existingRole.name
        ) {
            const duplicateRole =
                await this.databaseService.role.findFirst({
                    where: {
                        name: {
                            equals: normalizedName,
                            mode: 'insensitive',
                        },
                        NOT: {
                            id,
                        },
                    },
                });

            if (duplicateRole) {
                throw new ConflictException(
                    `Role "${normalizedName}" already exists.`,
                );
            }
        }

        /*
         * Determine whether permissions need
         * synchronization.
         */

        let shouldSyncPermissions = false;
        let finalPermissionIds: number[] = [];

        if (grantAll === true) {
            shouldSyncPermissions = true;

            const permissions =
                await this.databaseService.permission.findMany({
                    select: {
                        id: true,
                    },
                });

            finalPermissionIds = permissions.map(
                (permission) => permission.id,
            );
        } else if (permissionIds !== undefined) {
            shouldSyncPermissions = true;

            finalPermissionIds = [
                ...new Set(permissionIds),
            ];

            /*
             * Verify that every permission exists.
             */

            const existingPermissions =
                await this.databaseService.permission.findMany({
                    where: {
                        id: {
                            in: finalPermissionIds,
                        },
                    },
                    select: {
                        id: true,
                    },
                });

            if (
                existingPermissions.length !==
                finalPermissionIds.length
            ) {
                const existingPermissionIds =
                    new Set(
                        existingPermissions.map(
                            (permission) => permission.id,
                        ),
                    );

                const invalidPermissionIds =
                    finalPermissionIds.filter(
                        (permissionId) =>
                            !existingPermissionIds.has(
                                permissionId,
                            ),
                    );

                throw new BadRequestException(
                    `Invalid permission IDs: ${invalidPermissionIds.join(', ')}`,
                );
            }
        }


        if (shouldSyncPermissions) {
            await this.preventSuperAdminLockout(
                id,
                finalPermissionIds,
            );
        }

        /*
         * Perform role update and permission
         * synchronization inside one transaction.
         */

        const updatedRole =
            await this.databaseService.$transaction(
                async (tx) => {
                    /*
                     * Update role fields only when
                     * they are actually provided.
                     */

                    const role =
                        await tx.role.update({
                            where: {
                                id,
                            },

                            data: {
                                ...(normalizedName !== undefined && {
                                    name: normalizedName,
                                }),

                                ...(description !== undefined && {
                                    description:
                                        description.trim() || null,
                                }),

                                ...(status !== undefined && {
                                    status,
                                }),
                            },
                        });

                    /*
                     * Synchronize permissions.
                     *
                     * Delete all existing relationships
                     * and recreate the requested set.
                     */

                    if (shouldSyncPermissions) {
                        await tx.rolePermission.deleteMany({
                            where: {
                                roleId: id,
                            },
                        });

                        if (finalPermissionIds.length > 0) {
                            await tx.rolePermission.createMany({
                                data: finalPermissionIds.map(
                                    (permissionId) => ({
                                        roleId: id,
                                        permissionId,
                                    }),
                                ),
                            });
                        }
                    }

                    /*
                     * Return the complete updated role.
                     */

                    return tx.role.findUnique({
                        where: {
                            id,
                        },

                        include: {
                            permissions: {
                                include: {
                                    permission: {
                                        include: {
                                            permissionGroup: true,
                                        },
                                    },
                                },

                                orderBy: {
                                    permission: {
                                        permissionGroup: {
                                            key: 'asc',
                                        },
                                    },
                                },
                            },

                            _count: {
                                select: {
                                    users: true,
                                    permissions: true,
                                },
                            },
                        },
                    });
                },
            );

        return {
            id: updatedRole!.id,
            name: updatedRole!.name,
            description: updatedRole!.description,
            status: updatedRole!.status,
            isSystem: updatedRole!.isSystem,

            permissions:
                updatedRole!.permissions.map(
                    (rolePermission) => ({
                        id: rolePermission.permission.id,
                        key: rolePermission.permission.permissionGroup.key,
                        action:
                            rolePermission.permission.action,

                        permissionGroup: {
                            id:
                                rolePermission.permission
                                    .permissionGroup.id,

                            name:
                                rolePermission.permission
                                    .permissionGroup.name,

                            key:
                                rolePermission.permission
                                    .permissionGroup.key,

                            description:
                                rolePermission.permission
                                    .permissionGroup.description,
                        },
                    }),
                ),

            userCount:
                updatedRole!._count.users,

            permissionCount:
                updatedRole!._count.permissions,

            createdAt: updatedRole!.createdAt,
            updatedAt: updatedRole!.updatedAt,
        };
    }



    async remove(id: number) {
        const role = await this.databaseService.role.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                isSystem: true,
                _count: {
                    select: {
                        users: true,
                        permissions: true,
                    },
                },
            },
        });

        if (!role) {
            throw new NotFoundException(`Role with ID ${id} not found`);
        }

        if (role.isSystem) {
            throw new ConflictException(
                'System roles cannot be deleted',
            );
        }

        if (role._count.users > 0) {
            throw new ConflictException(
                `Role "${role.name}" cannot be deleted because it is assigned to ${role._count.users} user(s)`,
            );
        }

        try {
            await this.databaseService.$transaction(async (tx) => {
                await tx.role.delete({
                    where: { id },
                });
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2003'
            ) {
                throw new ConflictException(
                    `Role "${role.name}" cannot be deleted because it is still referenced by another record`,
                );
            }

            throw error;
        }

        return {
            message: `Role "${role.name}" deleted successfully`,
        };
    }



}