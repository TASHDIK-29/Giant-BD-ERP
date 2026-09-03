import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service.js';

@Module({
  providers: [SeederService]
})
export class SeederModule {}
