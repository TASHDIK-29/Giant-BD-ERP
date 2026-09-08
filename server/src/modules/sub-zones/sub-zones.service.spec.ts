import { Test, TestingModule } from '@nestjs/testing';
import { SubZonesService } from './sub-zones.service.js';

describe('SubZonesService', () => {
  let service: SubZonesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubZonesService],
    }).compile();

    service = module.get<SubZonesService>(SubZonesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
