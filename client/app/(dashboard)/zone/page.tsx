'use client';

import {
    useEffect,
    useState,
} from 'react';

import {
    useDashboardHeader,
} from '@/components/dashboard/dashboard-header-context';
import { useZone } from '@/features/zones/hooks';
import { ZonePagination } from '@/features/zones/components/zone-pagination';
import { ZonesTable } from '@/features/zones/components/zone-table';
// import { useWarehouse } from '@/features/warehouse/hooks';
// import { WarehouseTable } from '@/features/warehouse/components/warehouse-table';
// import { WarehousePagination } from '@/features/warehouse/components/warehouse-pagination';
// import { useColors } from '@/features/colors/hooks';
// import { ColorTable } from '@/features/colors/components/color-table';
// import { ColorPagination } from '@/features/colors/components/color-pagination';


export default function ZonePage() {
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
    } = useZone(
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
                Loading warehouse...
            </div>
        );
    }

    const zones =
        data?.data ?? [];

    const meta = data?.meta;

    return (
        <div className="space-y-5">
            <div className="rounded-xl border bg-background">
                <ZonesTable
                    zones={
                        zones
                    }
                    isFetching={
                        isFetching
                    }
                    emptyMessage="No materials found."
                />
            </div>

            {meta && zones.length > 10 && (
                <ZonePagination
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