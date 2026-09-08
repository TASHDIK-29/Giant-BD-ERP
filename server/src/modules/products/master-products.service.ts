import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { DatabaseService } from '../../database/database.service.js';

import { CreateMasterProductDto } from './dto/create-master-product.dto.js';
import { MasterProductQueryDto } from './dto/master-product-query.dto.js';

import { Prisma, Status } from '../../generated/prisma/client.js';
import { UpdateMasterProductDto } from './dto/update-master-product.dto.js';


@Injectable()
export class MasterProductsService {
    constructor(
        private readonly databaseService: DatabaseService,
    ) { }


    private normalizeSkuPart(
        value: string,
    ): string {
        return value
            .trim()
            .toUpperCase()
            .replace(/[^A-Z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }


    private generateMasterSku(
        productName: string,
        categoryName: string,
    ): string {
        const normalizedProductName =
            this.normalizeSkuPart(productName);

        const normalizedCategoryName =
            this.normalizeSkuPart(categoryName);

        return `${normalizedProductName}-${normalizedCategoryName}`;
    }


    async create(
        createMasterProductDto: CreateMasterProductDto,
    ) {
        const normalizedName =
            createMasterProductDto.name.trim();


        /*
         * 1. Validate the Category.
         *
         * A Master Product must belong to a
         * top-level Category.
         */
        const category =
            await this.databaseService.category.findUnique({
                where: {
                    id: createMasterProductDto.categoryId,
                },
            });


        if (!category) {
            throw new NotFoundException(
                'Category was not found.',
            );
        }


        if (category.parentId !== null) {
            throw new ConflictException(
                'The selected category must be a top-level category.',
            );
        }


        /*
         * 2. Validate Sub-Category.
         */
        if (
            createMasterProductDto.subCategoryId !== undefined
        ) {
            const subCategory =
                await this.databaseService.category.findUnique({
                    where: {
                        id: createMasterProductDto.subCategoryId,
                    },
                });


            if (!subCategory) {
                throw new NotFoundException(
                    'Sub-category was not found.',
                );
            }


            if (
                subCategory.parentId !== category.id
            ) {
                throw new ConflictException(
                    'The selected sub-category does not belong to the selected category.',
                );
            }
        }


        /*
         * 3. Validate Material.
         */
        const material =
            await this.databaseService.material.findUnique({
                where: {
                    id: createMasterProductDto.materialId,
                },
            });


        if (!material) {
            throw new NotFoundException(
                'Material was not found.',
            );
        }


        /*
         * 4. Generate SKU.
         */
        const sku =
            this.generateMasterSku(
                normalizedName,
                category.name,
            );


        /*
         * 5. Check SKU uniqueness.
         */
        const existingProduct =
            await this.databaseService.masterProduct.findUnique({
                where: {
                    sku,
                },
            });


        if (existingProduct) {
            throw new ConflictException(
                `A Master Product with SKU "${sku}" already exists.`,
            );
        }


        /*
         * 6. Create Master Product.
         */
        const masterProduct =
            await this.databaseService.masterProduct.create({
                data: {
                    name: normalizedName,
                    sku,

                    categoryId:
                        createMasterProductDto.categoryId,

                    subCategoryId:
                        createMasterProductDto.subCategoryId,

                    materialId:
                        createMasterProductDto.materialId,
                },

                include: {
                    category: true,

                    subCategory: true,

                    material: true,
                },
            });


        return {
            message:
                'Master Product created successfully.',

            data: masterProduct,
        };
    }



    async findAll(
        query: MasterProductQueryDto,
    ) {
        const page =
            query.page ?? 1;

        const limit =
            query.limit ?? 10;

        const skip =
            (page - 1) * limit;


        const where: Prisma.MasterProductWhereInput = {
            ...(query.search && {
                OR: [
                    {
                        name: {
                            contains:
                                query.search.trim(),
                            mode: 'insensitive',
                        },
                    },

                    {
                        sku: {
                            contains:
                                query.search.trim(),
                            mode: 'insensitive',
                        },
                    },
                ],
            }),

            ...(query.categoryId && {
                categoryId:
                    query.categoryId,
            }),

            ...(query.subCategoryId && {
                subCategoryId:
                    query.subCategoryId,
            }),

            ...(query.materialId && {
                materialId:
                    query.materialId,
            }),
        };


        const [
            masterProducts,
            total,
        ] =
            await this.databaseService.$transaction([
                this.databaseService.masterProduct.findMany({
                    where,

                    skip,
                    take: limit,

                    include: {
                        category: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },

                        subCategory: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },

                        material: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },

                        _count: {
                            select: {
                                variants: true,
                            },
                        },
                    },

                    orderBy: {
                        createdAt: 'desc',
                    },
                }),

                this.databaseService.masterProduct.count({
                    where,
                }),
            ]);


        return {
            data: masterProducts,

            meta: {
                page,
                limit,
                total,

                totalPages:
                    Math.ceil(total / limit),
            },
        };
    }




    async findOne(id: number) {
        const masterProduct =
            await this.databaseService.masterProduct.findUnique({
                where: {
                    id,
                },

                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },

                    subCategory: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },

                    material: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                        },
                    },

                    _count: {
                        select: {
                            variants: true,
                        },
                    },
                },
            });

        if (!masterProduct) {
            throw new NotFoundException(
                'Master Product was not found.',
            );
        }

        return {
            data: masterProduct,
        };
    }



    async update(
        id: number,
        updateMasterProductDto: UpdateMasterProductDto,
    ) {
        /*
         * 1. Find the existing Master Product.
         */
        const existingMasterProduct =
            await this.databaseService.masterProduct.findUnique({
                where: {
                    id,
                },
            });

        if (!existingMasterProduct) {
            throw new NotFoundException(
                'Master Product was not found.',
            );
        }


        const variantCount =
            await this.databaseService.productVariant.count({
                where: {
                    masterProductId: id,
                },
            });


        const isChangingSkuSource =
            updateMasterProductDto.name !== undefined ||
            updateMasterProductDto.categoryId !== undefined;


        if (
            variantCount > 0 &&
            isChangingSkuSource
        ) {
            throw new ConflictException(
                'Cannot change the product name or category after variants have been created because these fields determine the product SKU.',
            );
        }


        /*
         * 2. Determine the final values.
         */
        const finalName =
            updateMasterProductDto.name !== undefined
                ? updateMasterProductDto.name.trim()
                : existingMasterProduct.name;

        const finalCategoryId =
            updateMasterProductDto.categoryId ??
            existingMasterProduct.categoryId;

        const finalSubCategoryId =
            updateMasterProductDto.subCategoryId !== undefined
                ? updateMasterProductDto.subCategoryId
                : existingMasterProduct.subCategoryId;

        const finalMaterialId =
            updateMasterProductDto.materialId ??
            existingMasterProduct.materialId;


        /*
         * 3. Validate the Category.
         */
        const category =
            await this.databaseService.category.findUnique({
                where: {
                    id: finalCategoryId,
                },
            });

        if (!category) {
            throw new NotFoundException(
                'Category was not found.',
            );
        }

        if (category.parentId !== null) {
            throw new ConflictException(
                'The selected category must be a top-level category.',
            );
        }


        /*
         * 4. Validate the Sub-Category.
         */
        if (finalSubCategoryId !== null) {
            const subCategory =
                await this.databaseService.category.findUnique({
                    where: {
                        id: finalSubCategoryId,
                    },
                });

            if (!subCategory) {
                throw new NotFoundException(
                    'Sub-category was not found.',
                );
            }

            if (
                subCategory.parentId !== category.id
            ) {
                throw new ConflictException(
                    'The selected sub-category does not belong to the selected category.',
                );
            }
        }


        /*
         * 5. Validate Material.
         */
        const material =
            await this.databaseService.material.findUnique({
                where: {
                    id: finalMaterialId,
                },
            });

        if (!material) {
            throw new NotFoundException(
                'Material was not found.',
            );
        }


        /*
         * 6. Generate the new SKU.
         */
        const newSku =
            this.generateMasterSku(
                finalName,
                category.name,
            );


        /*
         * 7. Check whether another product already
         * has this SKU.
         */
        const existingSkuProduct =
            await this.databaseService.masterProduct.findUnique({
                where: {
                    sku: newSku,
                },
            });

        if (
            existingSkuProduct &&
            existingSkuProduct.id !== id
        ) {
            throw new ConflictException(
                `Another Master Product already uses SKU "${newSku}".`,
            );
        }


        /*
         * 8. Update the Master Product.
         */
        const updatedMasterProduct =
            await this.databaseService.masterProduct.update({
                where: {
                    id,
                },

                data: {
                    name: finalName,

                    sku: newSku,

                    categoryId: finalCategoryId,

                    subCategoryId: finalSubCategoryId,

                    materialId: finalMaterialId,
                },

                include: {
                    category: true,
                    subCategory: true,
                    material: true,
                },
            });


        return {
            message:
                'Master Product updated successfully.',

            data: updatedMasterProduct,
        };
    }




    async updateStatus(
        id: number,
        status: Status,
    ) {
        const masterProduct =
            await this.databaseService.masterProduct.findUnique({
                where: {
                    id,
                },
                select: {
                    id: true,
                    status: true,
                },
            });

        if (!masterProduct) {
            throw new NotFoundException(
                'Master Product was not found.',
            );
        }


        const updatedMasterProduct =
            await this.databaseService.masterProduct.update({
                where: {
                    id,
                },

                data: {
                    status,
                },

                select: {
                    id: true,
                    name: true,
                    sku: true,
                    status: true,
                },
            });


        return {
            message:
                'Master Product status updated successfully.',

            data: updatedMasterProduct,
        };
    }



    async remove(id: number) {
        const masterProduct =
            await this.databaseService.masterProduct.findUnique({
                where: {
                    id,
                },

                include: {
                    _count: {
                        select: {
                            variants: true,
                        },
                    },
                },
            });

        if (!masterProduct) {
            throw new NotFoundException(
                'Master Product was not found.',
            );
        }


        if (masterProduct._count.variants > 0) {
            throw new ConflictException(
                'Cannot delete this Master Product because it has existing Product Variants.',
            );
        }


        await this.databaseService.masterProduct.delete({
            where: {
                id,
            },
        });


        return {
            message:
                'Master Product deleted successfully.',
        };
    }


}