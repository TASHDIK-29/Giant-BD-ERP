'use client';

import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    useRouter,
} from 'next/navigation';

import {
    useCategories,
} from '@/features/categories/hooks';

import {
    useMaterials,
} from '@/features/materials/hooks';

import {
    useCreateMasterProduct,
} from '../hooks';

export function MasterProductForm() {
    const router = useRouter();

    const createMutation =
        useCreateMasterProduct();

    const [name, setName] =
        useState('');

    const [categoryId, setCategoryId] =
        useState('');

    const [subCategoryId, setSubCategoryId] =
        useState('');

    const [materialId, setMaterialId] =
        useState('');

    const [error, setError] =
        useState('');

    /*
     * Load top-level categories.
     */
    const {
        data: categoryData,
        isLoading: categoriesLoading,
    } = useCategories({
        page: 1,
        limit: 100,
        type: 'CATEGORY',
    });

    /*
     * Load all sub-categories.
     *
     * We filter them by parentId on
     * the frontend according to the
     * selected category.
     */
    const {
        data: subCategoryData,
        isLoading:
            subCategoriesLoading,
    } = useCategories({
        page: 1,
        limit: 100,
        type: 'SUB_CATEGORY',
    });

    /*
     * Load materials.
     */
    const {
        data: materialData,
        isLoading: materialsLoading,
    } = useMaterials({
        page: 1,
        limit: 100,
    });

    const categories =
        categoryData?.data ?? [];

    const subCategories =
        subCategoryData?.data ?? [];

    const materials =
        materialData?.data ?? [];

    /*
     * Only show sub-categories
     * belonging to selected category.
     */
    const filteredSubCategories =
        useMemo(() => {
            if (!categoryId) {
                return [];
            }

            return subCategories.filter(
                (subCategory) =>
                    subCategory.parentId ===
                    Number(categoryId),
            );
        }, [
            categoryId,
            subCategories,
        ]);

    /*
     * Auto-generated SKU.
     *
     * Example:
     * Name     = Mens Shirt
     * Category = Cloth
     *
     * Result:
     * MENS-SHIRT-CLOTH
     */
    const generatedSku =
        useMemo(() => {
            const selectedCategory =
                categories.find(
                    (category) =>
                        category.id ===
                        Number(categoryId),
                );

            if (!name.trim()) {
                return '';
            }

            if (!selectedCategory) {
                return '';
            }

            const value =
                `${name}-${selectedCategory.name}`;

            return value
                .trim()
                .replace(
                    /[^a-zA-Z0-9]+/g,
                    '-',
                )
                .replace(
                    /^-+|-+$/g,
                    '',
                )
                .toUpperCase();
        }, [
            name,
            categoryId,
            categories,
        ]);

    /*
     * When category changes,
     * reset the selected sub-category.
     */
    useEffect(() => {
        if (
            subCategoryId &&
            !filteredSubCategories.some(
                (subCategory) =>
                    subCategory.id ===
                    Number(
                        subCategoryId,
                    ),
            )
        ) {
            setSubCategoryId('');
        }
    }, [
        filteredSubCategories,
        subCategoryId,
    ]);

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        setError('');

        if (!name.trim()) {
            setError(
                'Master product name is required.',
            );
            return;
        }

        if (!categoryId) {
            setError(
                'Category is required.',
            );
            return;
        }

        if (!materialId) {
            setError(
                'Material is required.',
            );
            return;
        }

        try {
            await createMutation.mutateAsync(
                {
                    name: name.trim(),

                    categoryId:
                        Number(categoryId),

                    ...(subCategoryId
                        ? {
                              subCategoryId:
                                  Number(
                                      subCategoryId,
                                  ),
                          }
                        : {}),

                    materialId:
                        Number(materialId),
                },
            );

            router.push(
                '/master-fg-product',
            );

            router.refresh();
        } catch (error: any) {
            setError(
                error?.response?.data
                    ?.message ||
                    'Failed to create master product.',
            );
        }
    };

    const handleReset = () => {
        setName('');
        setCategoryId('');
        setSubCategoryId('');
        setMaterialId('');
        setError('');
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4"
        >
            {/* Master Finished Good Information */}
            <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div className="flex items-center gap-3">
                        <span className="h-10 w-1 rounded-full bg-primary" />

                        <h2 className="text-sm font-semibold">
                            Master Finished Good Information
                        </h2>
                    </div>
                </div>

                {/* Fields */}
                <div className="grid grid-cols-1 gap-5 p-6 lg:grid-cols-2">
                    {/* Master Product Name */}
                    <div>
                        <label
                            htmlFor="master-product-name"
                            className="mb-2 block text-sm font-medium"
                        >
                            Master Good Name{' '}
                            <span className="text-destructive">
                                *
                            </span>
                        </label>

                        <input
                            id="master-product-name"
                            type="text"
                            value={name}
                            onChange={(
                                event,
                            ) =>
                                setName(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            placeholder="Enter product name"
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    {/* SKU */}
                    <div>
                        <label
                            htmlFor="master-product-sku"
                            className="mb-2 block text-sm font-medium"
                        >
                            SKU (Auto)
                        </label>

                        <input
                            id="master-product-sku"
                            type="text"
                            value={
                                generatedSku
                            }
                            readOnly
                            placeholder="Auto-generated by Name + Category"
                            className="h-10 w-full cursor-not-allowed rounded-md border bg-muted/40 px-3 text-sm text-muted-foreground outline-none"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label
                            htmlFor="category"
                            className="mb-2 block text-sm font-medium"
                        >
                            Category{' '}
                            <span className="text-destructive">
                                *
                            </span>
                        </label>

                        <select
                            id="category"
                            value={
                                categoryId
                            }
                            onChange={(
                                event,
                            ) =>
                                setCategoryId(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            disabled={
                                categoriesLoading
                            }
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <option value="">
                                {categoriesLoading
                                    ? 'Loading categories...'
                                    : 'Select category'}
                            </option>

                            {categories.map(
                                (
                                    category,
                                ) => (
                                    <option
                                        key={
                                            category.id
                                        }
                                        value={
                                            category.id
                                        }
                                    >
                                        {
                                            category.name
                                        }
                                    </option>
                                ),
                            )}
                        </select>
                    </div>

                    {/* Sub Category */}
                    <div>
                        <label
                            htmlFor="sub-category"
                            className="mb-2 block text-sm font-medium"
                        >
                            Sub Category{' '}
                            <span className="text-muted-foreground">
                                (Optional)
                            </span>
                        </label>

                        <select
                            id="sub-category"
                            value={
                                subCategoryId
                            }
                            onChange={(
                                event,
                            ) =>
                                setSubCategoryId(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            disabled={
                                !categoryId ||
                                subCategoriesLoading
                            }
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <option value="">
                                {!categoryId
                                    ? 'Select category first'
                                    : subCategoriesLoading
                                      ? 'Loading sub-categories...'
                                      : filteredSubCategories.length ===
                                          0
                                        ? 'No sub-categories found'
                                        : 'Select sub-category'}
                            </option>

                            {filteredSubCategories.map(
                                (
                                    subCategory,
                                ) => (
                                    <option
                                        key={
                                            subCategory.id
                                        }
                                        value={
                                            subCategory.id
                                        }
                                    >
                                        {
                                            subCategory.name
                                        }
                                    </option>
                                ),
                            )}
                        </select>
                    </div>

                    {/* Material */}
                    <div>
                        <label
                            htmlFor="material"
                            className="mb-2 block text-sm font-medium"
                        >
                            Material{' '}
                            <span className="text-destructive">
                                *
                            </span>
                        </label>

                        <select
                            id="material"
                            value={
                                materialId
                            }
                            onChange={(
                                event,
                            ) =>
                                setMaterialId(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            disabled={
                                materialsLoading
                            }
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <option value="">
                                {materialsLoading
                                    ? 'Loading materials...'
                                    : 'Select material'}
                            </option>

                            {materials.map(
                                (
                                    material,
                                ) => (
                                    <option
                                        key={
                                            material.id
                                        }
                                        value={
                                            material.id
                                        }
                                    >
                                        {
                                            material.name
                                        }
                                    </option>
                                ),
                            )}
                        </select>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            {/* Bottom Actions */}
            <div className="flex flex-col-reverse gap-3 rounded-2xl border bg-background p-3 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={() =>
                        router.back()
                    }
                    className="h-10 rounded-md px-12 text-sm font-semibold text-white bg-red-600"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    onClick={
                        handleReset
                    }
                    className="h-10 rounded-md border border-orange-400 px-12 text-sm font-semibold text-orange-500 transition hover:bg-orange-50"
                >
                    Reset
                </button>

                <button
                    type="submit"
                    disabled={
                        createMutation.isPending
                    }
                    className="h-10 rounded-md bg-[#476AB8] px-12 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {createMutation.isPending
                        ? 'Creating...'
                        : 'Create'}
                </button>
            </div>
        </form>
    );
}