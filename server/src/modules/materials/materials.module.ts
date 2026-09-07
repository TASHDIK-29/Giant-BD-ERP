import { Module } from '@nestjs/common';
import { MaterialsService } from './materials.service.js';
import { MaterialsController } from './materials.controller.js';

@Module({
  providers: [MaterialsService],
  controllers: [MaterialsController]
})
export class MaterialsModule {}
