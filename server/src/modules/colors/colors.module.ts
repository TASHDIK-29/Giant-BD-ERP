import { Module } from '@nestjs/common';
import { ColorsService } from './colors.service.js';
import { ColorsController } from './colors.controller.js';

@Module({
  providers: [ColorsService],
  controllers: [ColorsController]
})
export class ColorsModule {}
