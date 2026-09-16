'use client';

import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    useRouter,
} from 'next/navigation';
import { useCategories, useCreateSubCategory } from '../hooks';
import { Status } from '@/features/stock-out-list/type';





export function CreateSubCategoryForm() {

    const router = useRouter();

    const createMutation = useCreateSubCategory();

    const [error, setError] =
        useState('');

    const [name, setName] =
        useState('');


    const [des, setDes] =
        useState('');

    const [status, setStatus] = useState<Status>('ACTIVE');

    const [categoryId, setCategoryId] =
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

    const categories =
        categoryData?.data ?? [];


    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        setError('');

        if (!name) {
            setError(
                'Buyer is required.',
            );
            return;
        }

        if (!categoryId) {
            setError(
                'Category is required.',
            );
            return;
        }


        try {
            await createMutation.mutateAsync(
                {
                    name: name,
                    description: des,
                    parentId: categoryId
                },
            );

            router.push(
                '/sub-category',
            );

            router.refresh();
        } catch (error: any) {
            setError(
                error?.response?.data
                    ?.message ||
                'Failed to create category',
            );
        }
    };

    const handleReset = () => {
        setName('');
        setDes('');
        setStatus('ACTIVE');;
        setError('');
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4"
        >
            {/* Buyer Information */}
            <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div className="flex items-center gap-3">
                        <span className="h-10 w-1 rounded-full bg-[#476AB8]" />

                        <h2 className="text-sm font-semibold">
                            Category Information
                        </h2>
                    </div>
                </div>

                {/* Fields */}
                <div className="grid grid-cols-1 gap-5 p-6 lg:grid-cols-2">
                    {/* Category */}
                    <div>
                        <label
                            htmlFor="category"
                            className="mb-2 block text-sm font-medium"
                        >
                            Main Category{' '}
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



                    {/* Status */}
                    <div>
                        <label
                            htmlFor="status"
                            className="mb-2 block text-sm font-medium"
                        >
                            Status{' '}
                            <span className="text-destructive">
                                *
                            </span>
                        </label>

                        <select
                            id="status"
                            value={status}
                            onChange={(
                                event,
                            ) =>
                                setStatus(
                                    event.target
                                        .value as Status,
                                )
                            }
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                        >
                            <option value="LOCAL">
                                Active
                            </option>

                            <option value="INTERNATIONAL">
                                Inactive
                            </option>
                        </select>
                    </div>

                    {/* Sub Category Name */}
                    <div>
                        <label
                            htmlFor="category-name"
                            className="mb-2 block text-sm font-medium"
                        >
                            Sub Category Name{' '}
                            <span className="text-destructive">
                                *
                            </span>
                        </label>

                        <input
                            id="category-name"
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


                    {/* Des */}
                    <div className='col-span-2'>
                        <label
                            htmlFor="category-des"
                            className="mb-2 block text-sm font-medium"
                        >
                            Description{' '}
                            <span className="text-destructive">
                                *
                            </span>
                        </label>

                        <input
                            id="category-des"
                            type="text"
                            value={des}
                            onChange={(
                                event,
                            ) =>
                                setDes(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            placeholder="Enter product name"
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                        />
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