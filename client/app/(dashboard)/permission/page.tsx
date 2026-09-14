'use client';

import { useEffect, useState } from 'react';

import {
    useDashboardHeader,
} from '@/components/dashboard/dashboard-header-context';

import {
    PermissionTable,
} from '@/features/permissions/components/permission-table';

import {
    PermissionPagination,
} from '@/features/permissions/components/permission-pagination';

import {
    usePermissionGroups,
} from '@/features/permissions/hooks';

export default function PermissionPage() {
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

    // Debounce global search
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
    } = usePermissionGroups(
        {
            page,
            limit,
            ...(search.trim()
                ? {
                    search: search.trim(),
                }
                : {}),
        },
        refreshKey,
    );

    if (isLoading) {
        return (
            <div className="rounded-xl border bg-background p-6">
                Loading permission groups...
            </div>
        );
    }

    const permissionGroups =
        data?.data ?? [];

    const meta = data?.meta;

    return (
        <div className="space-y-5">
            <div className="rounded-xl border bg-background">
                <PermissionTable
                    permissionGroups={
                        permissionGroups
                    }
                    isFetching={
                        isFetching
                    }
                />
            </div>

            {meta && (
                <PermissionPagination
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