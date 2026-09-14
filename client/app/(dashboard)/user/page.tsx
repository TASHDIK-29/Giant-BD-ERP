'use client';

import { useEffect, useState } from 'react';

import { UserTable } from '@/features/users/components/user-table';
import { UserPagination } from '@/features/users/components/user-pagination';

import { useUsers } from '@/features/users/hooks';
import { useDashboardHeader } from '@/components/dashboard/dashboard-header-context';

export default function UserPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const {
    searchValue,
    refreshKey,
  } = useDashboardHeader();

  /*
   * Small debounce so we don't call the API
   * on every keystroke.
   */
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = useUsers(
    {
      page,
      limit,
      ...(search.trim()
        ? { search: search.trim() }
        : {}),
    },
    refreshKey,
  );

  // console.log('searchValue:', searchValue);
  // console.log('search:', search);

  const users = data?.data ?? [];
  const meta = data?.meta;

  const handleLimitChange = (
    newLimit: number,
  ) => {
    setLimit(newLimit);
    setPage(1);
  };


  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchValue);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchValue]);

  console.log('search:', search);

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-background p-6">
        <p className="text-sm text-destructive">
          Failed to load users.
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          {error instanceof Error
            ? error.message
            : 'Something went wrong.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Table */}
      <UserTable
        users={users}
        isLoading={isLoading}
      />

      {/* Pagination */}
      {meta && users.length > 10 && (
        <UserPagination
          page={meta.page}
          limit={meta.limit}
          total={meta.total}
          totalPages={
            meta.totalPages
          }
          onPageChange={setPage}
          onLimitChange={
            handleLimitChange
          }
        />
      )}
    </div>
  );
}