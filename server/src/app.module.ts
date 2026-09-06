import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database/database.module.js';
import { SeederModule } from './modules/seeder/seeder.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { MailModule } from './modules/mail/mail.module.js';
import { PermissionsModule } from './modules/permissions/permissions.module.js';
import { RolesModule } from './modules/roles/roles.module.js';

import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard.js';
import { PermissionGuard } from './common/guards/permission.guard.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    SeederModule,
    AuthModule,
    MailModule,
    PermissionsModule,
    RolesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class AppModule {}