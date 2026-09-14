'use client';

import {
    useEffect,
    useState,
} from 'react';

import {
    useDashboardHeader,
} from '@/components/dashboard/dashboard-header-context';

import {
    CategoryTable,
} from '@/features/categories/components/category-table';

import {
    CategoryPagination,
} from '@/features/categories/components/category-pagination';

import {
    useCategories,
} from '@/features/categories/hooks';

export default function SubCategoryPage() {
    const {
        searchValue,
        refreshKey,
    } = useDashboardHeader();

    const [page, setPage] =
        useState(1);

    const [limit, setLimit] =
        useState(20);

    const [search, setSearch] =
        useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchValue);
            setPage(1);
        }, 400);

        return () =>
            clearTimeout(timer);
    }, [searchValue]);

    const {
        data,
        isLoading,
        isFetching,
    } = useCategories(
        {
            page,
            limit,

            type: 'SUB_CATEGORY',

            ...(search.trim()
                ? {
                      search:
                          search.trim(),
                  }
                : {}),
        },
        refreshKey,
    );

    if (isLoading) {
        return (
            <div className="rounded-xl border bg-background p-6">
                Loading sub-categories...
            </div>
        );
    }

    const categories =
        data?.data ?? [];

    const meta = data?.meta;

    return (
        <div className="space-y-5">
            <div className="rounded-xl border bg-background">
                <CategoryTable
                    categories={
                        categories
                    }
                    isFetching={
                        isFetching
                    }
                    emptyMessage="No sub-categories found."
                />
            </div>

            {meta && categories.length > 10 && (
                <CategoryPagination
                    page={meta.page}
                    totalPages={
                        meta.totalPages
                    }
                    total={meta.total}
                    limit={meta.limit}
                    onPageChange={
                        setPage
                    }
                    onLimitChange={(
                        newLimit,
                    ) => {
                        setLimit(
                            newLimit,
                        );
                        setPage(1);
                    }}
                />
            )}
        </div>
    );
}