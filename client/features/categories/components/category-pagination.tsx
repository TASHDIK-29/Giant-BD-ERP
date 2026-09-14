'use client';

import {
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

interface CategoryPaginationProps {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
}

export function CategoryPagination({
    page,
    totalPages,
    total,
    limit,
    onPageChange,
    onLimitChange,
}: CategoryPaginationProps) {
    const start =
        total === 0
            ? 0
            : (page - 1) * limit + 1;

    const end = Math.min(
        page * limit,
        total,
    );

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                Showing {start} to {end} of{' '}
                {total} categories
            </p>

            <div className="flex items-center gap-2">
                <select
                    value={limit}
                    onChange={(event) =>
                        onLimitChange(
                            Number(
                                event.target.value,
                            ),
                        )
                    }
                    className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
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

                <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    disabled={page <= 1}
                    onClick={() =>
                        onPageChange(
                            page - 1,
                        )
                    }
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <span className="whitespace-nowrap text-sm">
                    Page {page} of{' '}
                    {totalPages || 1}
                </span>

                <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    disabled={
                        page >= totalPages
                    }
                    onClick={() =>
                        onPageChange(
                            page + 1,
                        )
                    }
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}