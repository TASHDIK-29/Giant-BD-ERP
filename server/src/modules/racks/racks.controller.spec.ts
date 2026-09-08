import { Test, TestingModule } from '@nestjs/testing';
import { RacksController } from './racks.controller.js';

describe('RacksController', () => {
  let controller: RacksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RacksController],
    }).compile();

    controller = module.get<RacksController>(RacksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
