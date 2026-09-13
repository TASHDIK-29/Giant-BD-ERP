'use client';

import {
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

interface UserPaginationProps {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
}

export function UserPagination({
    page,
    limit,
    total,
    totalPages,
    onPageChange,
    onLimitChange,
}: UserPaginationProps) {
    const start =
        total === 0
            ? 0
            : (page - 1) * limit + 1;

    const end = Math.min(
        page * limit,
        total,
    );

    return (
        <div className="flex flex-col gap-4 rounded-xl border bg-background px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Result information */}
            <p className="text-sm text-muted-foreground">
                Showing{' '}
                <span className="font-medium text-foreground">
                    {start}
                </span>{' '}
                to{' '}
                <span className="font-medium text-foreground">
                    {end}
                </span>{' '}
                of{' '}
                <span className="font-medium text-foreground">
                    {total}
                </span>{' '}
                users
            </p>

            <div className="flex items-center gap-4">
                {/* Limit */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                        Per page
                    </span>

                    <select
                        value={limit}
                        onChange={(event) => {
                            onLimitChange(
                                Number(
                                    event.target
                                        .value,
                                ),
                            );
                        }}
                        className="h-9 rounded-md border bg-background px-2 text-sm outline-none"
                    >
                        <option value={10}>
                            10
                        </option>

                        <option value={20}>
                            20
                        </option>

                        <option value={50}>
                            50
                        </option>

                        <option value={100}>
                            100
                        </option>
                    </select>
                </div>

                {/* Page */}
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        className="size-9"
                        disabled={page <= 1}
                        onClick={() =>
                            onPageChange(
                                page - 1,
                            )
                        }
                    >
                        <ChevronLeft className="size-4" />
                    </Button>

                    <span className="min-w-20 text-center text-sm">
                        Page {page} of{' '}
                        {totalPages || 1}
                    </span>

                    <Button
                        variant="outline"
                        size="icon"
                        className="size-9"
                        disabled={
                            page >= totalPages
                        }
                        onClick={() =>
                            onPageChange(
                                page + 1,
                            )
                        }
                    >
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}