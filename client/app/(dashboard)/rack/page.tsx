'use client';

import {
    useEffect,
    useState,
} from 'react';

import {
    useDashboardHeader,
} from '@/components/dashboard/dashboard-header-context';
import { useRacks } from '@/features/racks/hooks';
import { RacksTable } from '@/features/racks/components/rack-table';
import { RacksPagination } from '@/features/racks/components/rack-pagination';
// import { useSubZone } from '@/features/sub-zones/hooks';
// import { SubZonePagination } from '@/features/sub-zones/components/sub-zone-pagination';
// import { SubZonesTable } from '@/features/sub-zones/components/sub-zone-table';

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
    } = useRacks(
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

    const racks =
        data?.data ?? [];

    const meta = data?.meta;

    return (
        <div className="space-y-5">
            <div className="rounded-xl border bg-background">
                <RacksTable
                    racks={
                        racks
                    }
                    isFetching={
                        isFetching
                    }
                    emptyMessage="No materials found."
                />
            </div>

            {meta && racks.length > 10 && (
                <RacksPagination
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