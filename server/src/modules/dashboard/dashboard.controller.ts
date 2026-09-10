// src/dashboard/dashboard.controller.ts

import {
  Controller,
  Get,
} from '@nestjs/common';

import { DashboardService } from './dashboard.service.js';
import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';


@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

  @Get()
  @RequirePermission('dashboard:read')
  async getDashboard() {
    return this.dashboardService.getDashboard();
  }
}