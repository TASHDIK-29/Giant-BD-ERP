'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  useDashboardHeader,
} from '@/components/dashboard/dashboard-header-context';
import { useMasterProduct } from '@/features/master-products/hooks';
import { MasterProductTable } from '@/features/master-products/components/master-product-table';
import { MasterProductPagination } from '@/features/master-products/components/master-product-pagination';
// import { useRacks } from '@/features/racks/hooks';
// import { RacksTable } from '@/features/racks/components/rack-table';
// import { RacksPagination } from '@/features/racks/components/rack-pagination';

export default function MasterProductPage() {
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
  } = useMasterProduct(
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

  const masterProducts =
    data?.data ?? [];

  // console.log({masterProducts});
  
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border bg-background">
        <MasterProductTable
          masterProducts={
            masterProducts
          }
          isFetching={
            isFetching
          }
          emptyMessage="No materials found."
        />
      </div>

      {meta && masterProducts.length > 10 && (
        <MasterProductPagination
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