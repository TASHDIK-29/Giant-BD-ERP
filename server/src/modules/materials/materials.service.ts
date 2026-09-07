import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { DatabaseService } from '../../database/database.service.js';

import { CreateMaterialDto } from './dto/create-material.dto.js';
import { UpdateMaterialDto } from './dto/update-material.dto.js';
import { MaterialQueryDto } from './dto/material-query.dto.js';


@Injectable()
export class MaterialsService {
    constructor(
        private readonly databaseService: DatabaseService,
    ) { }


    async create(
        createMaterialDto: CreateMaterialDto,
    ) {
        const normalizedName =
            createMaterialDto.name.trim();

        const existingMaterial =
            await this.databaseService.material.findFirst({
                where: {
                    name: {
                        equals: normalizedName,
                        mode: 'insensitive',
                    },
                },
            });

        if (existingMaterial) {
            throw new ConflictException(
                'A material with this name already exists.',
            );
        }


        const material =
            await this.databaseService.material.create({
                data: {
                    name: normalizedName,
                    description:
                        createMaterialDto.description?.trim() ||
                        null,
                },
            });


        return {
            message: 'Material created successfully.',
            data: material,
        };
    }


    async findAll(
        query: MaterialQueryDto,
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


        const [materials, total] =
            await this.databaseService.$transaction([
                this.databaseService.material.findMany({
                    where,
                    skip,
                    take: limit,

                    orderBy: {
                        createdAt: 'desc',
                    },
                }),

                this.databaseService.material.count({
                    where,
                }),
            ]);


        return {
            data: materials,

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


    async findOne(id: number) {
        const material =
            await this.databaseService.material.findUnique({
                where: {
                    id,
                },
            });


        if (!material) {
            throw new NotFoundException(
                `Material with ID ${id} was not found.`,
            );
        }


        return {
            data: material,
        };
    }


    async update(
        id: number,
        updateMaterialDto: UpdateMaterialDto,
    ) {
        const existingMaterial =
            await this.databaseService.material.findUnique({
                where: {
                    id,
                },
            });


        if (!existingMaterial) {
            throw new NotFoundException(
                `Material with ID ${id} was not found.`,
            );
        }


        let normalizedName:
            | string
            | undefined;


        if (
            updateMaterialDto.name !== undefined
        ) {
            normalizedName =
                updateMaterialDto.name.trim();


            const materialWithSameName =
                await this.databaseService.material.findFirst({
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


            if (materialWithSameName) {
                throw new ConflictException(
                    'A material with this name already exists.',
                );
            }
        }


        const updatedMaterial =
            await this.databaseService.material.update({
                where: {
                    id,
                },

                data: {
                    ...(normalizedName !== undefined && {
                        name: normalizedName,
                    }),

                    ...(updateMaterialDto.description !==
                        undefined && {
                        description:
                            updateMaterialDto.description?.trim() ||
                            null,
                    }),
                },
            });


        return {
            message: 'Material updated successfully.',
            data: updatedMaterial,
        };
    }


    async remove(id: number) {
        const material =
            await this.databaseService.material.findUnique({
                where: {
                    id,
                },
            });


        if (!material) {
            throw new NotFoundException(
                `Material with ID ${id} was not found.`,
            );
        }


        await this.databaseService.material.delete({
            where: {
                id,
            },
        });


        return {
            message: 'Material deleted successfully.',
        };
    }
}