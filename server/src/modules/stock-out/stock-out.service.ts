import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { randomUUID } from 'node:crypto';

import {
  Gender,
  Prisma,
  Status,
} from '../../generated/prisma/client.js';

import { DatabaseService } from '../../database/database.service.js';

import { CreateStockOutDto } from './dto/create-stock-out.dto.js';

@Injectable()
export class StockOutService {
  constructor(
    private readonly databaseService: DatabaseService,
  ) { }

  async create(
    createStockOutDto: CreateStockOutDto,
    createdById: number,
  ) {
    const {
      buyerId,
      letterOfCreditId,
      purchaseOrderId,
      masterProductId,
      colorId,
      gender,
      requestDate,
      stockOutDate,
      items,
    } = createStockOutDto;

    if (!items || items.length === 0) {
      throw new BadRequestException(
        'At least one stock out item is required.',
      );
    }

    /**
     * Prevent the same batch + variant from appearing
     * more than once in the same Stock Out request.
     */
    const itemKeys = items.map(
      (item) => `${item.batchId}:${item.productVariantId}`,
    );

    const uniqueItemKeys = new Set(itemKeys);

    if (uniqueItemKeys.size !== items.length) {
      throw new BadRequestException(
        'Duplicate batch and product variant combinations are not allowed.',
      );
    }

    /**
     * Validate dates.
     */
    const requestDateValue = new Date(requestDate);

    if (Number.isNaN(requestDateValue.getTime())) {
      throw new BadRequestException(
        'Invalid request date.',
      );
    }

    let stockOutDateValue: Date | undefined;

    if (stockOutDate) {
      stockOutDateValue = new Date(stockOutDate);

      if (Number.isNaN(stockOutDateValue.getTime())) {
        throw new BadRequestException(
          'Invalid stock out date.',
        );
      }
    }

    if (
      stockOutDateValue &&
      stockOutDateValue < requestDateValue
    ) {
      throw new BadRequestException(
        'Stock out date cannot be earlier than request date.',
      );
    }

    return this.databaseService.$transaction(
      async (tx) => {
        /**
         * --------------------------------------------------
         * 1. Validate Buyer
         * --------------------------------------------------
         */
        const buyer = await tx.buyer.findUnique({
          where: {
            id: buyerId,
          },
          select: {
            id: true,
            status: true,
          },
        });

        if (!buyer) {
          throw new NotFoundException(
            'Buyer not found.',
          );
        }

        if (buyer.status !== Status.ACTIVE) {
          throw new BadRequestException(
            'Selected buyer is inactive.',
          );
        }

        /**
         * --------------------------------------------------
         * 2. Validate LC
         * --------------------------------------------------
         */
        const letterOfCredit =
          await tx.letterOfCredit.findUnique({
            where: {
              id: letterOfCreditId,
            },
            select: {
              id: true,
              buyerId: true,
            },
          });

        if (!letterOfCredit) {
          throw new NotFoundException(
            'Letter of Credit not found.',
          );
        }

        if (letterOfCredit.buyerId !== buyerId) {
          throw new BadRequestException(
            'The selected Letter of Credit does not belong to the selected buyer.',
          );
        }

        /**
         * --------------------------------------------------
         * 3. Validate Purchase Order
         * --------------------------------------------------
         */
        const purchaseOrder =
          await tx.purchaseOrder.findUnique({
            where: {
              id: purchaseOrderId,
            },
            select: {
              id: true,
              letterOfCreditId: true,
            },
          });

        if (!purchaseOrder) {
          throw new NotFoundException(
            'Purchase Order not found.',
          );
        }

        if (
          purchaseOrder.letterOfCreditId !==
          letterOfCreditId
        ) {
          throw new BadRequestException(
            'The selected Purchase Order does not belong to the selected Letter of Credit.',
          );
        }

        /**
         * --------------------------------------------------
         * 4. Validate Master Product
         * --------------------------------------------------
         */
        const masterProduct =
          await tx.masterProduct.findUnique({
            where: {
              id: masterProductId,
            },
            select: {
              id: true,
              status: true,
            },
          });

        if (!masterProduct) {
          throw new NotFoundException(
            'Master product not found.',
          );
        }

        if (
          masterProduct.status !== Status.ACTIVE
        ) {
          throw new BadRequestException(
            'Selected master product is inactive.',
          );
        }

        /**
         * --------------------------------------------------
         * 5. Validate Color
         * --------------------------------------------------
         */
        const color = await tx.color.findUnique({
          where: {
            id: colorId,
          },
          select: {
            id: true,
            // status: true,
          },
        });

        if (!color) {
          throw new NotFoundException(
            'Color not found.',
          );
        }

        // if (color.status !== Status.ACTIVE) {
        //   throw new BadRequestException(
        //     'Selected color is inactive.',
        //   );
        // }

        /**
         * --------------------------------------------------
         * 6. Validate Product Variants
         * --------------------------------------------------
         */
        const productVariantIds = [
          ...new Set(
            items.map(
              (item) => item.productVariantId,
            ),
          ),
        ];

        const productVariants =
          await tx.productVariant.findMany({
            where: {
              id: {
                in: productVariantIds,
              },
            },
            select: {
              id: true,
              masterProductId: true,
              colorId: true,
              gender: true,
              status: true,
              size: true,
              sku: true,
            },
          });

        if (
          productVariants.length !==
          productVariantIds.length
        ) {
          throw new NotFoundException(
            'One or more product variants were not found.',
          );
        }

        const variantMap = new Map(
          productVariants.map((variant) => [
            variant.id,
            variant,
          ]),
        );

        for (const item of items) {
          const variant = variantMap.get(
            item.productVariantId,
          );

          if (!variant) {
            throw new NotFoundException(
              `Product variant ${item.productVariantId} not found.`,
            );
          }

          if (
            variant.masterProductId !==
            masterProductId
          ) {
            throw new BadRequestException(
              `Product variant ${item.productVariantId} does not belong to the selected master product.`,
            );
          }

          if (variant.colorId !== colorId) {
            throw new BadRequestException(
              `Product variant ${item.productVariantId} does not belong to the selected color.`,
            );
          }

          if (variant.gender !== gender) {
            throw new BadRequestException(
              `Product variant ${item.productVariantId} does not belong to the selected gender.`,
            );
          }

          if (variant.status !== Status.ACTIVE) {
            throw new BadRequestException(
              `Product variant ${item.productVariantId} is inactive.`,
            );
          }
        }

        /**
         * --------------------------------------------------
         * 7. Validate StockInItems and availability
         * --------------------------------------------------
         */
        const validatedItems: Array<{
          batchId: string;
          productVariantId: number;
          quantity: number;
          stockInItemId: number;
          availableQuantity: number;
          warehouseId: number;
          zoneId: number;
          subZoneId: number;
          rackId: number;
        }> = [];

        for (const item of items) {
          /**
           * A batchId identifies a StockIn.
           * Then productVariantId identifies the
           * StockInItem inside that batch.
           */
          const stockInItem =
            await tx.stockInItem.findFirst({
              where: {
                productVariantId:
                  item.productVariantId,
                stockIn: {
                  batchId: item.batchId,
                },
              },
              select: {
                id: true,
                quantity: true,
                productVariantId: true,
                warehouseId: true,
                zoneId: true,
                subZoneId: true,
                rackId: true,
                stockIn: {
                  select: {
                    batchId: true,
                    masterProductId: true,
                    colorId: true,
                    gender: true,
                  },
                },
              },
            });

          if (!stockInItem) {
            throw new NotFoundException(
              `No stock was found for batch ${item.batchId} and product variant ${item.productVariantId}.`,
            );
          }

          /**
           * Make sure the batch belongs to the
           * selected product.
           */
          if (
            stockInItem.stockIn.masterProductId !==
            masterProductId
          ) {
            throw new BadRequestException(
              `Batch ${item.batchId} does not belong to the selected master product.`,
            );
          }

          if (
            stockInItem.stockIn.colorId !== colorId
          ) {
            throw new BadRequestException(
              `Batch ${item.batchId} does not belong to the selected color.`,
            );
          }

          if (
            stockInItem.stockIn.gender !== gender
          ) {
            throw new BadRequestException(
              `Batch ${item.batchId} does not belong to the selected gender.`,
            );
          }

          if (stockInItem.quantity < item.quantity) {
            throw new BadRequestException(
              `Insufficient stock in batch ${item.batchId} for product variant ${item.productVariantId}. Available: ${stockInItem.quantity}, requested: ${item.quantity}.`,
            );
          }

          /**
           * ------------------------------------------------
           * Validate aggregated Inventory quantity
           * at the exact location of this StockInItem.
           * ------------------------------------------------
           */
          const inventory =
            await tx.inventory.findUnique({
              where: {
                productVariantId_warehouseId_zoneId_subZoneId_rackId:
                {
                  productVariantId:
                    item.productVariantId,
                  warehouseId:
                    stockInItem.warehouseId,
                  zoneId:
                    stockInItem.zoneId,
                  subZoneId:
                    stockInItem.subZoneId,
                  rackId:
                    stockInItem.rackId,
                },
              },
              select: {
                id: true,
                quantity: true,
              },
            });

          if (!inventory) {
            throw new NotFoundException(
              `Inventory record not found for product variant ${item.productVariantId}.`,
            );
          }

          if (inventory.quantity < item.quantity) {
            throw new BadRequestException(
              `Insufficient inventory at the selected location for product variant ${item.productVariantId}. Available: ${inventory.quantity}, requested: ${item.quantity}.`,
            );
          }

          validatedItems.push({
            batchId: item.batchId,
            productVariantId:
              item.productVariantId,
            quantity: item.quantity,
            stockInItemId: stockInItem.id,
            availableQuantity:
              stockInItem.quantity,
            warehouseId:
              stockInItem.warehouseId,
            zoneId: stockInItem.zoneId,
            subZoneId: stockInItem.subZoneId,
            rackId: stockInItem.rackId,
          });
        }

        /**
         * --------------------------------------------------
         * 8. Generate Stock Out Number
         * --------------------------------------------------
         */
        const stockOutNumber =
          `SO-${Date.now()}-${randomUUID()
            .slice(0, 8)
            .toUpperCase()}`;

        /**
         * --------------------------------------------------
         * 9. Create StockOut
         * --------------------------------------------------
         */
        const stockOut =
          await tx.stockOut.create({
            data: {
              stockOutNumber,

              buyerId,
              letterOfCreditId,
              purchaseOrderId,

              masterProductId,
              colorId,
              gender,

              requestDate:
                requestDateValue,

              stockOutDate:
                stockOutDateValue,

              /**
               * Prisma default:
               * ISSUED
               */
              createdById,

              items: {
                create: validatedItems.map(
                  (item) => ({
                    batchId: item.batchId,
                    productVariantId:
                      item.productVariantId,
                    quantity: item.quantity,
                  }),
                ),
              },
            },

            select: {
              id: true,
              stockOutNumber: true,
              buyerId: true,
              letterOfCreditId: true,
              purchaseOrderId: true,
              masterProductId: true,
              colorId: true,
              gender: true,
              requestDate: true,
              stockOutDate: true,
              status: true,
              createdById: true,
            },
          });

        /**
         * --------------------------------------------------
         * 10. Decrease StockInItem quantities
         * --------------------------------------------------
         */
        for (const item of validatedItems) {
          const updatedStockInItem =
            await tx.stockInItem.updateMany({
              where: {
                id: item.stockInItemId,

                /**
                 * Important:
                 * prevents quantity from becoming negative
                 * even under concurrent requests.
                 */
                quantity: {
                  gte: item.quantity,
                },
              },
              data: {
                quantity: {
                  decrement: item.quantity,
                },
              },
            });

          if (
            updatedStockInItem.count !== 1
          ) {
            throw new BadRequestException(
              `Stock quantity changed before it could be issued for batch ${item.batchId}. Please try again.`,
            );
          }
        }

        /**
         * --------------------------------------------------
         * 11. Decrease Inventory quantities
         * --------------------------------------------------
         */
        for (const item of validatedItems) {
          const updatedInventory =
            await tx.inventory.updateMany({
              where: {
                productVariantId:
                  item.productVariantId,
                warehouseId:
                  item.warehouseId,
                zoneId: item.zoneId,
                subZoneId:
                  item.subZoneId,
                rackId:
                  item.rackId,

                quantity: {
                  gte: item.quantity,
                },
              },
              data: {
                quantity: {
                  decrement: item.quantity,
                },
              },
            });

          if (
            updatedInventory.count !== 1
          ) {
            throw new BadRequestException(
              `Inventory quantity changed before it could be issued for product variant ${item.productVariantId}. Please try again.`,
            );
          }
        }

        /**
         * --------------------------------------------------
         * 12. Return complete StockOut
         * --------------------------------------------------
         */
        return tx.stockOut.findUnique({
          where: {
            id: stockOut.id,
          },
          include: {
            buyer: true,
            letterOfCredit: true,
            purchaseOrder: true,
            masterProduct: true,
            color: true,
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            items: {
              include: {
                productVariant: true,
              },
            },
          },
        });
      },
      {
        /**
         * Interactive transaction timeout.
         */
        timeout: 10000,
      },
    );
  }
}