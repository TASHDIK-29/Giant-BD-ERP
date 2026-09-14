'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  useDashboardHeader,
} from '@/components/dashboard/dashboard-header-context';
import { useVariantProduct } from '@/features/variant-products/hooks';
import { VariantProductTable } from '@/features/variant-products/components/variant-product-table';
import { VariantProductPagination } from '@/features/variant-products/components/variant-product-pagination';

export default function VariantProductPage() {
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
  } = useVariantProduct(
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
        Loading Variant Product...
      </div>
    );
  }

  // console.log(data);

  const variantProducts =
    data?.data ?? [];

  // console.log({masterProducts});
  
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border bg-background">
        <VariantProductTable
          variantProducts={
            variantProducts
          }
          isFetching={
            isFetching
          }
          emptyMessage="No materials found."
        />
      </div>

      {meta && variantProducts.length > 10 && (
        <VariantProductPagination
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