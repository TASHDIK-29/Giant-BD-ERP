'use client';

import {
    Eye,
    Pencil,
    Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { SubZoneRecord } from '../type';
// import { ZoneRecord } from '../type';
// import { zonesRecord } from '../type';
// import { MaterialsRecord } from '../types';



interface SubZonesTableProps {
    subZones: SubZoneRecord[];
    isFetching?: boolean;
    emptyMessage?: string;
}

export function SubZonesTable({
    subZones,
    emptyMessage = 'No categories found.',
}: SubZonesTableProps) {
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

                        {/* Code */}
                        <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold">
                            Code
                        </th>

                        {/* Warehouse */}
                        <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold">
                            Zone
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
                    {subZones.length === 0 ? (
                        <tr>
                            <td
                                colSpan={6}
                                className="px-4 py-10 text-center text-sm text-muted-foreground"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        subZones.map(
                            (subZone) => (
                                <tr
                                    key={
                                        subZone.id
                                    }
                                    className="border-b last:border-0 hover:bg-[#476A8B] hover:text-white"
                                >
                                    {/* Checkbox */}
                                    <td className="px-4 py-3 text-center">
                                        <input
                                            type="checkbox"
                                            aria-label={`Select ${subZone.name}`}
                                            className="h-4 w-4 rounded border"
                                        />
                                    </td>

                                    {/* ID */}
                                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                                        {
                                            subZone.id
                                        }
                                    </td>

                                    {/* Name */}
                                    <td className="px-4 py-3">
                                        <span className="whitespace-nowrap text-sm font-medium">
                                            {
                                                subZone.name
                                            }
                                        </span>
                                    </td>

                                    {/* Code */}
                                    <td className="max-w-100 px-4 py-3">
                                        <span className="line-clamp-2 text-sm">
                                            {subZone.code}
                                        </span>
                                    </td>

                                    {/* Zone */}
                                    <td className="max-w-100 px-4 py-3">
                                        <span className="line-clamp-2 text-sm">
                                            {subZone?.zone?.name}
                                        </span>
                                    </td>

                                    {/* Description */}
                                    <td className="max-w-100 px-4 py-3">
                                        <span className="line-clamp-2 text-sm">
                                            {subZone.description ||
                                                '-'}
                                        </span>
                                    </td>

                                    {/* Status */}
                                    <td className="px-4 py-3 text-center">
                                        <span
                                            className={`inline-flex rounded-sm px-2.5 py-1 text-xs font-medium ${
                                                subZone.status ===
                                                'ACTIVE'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}
                                        >
                                            {
                                                subZone.status
                                            }
                                            {/* ACTIVE */}
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