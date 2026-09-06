import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { DatabaseService } from '../../database/database.service.js';

import {
    IS_PUBLIC_KEY,
} from '../decorators/public.decorator.js';

import {
    REQUIRE_PERMISSION_KEY,
} from '../decorators/require-permission.decorator.js';


@Injectable()
export class PermissionGuard
    implements CanActivate
{
    constructor(
        private readonly reflector: Reflector,
        private readonly databaseService: DatabaseService,
    ) {}


    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {

        /*
         * Public routes bypass
         * permission checking.
         */
        const isPublic =
            this.reflector.getAllAndOverride<boolean>(
                IS_PUBLIC_KEY,
                [
                    context.getHandler(),
                    context.getClass(),
                ],
            );

        if (isPublic) {
            return true;
        }


        /*
         * Get required permissions.
         */
        const requiredPermissions =
            this.reflector.getAllAndOverride<string[]>(
                REQUIRE_PERMISSION_KEY,
                [
                    context.getHandler(),
                    context.getClass(),
                ],
            );


        /*
         * No permission requirement means
         * an authenticated user can access it.
         */
        if (
            !requiredPermissions ||
            requiredPermissions.length === 0
        ) {
            return true;
        }


        const request =
            context.switchToHttp().getRequest();

        const user = request.user;


        /*
         * This should normally be impossible
         * if JwtAuthGuard executes first.
         */
        if (!user?.id || !user?.roleId) {
            throw new ForbiddenException(
                'You do not have permission to access this resource.',
            );
        }


        /*
         * Fetch the latest role permissions.
         *
         * Role
         *   ↓
         * RolePermission
         *   ↓
         * Permission
         */
        const role =
            await this.databaseService.role.findUnique({
                where: {
                    id: user.roleId,
                },

                select: {
                    status: true,

                    permissions: {
                        select: {
                            permission: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                },
            });


        if (
            !role ||
            role.status !== 'ACTIVE'
        ) {
            throw new ForbiddenException(
                'Your role is inactive or unavailable.',
            );
        }


        const userPermissions =
            new Set(
                role.permissions.map(
                    (rolePermission) =>
                        rolePermission.permission.name,
                ),
            );


        /*
         * ALL required permissions
         * are required.
         */
        const hasRequiredPermissions =
            requiredPermissions.every(
                (permissionName) =>
                    userPermissions.has(permissionName),
            );


        if (!hasRequiredPermissions) {
            throw new ForbiddenException(
                'You do not have permission to access this resource.',
            );
        }


        return true;
    }
}