'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  useDashboardHeader,
} from '@/components/dashboard/dashboard-header-context';
import { useBatchList } from '@/features/batch-list/hooks';
import { BatchListTable } from '@/features/batch-list/components/batch-list-table';
import { BatchListPagination } from '@/features/batch-list/components/batch-list-pagination';

export default function BatchListPage() {
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
  } = useBatchList(
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

  const batchList =
    data?.data ?? [];

  // console.log({masterProducts});
  
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border bg-background">
        <BatchListTable
          batchList={
            batchList
          }
          isFetching={
            isFetching
          }
          emptyMessage="No materials found."
        />
      </div>

      {meta && batchList.length > 10 && (
        <BatchListPagination
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