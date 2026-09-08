import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { DatabaseService } from '../../database/database.service.js';

import { CreateColorDto } from './dto/create-color.dto.js';
import { UpdateColorDto } from './dto/update-color.dto.js';
import { ColorQueryDto } from './dto/color-query.dto.js';


@Injectable()
export class ColorsService {
    constructor(
        private readonly databaseService: DatabaseService,
    ) {}


    /*
     * Create Color
     */
    async create(
        createColorDto: CreateColorDto,
    ) {
        const normalizedName =
            createColorDto.name.trim();

        const existingColor =
            await this.databaseService.color.findFirst({
                where: {
                    name: {
                        equals: normalizedName,
                        mode: 'insensitive',
                    },
                },
            });

        if (existingColor) {
            throw new ConflictException(
                'A color with this name already exists.',
            );
        }


        const color =
            await this.databaseService.color.create({
                data: {
                    name: normalizedName,

                    description:
                        createColorDto.description?.trim() ||
                        null,
                },
            });


        return {
            message: 'Color created successfully.',
            data: color,
        };
    }


    /*
     * List Colors
     */
    async findAll(
        query: ColorQueryDto,
    ) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;

        const skip =
            (page - 1) * limit;


        const where = {
            ...(query.search && {
                name: {
                    contains: query.search.trim(),
                    mode: 'insensitive' as const,
                },
            }),
        };


        const [colors, total] =
            await this.databaseService.$transaction([
                this.databaseService.color.findMany({
                    where,

                    skip,
                    take: limit,

                    orderBy: {
                        createdAt: 'desc',
                    },
                }),

                this.databaseService.color.count({
                    where,
                }),
            ]);


        return {
            data: colors,

            meta: {
                page,
                limit,
                total,

                totalPages: Math.ceil(
                    total / limit,
                ),
            },
        };
    }


    /*
     * Get Single Color
     */
    async findOne(id: number) {
        const color =
            await this.databaseService.color.findUnique({
                where: {
                    id,
                },
            });


        if (!color) {
            throw new NotFoundException(
                `Color with ID ${id} was not found.`,
            );
        }


        return {
            data: color,
        };
    }


    /*
     * Update Color
     */
    async update(
        id: number,
        updateColorDto: UpdateColorDto,
    ) {
        const existingColor =
            await this.databaseService.color.findUnique({
                where: {
                    id,
                },
            });


        if (!existingColor) {
            throw new NotFoundException(
                `Color with ID ${id} was not found.`,
            );
        }


        let normalizedName:
            | string
            | undefined;


        if (
            updateColorDto.name !== undefined
        ) {
            normalizedName =
                updateColorDto.name.trim();


            const colorWithSameName =
                await this.databaseService.color.findFirst({
                    where: {
                        id: {
                            not: id,
                        },

                        name: {
                            equals: normalizedName,
                            mode: 'insensitive',
                        },
                    },
                });


            if (colorWithSameName) {
                throw new ConflictException(
                    'A color with this name already exists.',
                );
            }
        }


        const updatedColor =
            await this.databaseService.color.update({
                where: {
                    id,
                },

                data: {
                    ...(normalizedName !== undefined && {
                        name: normalizedName,
                    }),

                    ...(updateColorDto.description !==
                        undefined && {
                        description:
                            updateColorDto.description?.trim() ||
                            null,
                    }),
                },
            });


        return {
            message: 'Color updated successfully.',
            data: updatedColor,
        };
    }


    /*
     * Delete Color
     */
    async remove(id: number) {
        const color =
            await this.databaseService.color.findUnique({
                where: {
                    id,
                },
            });


        if (!color) {
            throw new NotFoundException(
                `Color with ID ${id} was not found.`,
            );
        }


        /*
         * Future protection:
         *
         * Once the Product Variant module is created,
         * prevent deletion if this color is being used.
         */


        await this.databaseService.color.delete({
            where: {
                id,
            },
        });


        return {
            message: 'Color deleted successfully.',
        };
    }
}