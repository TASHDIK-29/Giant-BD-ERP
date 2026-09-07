import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { ConfigService } from '@nestjs/config';

import { DatabaseService } from '../../database/database.service.js';

import { CreateUserDto } from './dto/create-user.dto.js';


import { Prisma, Status } from '../../generated/prisma/client.js';

import { QueryUsersDto } from './dto/query-users.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';


@Injectable()
export class UsersService {

    constructor(
        private readonly databaseService: DatabaseService,
        private readonly configService: ConfigService,
    ) { }


    async create(
        createUserDto: CreateUserDto,
    ) {

        const {
            name,
            email,
            password,
            phone,
            gender,
            avatar,
            signature,
            roleId,
        } = createUserDto;


        /*
         * Normalize email.
         */
        const normalizedEmail =
            email.trim().toLowerCase();


        /*
         * Check whether the email already exists.
         */
        const existingUser =
            await this.databaseService.user.findUnique({
                where: {
                    email: normalizedEmail,
                },

                select: {
                    id: true,
                },
            });


        if (existingUser) {
            throw new ConflictException(
                'A user with this email already exists.',
            );
        }


        /*
         * Validate the assigned role.
         */
        const role =
            await this.databaseService.role.findUnique({
                where: {
                    id: roleId,
                },

                select: {
                    id: true,
                    status: true,
                    name: true,
                },
            });


        if (!role) {
            throw new NotFoundException(
                'Role not found.',
            );
        }


        if (role.name === 'SUPER_ADMIN') {
            throw new BadRequestException(
                'Cannot assign the SUPER_ADMIN role to a user.',
            );
        }


        /*
         * Prevent assigning an inactive role.
         */
        if (role.status !== 'ACTIVE') {
            throw new BadRequestException(
                'Cannot assign an inactive role to a user.',
            );
        }


        /*
         * Get bcrypt salt rounds.
         */
        const saltRounds =
            Number(
                this.configService.get<string>(
                    'BCRYPT_SALT_ROUNDS',
                ) ?? 10,
            );


        if (
            Number.isNaN(saltRounds) ||
            saltRounds < 10
        ) {
            throw new BadRequestException(
                'Invalid BCRYPT_SALT_ROUNDS configuration.',
            );
        }


        /*
         * Hash the password.
         */
        const hashedPassword =
            await bcrypt.hash(
                password,
                saltRounds,
            );


        /*
         * Create the user.
         */
        const user =
            await this.databaseService.user.create({
                data: {
                    name: name.trim(),
                    email: normalizedEmail,
                    password: hashedPassword,
                    phone,
                    gender,
                    avatar,
                    signature,
                    roleId,
                },

                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    gender: true,
                    avatar: true,
                    signature: true,
                    status: true,
                    roleId: true,

                    role: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },

                    createdAt: true,
                },
            });


        return {
            message: 'User created successfully.',
            user,
        };
    }




    async findAll(queryUsersDto: QueryUsersDto) {
        const {
            page = 1,
            limit = 10,
            search,
            roleId,
            status,
        } = queryUsersDto;

        const skip = (page - 1) * limit;

        const where: Prisma.UserWhereInput = {
            ...(roleId && {
                roleId,
            }),

            ...(status && {
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
                        email: {
                            contains: search.trim(),
                            mode: 'insensitive',
                        },
                    },
                ],
            }),
        };

        const [users, total] =
            await this.databaseService.$transaction([
                this.databaseService.user.findMany({
                    where,
                    skip,
                    take: limit,

                    orderBy: {
                        createdAt: 'desc',
                    },

                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        gender: true,
                        avatar: true,
                        signature: true,
                        status: true,
                        roleId: true,

                        role: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                status: true,
                            },
                        },

                        createdAt: true,
                        updatedAt: true,
                    },
                }),

                this.databaseService.user.count({
                    where,
                }),
            ]);

        return {
            data: users,

            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }




    async findOne(id: number) {
        const user =
            await this.databaseService.user.findUnique({
                where: {
                    id,
                },

                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    gender: true,
                    avatar: true,
                    signature: true,
                    status: true,
                    roleId: true,

                    role: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            status: true,

                            permissions: {
                                select: {
                                    permission: {
                                        select: {
                                            id: true,
                                            name: true,
                                            action: true,

                                            permissionGroup: {
                                                select: {
                                                    id: true,
                                                    name: true,
                                                    key: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },

                    createdAt: true,
                    updatedAt: true,
                },
            });

        if (!user) {
            throw new NotFoundException(
                'User not found.',
            );
        }

        return user;
    }




    async update(
        id: number,
        updateUserDto: UpdateUserDto,
        currentUserId: number,
    ) {
        /*
         * Ensure the target user exists.
         */
        const existingUser =
            await this.databaseService.user.findUnique({
                where: {
                    id,
                },
                select: {
                    id: true,
                    email: true,
                    roleId: true,
                },
            });

        if (!existingUser) {
            throw new NotFoundException(
                'User not found.',
            );
        }


        const {
            name,
            email,
            phone,
            gender,
            avatar,
            signature,
            roleId,
        } = updateUserDto;


        /*
         * Prevent users from changing their own role.
         */
        if (
            currentUserId === id &&
            roleId !== undefined
            // roleId !== existingUser.roleId
        ) {
            throw new BadRequestException(
                'You cannot change your own role.',
            );
        }


        const data: Prisma.UserUpdateInput = {};


        /*
         * Update name.
         */
        if (name !== undefined) {
            data.name = name.trim();
        }


        /*
         * Update email.
         */
        if (email !== undefined) {
            const normalizedEmail =
                email.trim().toLowerCase();

            if (normalizedEmail !== existingUser.email) {
                const userWithSameEmail =
                    await this.databaseService.user.findUnique({
                        where: {
                            email: normalizedEmail,
                        },
                        select: {
                            id: true,
                        },
                    });

                if (
                    userWithSameEmail &&
                    userWithSameEmail.id !== id
                ) {
                    throw new ConflictException(
                        'A user with this email already exists.',
                    );
                }

                data.email = normalizedEmail;
            }
        }


        /*
         * Update role.
         */
        if (
            roleId !== undefined &&
            roleId !== existingUser.roleId
        ) {
            const role =
                await this.databaseService.role.findUnique({
                    where: {
                        id: roleId,
                    },
                    select: {
                        id: true,
                        status: true,
                    },
                });

            if (!role) {
                throw new NotFoundException(
                    'Role not found.',
                );
            }

            if (role.status !== 'ACTIVE') {
                throw new BadRequestException(
                    'Cannot assign an inactive role to a user.',
                );
            }

            /*
             * Prisma relation update.
             */
            data.role = {
                connect: {
                    id: roleId,
                },
            };
        }


        /*
         * Optional fields.
         */
        if (phone !== undefined) {
            data.phone = phone;
        }

        if (gender !== undefined) {
            data.gender = gender;
        }

        if (avatar !== undefined) {
            data.avatar = avatar;
        }

        if (signature !== undefined) {
            data.signature = signature;
        }


        /*
         * Update user.
         */
        const updatedUser =
            await this.databaseService.user.update({
                where: {
                    id,
                },
                data,

                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    gender: true,
                    avatar: true,
                    signature: true,
                    status: true,
                    roleId: true,

                    role: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            status: true,
                        },
                    },

                    updatedAt: true,
                },
            });


        return {
            message: 'User updated successfully.',
            user: updatedUser,
        };
    }



    async updateStatus(
        id: number,
        status: Status,
        currentUserId: number,
    ) {
        /*
         * Prevent users from changing
         * their own account status.
         */
        if (id === currentUserId) {
            throw new BadRequestException(
                'You cannot change your own account status.',
            );
        }


        const user =
            await this.databaseService.user.findUnique({
                where: {
                    id,
                },
                select: {
                    id: true,
                    status: true,
                },
            });


        if (!user) {
            throw new NotFoundException(
                'User not found.',
            );
        }


        /*
         * Optional optimization:
         * Don't perform an unnecessary update.
         */
        if (user.status === status) {
            return {
                message: `User is already ${status}.`,
            };
        }


        const updatedUser =
            await this.databaseService.user.update({
                where: {
                    id,
                },

                data: {
                    status,
                },

                select: {
                    id: true,
                    name: true,
                    email: true,
                    status: true,
                    roleId: true,

                    updatedAt: true,
                },
            });


        /*
         * Security:
         *
         * If the user becomes inactive,
         * revoke all existing refresh tokens.
         */
        if (status === 'INACTIVE') {
            await this.databaseService.refreshToken.updateMany({
                where: {
                    userId: id,
                    revokedAt: null,
                },

                data: {
                    revokedAt: new Date(),
                },
            });
        }


        return {
            message: 'User status updated successfully.',
            user: updatedUser,
        };
    }




    async remove(id: number, currentUserId: number) {


        if (id === currentUserId) {
            throw new BadRequestException(
                'You cannot delete your own account.',
            );
        }


        const user =
            await this.databaseService.user.findUnique({
                where: {
                    id,
                },
                select: {
                    id: true,
                    status: true,
                    roleId: true,

                    role: {
                        select: {
                            name: true,
                        },
                    },
                },
            });

        if (!user) {
            throw new NotFoundException('User not found.');
        }

        const isSuperAdmin = user.role.name === 'SUPER_ADMIN';


        if (isSuperAdmin) {
            throw new BadRequestException(
                'Cannot delete a SUPER_ADMIN user.',
            );
        }

        return await this.databaseService.user.delete({
            where: {
                id,
            },
            select: {
                id: true,
                name: true,
                email: true,
                status: true,
                roleId: true,
            },
        });


    }


}