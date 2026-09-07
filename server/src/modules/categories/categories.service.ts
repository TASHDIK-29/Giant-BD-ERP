import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { DatabaseService } from '../../database/database.service.js';

import { CreateCategoryDto } from './dto/create-category.dto.js';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto.js';

import {
    Prisma,
    Status,
} from '../../generated/prisma/client.js';

import { QueryCategoryDto } from './dto/query-category.dto.js';
import { CategoryType } from './enums/category-type.enum.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';


@Injectable()
export class CategoriesService {
    constructor(
        private readonly databaseService: DatabaseService,
    ) { }


    /**
     * Converts a name into a basic URL-friendly slug.
     */
    private createSlugBase(name: string): string {
        return name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }


    /**
     * Generates a unique category slug.
     */
    // private async generateUniqueSlug(
    //     name: string,
    // ): Promise<string> {
    //     const baseSlug =
    //         this.createSlugBase(name);

    //     let slug = baseSlug;
    //     let counter = 2;

    //     while (true) {
    //         const existingCategory =
    //             await this.databaseService.category.findUnique({
    //                 where: {
    //                     slug,
    //                 },
    //                 select: {
    //                     id: true,
    //                 },
    //             });

    //         if (!existingCategory) {
    //             return slug;
    //         }

    //         slug = `${baseSlug}-${counter}`;
    //         counter++;
    //     }
    // }


    private async generateUniqueSlug(
        name: string,
        excludeId?: number,
    ): Promise<string> {
        const baseSlug = name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');


        let slug = baseSlug;

        let counter = 1;


        while (true) {
            const existingCategory =
                await this.databaseService.category.findFirst({
                    where: {
                        slug,

                        ...(excludeId && {
                            id: {
                                not: excludeId,
                            },
                        }),
                    },
                });


            if (!existingCategory) {
                return slug;
            }


            slug = `${baseSlug}-${counter}`;

            counter++;
        }
    }




    async createCategory(
        createCategoryDto: CreateCategoryDto,
    ) {
        const {
            name,
            description,
            mediaId,
            sortOrder,
        } = createCategoryDto;


        const normalizedName = name.trim();


        const slug =
            await this.generateUniqueSlug(
                normalizedName,
            );


        const category =
            await this.databaseService.category.create({
                data: {
                    name: normalizedName,

                    slug,

                    description:
                        description?.trim() || null,

                    mediaId:
                        mediaId ?? null,

                    sortOrder:
                        sortOrder ?? 0,

                    /*
                     * Explicitly enforce that this
                     * is a top-level category.
                     */
                    parentId: null,
                },

                select: {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                    parentId: true,
                    mediaId: true,
                    status: true,
                    sortOrder: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });


        return {
            message:
                'Category created successfully.',
            category,
        };
    }




    async createSubCategory(
        createSubCategoryDto: CreateSubCategoryDto,
    ) {
        const {
            name,
            parentId,
            description,
            mediaId,
            sortOrder,
        } = createSubCategoryDto;


        /*
         * Find the requested parent.
         */
        const parentCategory =
            await this.databaseService.category.findUnique({
                where: {
                    id: parentId,
                },
                select: {
                    id: true,
                    name: true,
                    parentId: true,
                    status: true,
                },
            });


        if (!parentCategory) {
            throw new NotFoundException(
                'Parent category not found.',
            );
        }


        /*
         * Critical business rule:
         *
         * Only a top-level category can have
         * sub-categories.
         */
        if (parentCategory.parentId !== null) {
            throw new BadRequestException(
                'A sub-category cannot be used as a parent category.',
            );
        }


        const normalizedName = name.trim();


        const slug =
            await this.generateUniqueSlug(
                normalizedName,
            );


        const subCategory =
            await this.databaseService.category.create({
                data: {
                    name: normalizedName,

                    slug,

                    description:
                        description?.trim() || null,

                    parentId,

                    mediaId:
                        mediaId ?? null,

                    sortOrder:
                        sortOrder ?? 0,
                },

                select: {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                    parentId: true,
                    mediaId: true,
                    status: true,
                    sortOrder: true,

                    parent: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },

                    createdAt: true,
                    updatedAt: true,
                },
            });


        return {
            message:
                'Sub-category created successfully.',

            subCategory,
        };
    }




    async findAll(query: QueryCategoryDto) {
        const {
            page = 1,
            limit = 10,
            search,
            status,
            type,
        } = query;

        const skip = (page - 1) * limit;

        const where: Prisma.CategoryWhereInput = {};

        /*
         * Search by category name.
         */
        if (search?.trim()) {
            where.name = {
                contains: search.trim(),
                mode: 'insensitive',
            };
        }

        /*
         * Filter by status.
         */
        if (status) {
            where.status = status;
        }

        /*
         * CATEGORY
         * → Top-level category
         */
        if (type === CategoryType.CATEGORY) {
            where.parentId = null;
        }

        /*
         * SUB_CATEGORY
         * → Category with a parent
         */
        if (type === CategoryType.SUB_CATEGORY) {
            where.parentId = {
                not: null,
            };
        }

        const [categories, total] =
            await this.databaseService.$transaction([
                this.databaseService.category.findMany({
                    where,

                    skip,

                    take: limit,

                    include: {
                        parent: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },

                        _count: {
                            select: {
                                children: true,
                            },
                        },
                    },

                    orderBy: [
                        {
                            sortOrder: 'asc',
                        },
                        {
                            id: 'desc',
                        },
                    ],
                }),

                this.databaseService.category.count({
                    where,
                }),
            ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data: categories.map((category) => ({
                id: category.id,

                name: category.name,

                slug: category.slug,

                description: category.description,

                type:
                    category.parentId === null
                        ? CategoryType.CATEGORY
                        : CategoryType.SUB_CATEGORY,

                parentId: category.parentId,

                parent: category.parent,

                mediaId: category.mediaId,

                status: category.status,

                sortOrder: category.sortOrder,

                childrenCount: category._count.children,

                createdAt: category.createdAt,

                updatedAt: category.updatedAt,
            })),

            meta: {
                page,

                limit,

                total,

                totalPages,
            },
        };
    }




    async getTree() {
        const categories =
            await this.databaseService.category.findMany({
                where: {
                    parentId: null,
                },

                select: {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                    mediaId: true,
                    status: true,
                    sortOrder: true,

                    children: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            description: true,
                            mediaId: true,
                            status: true,
                            sortOrder: true,
                            createdAt: true,
                            updatedAt: true,
                        },

                        orderBy: [
                            {
                                sortOrder: 'asc',
                            },
                            {
                                id: 'desc',
                            },
                        ],
                    },

                    createdAt: true,
                    updatedAt: true,
                },

                orderBy: [
                    {
                        sortOrder: 'asc',
                    },
                    {
                        id: 'desc',
                    },
                ],
            });

        return {
            data: categories,
        };
    }




    async findOne(id: number) {
        const category =
            await this.databaseService.category.findUnique({
                where: {
                    id,
                },

                include: {
                    parent: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            status: true,
                        },
                    },

                    children: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            description: true,
                            mediaId: true,
                            status: true,
                            sortOrder: true,
                            createdAt: true,
                            updatedAt: true,
                        },

                        orderBy: [
                            {
                                sortOrder: 'asc',
                            },
                            {
                                id: 'desc',
                            },
                        ],
                    },
                },
            });

        if (!category) {
            throw new NotFoundException(
                `Category with ID ${id} was not found.`,
            );
        }

        return {
            data: {
                id: category.id,

                name: category.name,

                slug: category.slug,

                description: category.description,

                type:
                    category.parentId === null
                        ? CategoryType.CATEGORY
                        : CategoryType.SUB_CATEGORY,

                parentId: category.parentId,

                parent: category.parent,

                children: category.children,

                mediaId: category.mediaId,

                status: category.status,

                sortOrder: category.sortOrder,

                createdAt: category.createdAt,

                updatedAt: category.updatedAt,
            },
        };
    }





    async update(
        id: number,
        updateCategoryDto: UpdateCategoryDto,
    ) {
        const existingCategory =
            await this.databaseService.category.findUnique({
                where: {
                    id,
                },
                include: {
                    _count: {
                        select: {
                            children: true,
                        },
                    },
                },
            });

        if (!existingCategory) {
            throw new NotFoundException(
                `Category with ID ${id} was not found.`,
            );
        }


        /*
         * We must use hasOwnProperty because:
         *
         * parentId: undefined
         * means don't update parent.
         *
         * parentId: null
         * means explicitly remove the parent.
         */
        const isParentChanging =
            Object.prototype.hasOwnProperty.call(
                updateCategoryDto,
                'parentId',
            );


        if (isParentChanging) {
            throw new BadRequestException("Parent can not be changed")
        }


        // if (isParentChanging) {
        //     const newParentId =
        //         updateCategoryDto.parentId;


        //     /*
        //      * Prevent a category from becoming
        //      * its own parent.
        //      */
        //     if (newParentId === id) {
        //         throw new BadRequestException(
        //             'A category cannot be its own parent.',
        //         );
        //     }


        //     /*
        //      * If a parent ID is provided,
        //      * it must be a valid top-level category.
        //      */
        //     if (
        //         newParentId !== null &&
        //         newParentId !== undefined
        //     ) {
        //         const newParent =
        //             await this.databaseService.category.findUnique({
        //                 where: {
        //                     id: newParentId,
        //                 },
        //                 select: {
        //                     id: true,
        //                     parentId: true,
        //                 },
        //             });


        //         if (!newParent) {
        //             throw new NotFoundException(
        //                 'New parent category not found.',
        //             );
        //         }


        //         /*
        //          * A sub-category cannot become
        //          * another category's parent.
        //          */
        //         if (newParent.parentId !== null) {
        //             throw new BadRequestException(
        //                 'A sub-category cannot be used as a parent category.',
        //             );
        //         }


        //         /*
        //          * A category that already has children
        //          * cannot become a sub-category.
        //          */
        //         if (
        //             existingCategory._count.children > 0
        //         ) {
        //             throw new BadRequestException(
        //                 'A category with sub-categories cannot become a sub-category.',
        //             );
        //         }
        //     }
        // }


        /*
         * Generate a new slug only if the name changes.
         */
        let slug: string | undefined;

        if (
            updateCategoryDto.name &&
            updateCategoryDto.name.trim() !==
            existingCategory.name
        ) {
            slug = await this.generateUniqueSlug(
                updateCategoryDto.name.trim(),
                id,
            );
        }


        const updatedCategory =
            await this.databaseService.category.update({
                where: {
                    id,
                },

                data: {
                    ...(updateCategoryDto.name !== undefined && {
                        name: updateCategoryDto.name.trim(),
                    }),

                    ...(slug !== undefined && {
                        slug,
                    }),

                    ...(updateCategoryDto.description !== undefined && {
                        description:
                            updateCategoryDto.description?.trim() ||
                            null,
                    }),

                    // ...(isParentChanging && {
                    //     parentId:
                    //         updateCategoryDto.parentId,
                    // }),

                    ...(updateCategoryDto.mediaId !== undefined && {
                        mediaId:
                            updateCategoryDto.mediaId,
                    }),

                    ...(updateCategoryDto.sortOrder !== undefined && {
                        sortOrder:
                            updateCategoryDto.sortOrder,
                    }),
                },

                include: {
                    parent: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },

                    children: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            status: true,
                            sortOrder: true,
                        },
                    },
                },
            });


        return {
            message: 'Category updated successfully.',
            data: updatedCategory,
        };
    }




    async updateStatus(
        id: number,
        status: Status,
    ) {
        const category =
            await this.databaseService.category.findUnique({
                where: {
                    id,
                },

                select: {
                    id: true,
                    parentId: true,
                    status: true,
                },
            });


        if (!category) {
            throw new NotFoundException(
                `Category with ID ${id} was not found.`,
            );
        }


        const updatedCategory =
            await this.databaseService.category.update({
                where: {
                    id,
                },

                data: {
                    status,
                },

                select: {
                    id: true,
                    name: true,
                    slug: true,
                    status: true,
                    updatedAt: true,
                },
            });


        return {
            message:
                'Category status updated successfully.',

            data: updatedCategory,
        };
    }



}