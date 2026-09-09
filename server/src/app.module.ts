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
import { UsersModule } from './modules/users/users.module.js';
import { CategoriesModule } from './modules/categories/categories.module.js';
import { MaterialsModule } from './modules/materials/materials.module.js';
import { ColorsModule } from './modules/colors/colors.module.js';
import { ProductsModule } from './modules/products/products.module.js';
import { WarehousesModule } from './modules/warehouses/warehouses.module.js';
import { ZonesModule } from './modules/zones/zones.module.js';
import { SubZonesModule } from './modules/sub-zones/sub-zones.module.js';
import { RacksModule } from './modules/racks/racks.module.js';
import { BuyersModule } from './modules/buyers/buyers.module.js';
import { StockInModule } from './modules/stock-in/stock-in.module.js';
import { StockOutModule } from './modules/stock-out/stock-out.module.js';

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
    UsersModule,
    CategoriesModule,
    MaterialsModule,
    ColorsModule,
    ProductsModule,
    WarehousesModule,
    ZonesModule,
    SubZonesModule,
    RacksModule,
    BuyersModule,
    StockInModule,
    StockOutModule,
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