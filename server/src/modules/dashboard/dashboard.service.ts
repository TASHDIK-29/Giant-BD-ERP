// src/dashboard/dashboard.service.ts

import {
    Injectable,
    BadRequestException,
} from '@nestjs/common';

import {
    Gender,
    Prisma,
    StockOutStatus,
} from '../../generated/prisma/client.js';

import { DatabaseService } from '../../database/database.service.js';

@Injectable()
export class DashboardService {
    constructor(
        private readonly databaseService: DatabaseService,
    ) { }

    /**
     * Returns the complete dashboard data.
     */
    async getDashboard() {
        const [
            stockMovementLast30Days,
            batches,
            stockInByMasterProduct,
            variantsPerMasterProduct,
            stockOutStatus,
            totals,
        ] = await Promise.all([
            this.getStockMovementLast30Days(),
            this.getBatchCounts(),
            this.getStockInByMasterProduct(),
            this.getVariantsPerMasterProduct(),
            this.getStockOutStatus(),
            this.getTotals(),
        ]);

        return {
            stockMovementLast30Days,
            batches,
            stockInByMasterProduct,
            variantsPerMasterProduct,
            stockOutStatus,
            totals,
        };
    }

    // ---------------------------------------------------------------------------
    // 1. Stock In / Stock Out for the last 30 days
    // ---------------------------------------------------------------------------

    private async getStockMovementLast30Days() {
        const { start, end } = this.getLast30DaysRange();

        const [stockIns, stockOuts] = await Promise.all([
            this.databaseService.stockIn.findMany({
                where: {
                    stockInDate: {
                        gte: start,
                        lt: end,
                    },
                },
                select: {
                    stockInDate: true,
                    totalQuantity: true,
                },
                orderBy: {
                    stockInDate: 'asc',
                },
            }),

            this.databaseService.stockOut.findMany({
                where: {
                    requestDate: {
                        gte: start,
                        lt: end,
                    },
                },
                select: {
                    requestDate: true,
                    items: {
                        select: {
                            quantity: true,
                        },
                    },
                },
                orderBy: {
                    requestDate: 'asc',
                },
            }),
        ]);

        const days = this.createLast30Days();

        const stockInMap = new Map<string, number>();
        const stockOutMap = new Map<string, number>();

        // Aggregate Stock In by Bangladesh date.
        for (const stockIn of stockIns) {
            const dateKey = this.getDhakaDateKey(stockIn.stockInDate);

            stockInMap.set(
                dateKey,
                (stockInMap.get(dateKey) ?? 0) +
                stockIn.totalQuantity,
            );
        }

        // Aggregate Stock Out by Bangladesh date.
        for (const stockOut of stockOuts) {
            const dateKey = this.getDhakaDateKey(
                stockOut.requestDate,
            );

            const quantity = stockOut.items.reduce(
                (total, item) => total + item.quantity,
                0,
            );

            stockOutMap.set(
                dateKey,
                (stockOutMap.get(dateKey) ?? 0) + quantity,
            );
        }

        return days.map((date) => {
            const dateKey = this.formatDate(date);

            return {
                date: dateKey,
                stockIn: stockInMap.get(dateKey) ?? 0,
                stockOut: stockOutMap.get(dateKey) ?? 0,
            };
        });
    }

    // ---------------------------------------------------------------------------
    // 2. Batch count: Today / Yesterday / This Week / This Month
    // ---------------------------------------------------------------------------

    private async getBatchCounts() {
        const now = new Date();

        const todayStart = this.getDhakaDayStart(now);

        const tomorrowStart = new Date(todayStart);
        tomorrowStart.setUTCDate(
            tomorrowStart.getUTCDate() + 1,
        );

        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setUTCDate(
            yesterdayStart.getUTCDate() - 1,
        );

        const weekStart = this.getDhakaWeekStart(now);
        const monthStart = this.getDhakaMonthStart(now);

        const [
            today,
            yesterday,
            thisWeek,
            thisMonth,
        ] = await Promise.all([
            this.databaseService.stockIn.count({
                where: {
                    stockInDate: {
                        gte: todayStart,
                        lt: tomorrowStart,
                    },
                },
            }),

            this.databaseService.stockIn.count({
                where: {
                    stockInDate: {
                        gte: yesterdayStart,
                        lt: todayStart,
                    },
                },
            }),

            this.databaseService.stockIn.count({
                where: {
                    stockInDate: {
                        gte: weekStart,
                        lt: tomorrowStart,
                    },
                },
            }),

            this.databaseService.stockIn.count({
                where: {
                    stockInDate: {
                        gte: monthStart,
                        lt: tomorrowStart,
                    },
                },
            }),
        ]);

        return {
            today,
            yesterday,
            thisWeek,
            thisMonth,
        };
    }

    // ---------------------------------------------------------------------------
    // 3. Stock In -> Master Product
    // ---------------------------------------------------------------------------

    private async getStockInByMasterProduct() {
        const grouped = await this.databaseService.stockIn.groupBy({
            by: ['masterProductId'],
            _sum: {
                totalQuantity: true,
            },
            orderBy: {
                masterProductId: 'asc',
            },
        });

        if (grouped.length === 0) {
            return [];
        }

        const masterProductIds = grouped.map(
            (item) => item.masterProductId,
        );

        const masterProducts =
            await this.databaseService.masterProduct.findMany({
                where: {
                    id: {
                        in: masterProductIds,
                    },
                },
                select: {
                    id: true,
                    name: true,
                    sku: true,
                },
            });

        const masterProductMap = new Map(
            masterProducts.map((product) => [
                product.id,
                product,
            ]),
        );

        return grouped
            .map((item) => {
                const masterProduct = masterProductMap.get(
                    item.masterProductId,
                );

                if (!masterProduct) {
                    return null;
                }

                return {
                    masterProductId: masterProduct.id,
                    masterProductName: masterProduct.name,
                    masterProductSku: masterProduct.sku,
                    quantity: item._sum.totalQuantity ?? 0,
                };
            })
            .filter(
                (
                    item,
                ): item is NonNullable<typeof item> =>
                    item !== null,
            );
    }

    // ---------------------------------------------------------------------------
    // 4. Variants per Master Product
    // ---------------------------------------------------------------------------

    private async getVariantsPerMasterProduct() {
        const grouped =
            await this.databaseService.productVariant.groupBy({
                by: ['masterProductId'],
                _count: {
                    id: true,
                },
                orderBy: {
                    masterProductId: 'asc',
                },
            });

        if (grouped.length === 0) {
            return [];
        }

        const masterProductIds = grouped.map(
            (item) => item.masterProductId,
        );

        const masterProducts =
            await this.databaseService.masterProduct.findMany({
                where: {
                    id: {
                        in: masterProductIds,
                    },
                },
                select: {
                    id: true,
                    name: true,
                    sku: true,
                },
            });

        const masterProductMap = new Map(
            masterProducts.map((product) => [
                product.id,
                product,
            ]),
        );

        return grouped
            .map((item) => {
                const masterProduct = masterProductMap.get(
                    item.masterProductId,
                );

                if (!masterProduct) {
                    return null;
                }

                return {
                    masterProductId: masterProduct.id,
                    masterProductName: masterProduct.name,
                    masterProductSku: masterProduct.sku,
                    variantCount: item._count.id,
                };
            })
            .filter(
                (
                    item,
                ): item is NonNullable<typeof item> =>
                    item !== null,
            );
    }

    // ---------------------------------------------------------------------------
    // 5. Stock Out -> Issued / Delivered / Received
    // ---------------------------------------------------------------------------

    private async getStockOutStatus() {
        const grouped =
            await this.databaseService.stockOut.groupBy({
                by: ['status'],
                _count: {
                    id: true,
                },
            });

        return {
            issued:
                grouped.find(
                    (item) =>
                        item.status === StockOutStatus.ISSUED,
                )?._count.id ?? 0,

            delivered:
                grouped.find(
                    (item) =>
                        item.status === StockOutStatus.DELIVERED,
                )?._count.id ?? 0,

            received:
                grouped.find(
                    (item) =>
                        item.status === StockOutStatus.RECEIVED,
                )?._count.id ?? 0,
        };
    }

    // ---------------------------------------------------------------------------
    // 6. Total Master Products / Variants / Colors / Materials
    // ---------------------------------------------------------------------------

    private async getTotals() {
        const [
            masterProducts,
            variants,
            colors,
            materials,
        ] = await Promise.all([
            this.databaseService.masterProduct.count(),

            this.databaseService.productVariant.count(),

            this.databaseService.color.count(),

            this.databaseService.material.count(),
        ]);

        return {
            masterProducts,
            variants,
            colors,
            materials,
        };
    }

    // ---------------------------------------------------------------------------
    // Date helpers
    // ---------------------------------------------------------------------------

    /**
     * Returns the last 30 calendar days including today.
     *
     * Example:
     * today = Sep 10
     *
     * returns:
     * Aug 12 -> Sep 10
     *
     * All boundaries are calculated for Asia/Dhaka (UTC+06:00).
     */

    private createLast30Days(): Date[] {
        const today = this.getDhakaDayStart(
            new Date(),
        );

        const days: Date[] = [];

        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);

            date.setUTCDate(
                date.getUTCDate() - i,
            );

            days.push(date);
        }

        return days;
    }

    private getLast30DaysRange() {
        const today = this.getDhakaDayStart(
            new Date(),
        );

        const start = new Date(today);

        start.setUTCDate(
            start.getUTCDate() - 29,
        );

        const end = new Date(today);

        end.setUTCDate(
            end.getUTCDate() + 1,
        );

        return {
            start,
            end,
        };
    }

    /**
     * Gets midnight in Asia/Dhaka represented as a UTC Date.
     *
     * Bangladesh is UTC+06:00.
     */
    private getDhakaDayStart(date: Date): Date {
        const dhakaDate = new Date(
            date.getTime() + 6 * 60 * 60 * 1000,
        );

        const year = dhakaDate.getUTCFullYear();
        const month = dhakaDate.getUTCMonth();
        const day = dhakaDate.getUTCDate();

        return new Date(
            Date.UTC(
                year,
                month,
                day,
                -6,
                0,
                0,
                0,
            ),
        );
    }

    private getDhakaWeekStart(date: Date): Date {
        const dayStart =
            this.getDhakaDayStart(date);

        const dhakaDate = new Date(
            dayStart.getTime() +
            6 * 60 * 60 * 1000,
        );

        const day = dhakaDate.getUTCDay();

        // Sunday = 0.
        // Week starts on Sunday.
        const weekStart = new Date(dayStart);

        weekStart.setUTCDate(
            weekStart.getUTCDate() - day,
        );

        return weekStart;
    }

    private getDhakaMonthStart(date: Date): Date {
        const dhakaDate = new Date(
            date.getTime() +
            6 * 60 * 60 * 1000,
        );

        const year = dhakaDate.getUTCFullYear();
        const month = dhakaDate.getUTCMonth();

        return new Date(
            Date.UTC(
                year,
                month,
                1,
                -6,
                0,
                0,
                0,
            ),
        );
    }

    private getDhakaDateKey(date: Date): string {
        const dhakaDate = new Date(
            date.getTime() +
            6 * 60 * 60 * 1000,
        );

        return this.formatDate(dhakaDate);
    }

    private formatDate(date: Date): string {
        const year = date.getUTCFullYear();

        const month = String(
            date.getUTCMonth() + 1,
        ).padStart(2, '0');

        const day = String(
            date.getUTCDate(),
        ).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }
}