'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  useDashboardHeader,
} from '@/components/dashboard/dashboard-header-context';
import { useStockOutList } from '@/features/stock-out-list/hooks';
import { StockOutListTable } from '@/features/stock-out-list/components/stock-out-list-table';
import { StockOutListPagination } from '@/features/stock-out-list/components/stock-out-list-pagination';

export default function StockOutListPage() {
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
  } = useStockOutList(
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
        Loading MasterProduct...
      </div>
    );
  }

  // console.log(data);

  const stockOuts =
    data?.data ?? [];

  // console.log({masterProducts});
  
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border bg-background">
        <StockOutListTable
          stockOuts={
            stockOuts
          }
          isFetching={
            isFetching
          }
          emptyMessage="No materials found."
        />
      </div>

      {meta && stockOuts.length > 10 && (
        <StockOutListPagination
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