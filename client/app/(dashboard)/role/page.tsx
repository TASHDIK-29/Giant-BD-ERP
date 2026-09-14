'use client';

import { useEffect, useState } from 'react';

import {
    useDashboardHeader,
} from '@/components/dashboard/dashboard-header-context';

import {
    RoleTable,
} from '@/features/roles/components/role-table';

import {
    RolePagination,
} from '@/features/roles/components/role-pagination';

import {
    useRoles,
} from '@/features/roles/hooks';

export default function RolePage() {
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

    /*
     * Debounce global search.
     */
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchValue);
            setPage(1);
        }, 400);

        return () =>
            clearTimeout(timer);
    }, [searchValue]);

    /*
     * Fetch roles.
     */
    const {
        data,
        isLoading,
        isFetching,
    } = useRoles(
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
                Loading roles...
            </div>
        );
    }

    const roles = data?.data ?? [];
    const meta = data?.meta;

    return (
        <div className="space-y-5">
            <div className="rounded-xl border bg-background">
                <RoleTable
                    roles={roles}
                    isFetching={
                        isFetching
                    }
                />
            </div>

            {meta && roles.length > 10 && (
                <RolePagination
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