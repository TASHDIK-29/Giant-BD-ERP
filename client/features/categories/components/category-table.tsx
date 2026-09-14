'use client';

import {
    Eye,
    Pencil,
    Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

import type {
    CategoryRecord,
} from '../types';

interface CategoryTableProps {
    categories: CategoryRecord[];
    isFetching?: boolean;
    emptyMessage?: string;
}

export function CategoryTable({
    categories,
    emptyMessage = 'No categories found.',
}: CategoryTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-225 border-collapse">
                <thead>
                    <tr className="border-b bg-muted/40">
                        {/* Checkbox */}
                        <th className="w-12 px-4 py-3 text-center">
                            <input
                                type="checkbox"
                                aria-label="Select all categories"
                                className="h-4 w-4 rounded border"
                            />
                        </th>

                        {/* ID */}
                        <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold">
                            ID
                        </th>

                        {/* Name */}
                        <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold">
                            Name
                        </th>

                        {/* Description */}
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                            Description
                        </th>

                        {/* Status */}
                        <th className="whitespace-nowrap px-4 py-3 text-center text-sm font-semibold">
                            Status
                        </th>

                        {/* Actions */}
                        <th className="whitespace-nowrap px-4 py-3 text-center text-sm font-semibold">
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {categories.length === 0 ? (
                        <tr>
                            <td
                                colSpan={6}
                                className="px-4 py-10 text-center text-sm text-muted-foreground"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        categories.map(
                            (category) => (
                                <tr
                                    key={
                                        category.id
                                    }
                                    className="border-b last:border-0 hover:bg-[#476A8B] hover:text-white"
                                >
                                    {/* Checkbox */}
                                    <td className="px-4 py-3 text-center">
                                        <input
                                            type="checkbox"
                                            aria-label={`Select ${category.name}`}
                                            className="h-4 w-4 rounded border"
                                        />
                                    </td>

                                    {/* ID */}
                                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                                        {
                                            category.id
                                        }
                                    </td>

                                    {/* Name */}
                                    <td className="px-4 py-3">
                                        <span className="whitespace-nowrap text-sm font-medium">
                                            {
                                                category.name
                                            }
                                        </span>
                                    </td>

                                    {/* Description */}
                                    <td className="max-w-100 px-4 py-3">
                                        <span className="line-clamp-2 text-sm">
                                            {category.description ||
                                                '-'}
                                        </span>
                                    </td>

                                    {/* Status */}
                                    <td className="px-4 py-3 text-center">
                                        <span
                                            className={`inline-flex rounded-sm px-2.5 py-1 text-xs font-medium ${
                                                category.status ===
                                                'ACTIVE'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}
                                        >
                                            {
                                                category.status
                                            }
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 bg-[#F3F8FE]"
                                                title="View"
                                            >
                                                <Eye className="h-4 w-4 text-black" />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 bg-[#F3F8FE]"
                                                title="Edit"
                                            >
                                                <Pencil className="h-4 w-4 text-black" />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive bg-[#F3F8FE]"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4 text-black" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ),
                        )
                    )}
                </tbody>
            </table>
        </div>
    );
}