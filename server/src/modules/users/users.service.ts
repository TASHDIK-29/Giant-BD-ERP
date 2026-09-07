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
}