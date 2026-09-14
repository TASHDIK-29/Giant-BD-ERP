'use client';

import {
    useEffect,
    useState,
} from 'react';

import {
    useDashboardHeader,
} from '@/components/dashboard/dashboard-header-context';
import { useColors } from '@/features/colors/hooks';
import { ColorTable } from '@/features/colors/components/color-table';
import { ColorPagination } from '@/features/colors/components/color-pagination';
// import { useMaterials } from '@/features/materials/hooks';
// import { MaterialTable } from '@/features/materials/components/material-table';
// import { MaterialPagination } from '@/features/materials/components/material-pagination';


export default function ColorPage() {
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
    } = useColors(
        {
            page,
            limit,

            // type: 'CATEGORY',

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
                Loading colors...
            </div>
        );
    }

    const colors =
        data?.data ?? [];

    const meta = data?.meta;

    return (
        <div className="space-y-5">
            <div className="rounded-xl border bg-background">
                <ColorTable
                    colors={
                        colors
                    }
                    isFetching={
                        isFetching
                    }
                    emptyMessage="No materials found."
                />
            </div>

            {meta && colors.length > 10 && (
                <ColorPagination
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