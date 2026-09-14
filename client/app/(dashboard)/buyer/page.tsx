'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  useDashboardHeader,
} from '@/components/dashboard/dashboard-header-context';
import { useBuyers } from '@/features/buyers/hook';
import { BuyersTable } from '@/features/buyers/components/buyer-table';
import { BuyersPagination } from '@/features/buyers/components/buyer-pagination';

export default function BuyersPage() {
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
  } = useBuyers(
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
        Loading Buyers...
      </div>
    );
  }


  console.log(data)

  const buyers = data ?? [];
  // const buyers =
  //   data?.data ?? [];


  console.log("From Page", { buyers })


  return (
    <div className="space-y-5">
      <div className="rounded-xl border bg-background">
        <BuyersTable
          buyers={
            buyers
          }
          isFetching={
            isFetching
          }
          emptyMessage="No materials found."
        />
      </div>
    </div>
  );
}