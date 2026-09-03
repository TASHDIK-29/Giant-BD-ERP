// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class SeederService {}


import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../../database/database.service.js';
import { Role } from '../../generated/prisma/browser.js';


@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async onModuleInit() {
    await this.seedSuperAdmin();
  }

  private async seedSuperAdmin() {
    const existingSuperAdmin = await this.databaseService.user.findFirst({
      where: {
        role: Role.SUPER_ADMIN,
      },
    });

    if (existingSuperAdmin) {
      this.logger.log('SUPER_ADMIN already exists. Skipping seed.');
      return;
    }

    const hashedPassword = await bcrypt.hash('super123', 10);

    await this.databaseService.user.create({
      data: {
        email: 'super@admin.com',
        password: hashedPassword,
        name: 'Super Admin',
        role: Role.SUPER_ADMIN,
      },
    });

    this.logger.log('SUPER_ADMIN created successfully.');
  }
}