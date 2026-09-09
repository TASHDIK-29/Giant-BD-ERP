import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../database/database.service.js';

import { AvailableInventoryQueryDto } from './dto/available-inventory-query.dto.js';

@Injectable()
export class StockOutService {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async getAvailableInventory(
    query: AvailableInventoryQueryDto,
  ) {
    /*
     * Implementation will be completed
     * in the Available Inventory step.
     */

    return {
      message: 'Available inventory endpoint is under development.',
      query,
    };
  }
}