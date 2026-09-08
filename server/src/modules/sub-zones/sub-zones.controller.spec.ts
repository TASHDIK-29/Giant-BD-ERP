import { Test, TestingModule } from '@nestjs/testing';
import { SubZonesController } from './sub-zones.controller.js';

describe('SubZonesController', () => {
  let controller: SubZonesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubZonesController],
    }).compile();

    controller = module.get<SubZonesController>(SubZonesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
