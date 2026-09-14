'use client';

import {
    Eye,
    Pencil,
    Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

import type {
    RoleRecord,
} from '../types';

interface RoleTableProps {
    roles: RoleRecord[];
    isFetching?: boolean;
}

export function RoleTable({
    roles,
}: RoleTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-200 border-collapse">
                <thead>
                    <tr className="border-b bg-muted/40">
                        <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold">
                            ID
                        </th>

                        <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold">
                            Name
                        </th>

                        <th className="whitespace-nowrap px-4 py-3 text-center text-sm font-semibold">
                            Permissions
                        </th>

                        <th className="whitespace-nowrap px-4 py-3 text-center text-sm font-semibold">
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {roles.length === 0 ? (
                        <tr>
                            <td
                                colSpan={4}
                                className="px-4 py-10 text-center text-sm text-muted-foreground"
                            >
                                No roles found.
                            </td>
                        </tr>
                    ) : (
                        roles.map((role) => (
                            <tr
                                key={role.id}
                                className="border-b last:border-0 hover:bg-[#476A8B] hover:text-white"
                            >
                                <td className="whitespace-nowrap px-4 py-3 text-sm">
                                    {role.id}
                                </td>

                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <span className="whitespace-nowrap text-sm font-medium">
                                            {role.name}
                                        </span>

                                        {role.isSystem && (
                                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                                System
                                            </span>
                                        )}
                                    </div>
                                </td>

                                <td className="px-4 py-3 text-center">
                                    <span className="text-sm font-medium">
                                        {
                                            role.permissionCount
                                        }
                                    </span>
                                </td>

                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-1">
                                        {/* View */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 bg-[#F3F8FE]"
                                            title="View"
                                        >
                                            <Eye className="h-4 w-4 text-black" />
                                        </Button>

                                        {/* Edit */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 bg-[#F3F8FE]"
                                            title="Edit"
                                        >
                                            <Pencil className="h-4 w-4 text-black" />
                                        </Button>

                                        {/* Delete */}
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
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}