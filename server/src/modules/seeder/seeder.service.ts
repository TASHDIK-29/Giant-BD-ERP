// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class SeederService {}


import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../../database/database.service.js';
import { Role } from '../../generated/prisma/browser.js';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class SeederService implements OnModuleInit {
    private readonly logger = new Logger(SeederService.name);

    constructor(
        private readonly databaseService: DatabaseService,
        private readonly configService: ConfigService
    ) { }

    async onModuleInit() {
        await this.seedSuperAdmin();
    }



    private async seedSuperAdmin() {
        try {
            const email = this.configService.get<string>('SUPER_ADMIN_EMAIL');
            const password = this.configService.get<string>('SUPER_ADMIN_PASSWORD');
            const name = this.configService.get<string>('SUPER_ADMIN_NAME');
            const saltRounds = Number(
                this.configService.get<string>('BCRYPT_SALT_ROUNDS') ?? 10,
            );


            if (!email || !password || !name) {
                throw new Error(
                    'SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, or SUPER_ADMIN_NAME is missing from environment variables.',
                );
            }

            if (
                Number.isNaN(saltRounds) ||
                saltRounds < 10
            ) {
                throw new Error(
                    'BCRYPT_SALT_ROUNDS must be a valid number greater than or equal to 10.',
                );
            }


            const existingSuperAdmin =
                await this.databaseService.user.findFirst({
                    where: {
                        role: Role.SUPER_ADMIN,
                    },
                });

            if (existingSuperAdmin) {
                this.logger.log(
                    `SUPER_ADMIN already exists (${existingSuperAdmin.email}). Skipping seed.`,
                );
                return;
            }


            const hashedPassword = await bcrypt.hash(password, saltRounds);


            const superAdmin = await this.databaseService.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    role: Role.SUPER_ADMIN,
                },
            });

            this.logger.log(
                `SUPER_ADMIN created successfully with email: ${superAdmin.email}`,
            );
        } catch (error) {
            this.logger.error(
                'Failed to seed SUPER_ADMIN',
                error instanceof Error ? error.stack : String(error),
            );


            throw error;
        }
    }
}