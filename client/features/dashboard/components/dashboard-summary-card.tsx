'use client';

import {
    ArrowDown,
    ArrowUp,
} from 'lucide-react';

interface DashboardSummaryCardProps {
    title: string;
    quantity: number;
    bat: number;
    mas: number;
    variant: number;
    direction: 'in' | 'out';
}

export function DashboardSummaryCard({
    title,
    quantity,
    bat,
    mas,
    variant,
    direction,
}: DashboardSummaryCardProps) {
    const isIn = direction === 'in';

    return (
        <div className="rounded-2xl border bg-background px-4 py-4 shadow-sm">
            <div className="flex items-start justify-between">
                <h3 className="text-sm font-medium">
                    {title}
                </h3>

                {isIn ? (
                    <ArrowUp className="h-4 w-4 text-green-500" />
                ) : (
                    <ArrowDown className="h-4 w-4 text-red-500" />
                )}
            </div>

            <div className="mt-8">
                <p className="text-lg font-bold">
                    {quantity.toLocaleString()} Pairs
                </p>

                <p className="text-xs text-muted-foreground">
                    {bat} Bat | {mas} Mas | {variant} Var
                </p>
            </div>
        </div>
    );
}