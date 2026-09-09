import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

// import { RequirePermission } from '../common/decorators/require-permission.decorator.js';
// import { PermissionGuard } from '../common/guards/permission.guard.js';

import { CreateStockInDto } from './dto/create-stock-in.dto.js';
import { StockInService } from './stock-in.service.js';
import { PermissionGuard } from '../../common/guards/permission.guard.js';
import { RequirePermission } from '../../common/decorators/require-permission.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('stock-in')
// @UseGuards(JwtAuthGuard, PermissionGuard)
export class StockInController {
    constructor(
        private readonly stockInService: StockInService,
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @RequirePermission('stock-in:create')
    create(
        @Body() createStockInDto: CreateStockInDto,
        // @Req() request,
        @CurrentUser()
        user: {
            id: number;
            email: string;
            name: string;
            role: string;
            roleId: number
        },
    ) {
        const userInfo = {
            id: user.id,
            email: user.email,
            roleId: user.roleId
        };

        return this.stockInService.create(
            createStockInDto,
            userInfo,
        );
    }
}