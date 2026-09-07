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


import { Prisma } from '../../generated/prisma/client.js';

import { QueryUsersDto } from './dto/query-users.dto.js';


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







}