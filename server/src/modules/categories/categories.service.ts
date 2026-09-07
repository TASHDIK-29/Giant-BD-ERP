import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { DatabaseService } from '../../database/database.service.js';

import { CreateCategoryDto } from './dto/create-category.dto.js';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto.js';


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
    private async generateUniqueSlug(
        name: string,
    ): Promise<string> {
        const baseSlug =
            this.createSlugBase(name);

        let slug = baseSlug;
        let counter = 2;

        while (true) {
            const existingCategory =
                await this.databaseService.category.findUnique({
                    where: {
                        slug,
                    },
                    select: {
                        id: true,
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







}