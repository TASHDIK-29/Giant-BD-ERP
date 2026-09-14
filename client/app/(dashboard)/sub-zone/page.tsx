'use client';

import {
    useEffect,
    useState,
} from 'react';

import {
    useDashboardHeader,
} from '@/components/dashboard/dashboard-header-context';
import { useSubZone } from '@/features/sub-zones/hooks';
import { SubZonePagination } from '@/features/sub-zones/components/sub-zone-pagination';
import { SubZonesTable } from '@/features/sub-zones/components/sub-zone-table';
// import { useZone } from '@/features/zones/hooks';
// import { ZonePagination } from '@/features/zones/components/zone-pagination';
// import { ZonesTable } from '@/features/zones/components/zone-table';


export default function SubZonePage() {
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
    } = useSubZone(
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
                Loading sub zones...
            </div>
        );
    }

    const subZones =
        data?.data ?? [];

    const meta = data?.meta;

    return (
        <div className="space-y-5">
            <div className="rounded-xl border bg-background">
                <SubZonesTable
                    subZones={
                        subZones
                    }
                    isFetching={
                        isFetching
                    }
                    emptyMessage="No materials found."
                />
            </div>

            {meta && subZones.length > 10 && (
                <SubZonePagination
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