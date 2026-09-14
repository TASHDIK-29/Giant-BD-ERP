'use client';

import {
    Check,
    Minus,
    Pencil,
    Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

import type {
    PermissionGroup,
} from '../types';

interface PermissionTableProps {
    permissionGroups: PermissionGroup[];
    isFetching?: boolean;
}

function getPermissionActions(
    permissionGroups: PermissionGroup[],
) {
    const actions = new Set<string>();

    permissionGroups.forEach((group) => {
        group.permissions.forEach(
            (permission) => {
                const parts =
                    permission?.name.split(':');

                if (parts.length >= 2) {
                    const action =
                        parts[parts.length - 1];

                    if (action) {
                        actions.add(action);
                    }
                }
            },
        );
    });

    return Array.from(actions).sort();
}

function hasPermission(
    group: PermissionGroup,
    action: string,
) {
    return group.permissions.some(
        (permission) => {
            const parts =
                permission?.name.split(':');

            return (
                parts.length >= 2 &&
                parts[parts.length - 1] ===
                    action
            );
        },
    );
}

export function PermissionTable({
    permissionGroups,
}: PermissionTableProps) {
    const permissionActions =
        getPermissionActions(
            permissionGroups,
        );

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-max border-collapse rounded-t-2xl">
                <thead>
                    <tr className="border-b bg-muted/40">
                        <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold">
                            ID
                        </th>

                        <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold">
                            Module Name
                        </th>

                        {permissionActions.map(
                            (action) => (
                                <th
                                    key={action}
                                    className="whitespace-nowrap px-4 py-3 text-start text-sm font-semibold capitalize"
                                >
                                    {action}
                                </th>
                            ),
                        )}

                        <th className="whitespace-nowrap px-4 py-3 text-center text-sm font-semibold">
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {permissionGroups.length ===
                    0 ? (
                        <tr>
                            <td
                                colSpan={
                                    permissionActions.length +
                                    3
                                }
                                className="px-4 py-10 text-center text-sm text-muted-foreground"
                            >
                                No permission groups
                                found.
                            </td>
                        </tr>
                    ) : (
                        permissionGroups.map(
                            (group) => (
                                <tr
                                    key={group.id}
                                    className="border-b last:border-0 hover:bg-[#476A8B] hover:text-white"
                                >
                                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                                        {group.id}
                                    </td>

                                    <td className="px-4 py-3 ">
                                        <div>
                                            <p className="whitespace-nowrap text-sm font-medium">
                                                {
                                                    group.name
                                                }
                                            </p>

                                            <p className="text-xs text-muted-foreground text-start">
                                                {
                                                    group.key
                                                }
                                            </p>
                                        </div>
                                    </td>

                                    {permissionActions.map(
                                        (action) => {
                                            const exists =
                                                hasPermission(
                                                    group,
                                                    action,
                                                );

                                            return (
                                                <td
                                                    key={
                                                        action
                                                    }
                                                    className="px-4 py-3 text-start text-sm "
                                                >
                                                    {exists ? (
                                                        <span
                                                            title={`${action} permission exists`}
                                                        >
                                                            <Check className='text-green-400'/>
                                                        </span>
                                                    ) : (
                                                        <span className=" text-red-500">
                                                            -
                                                        </span>
                                                    )}
                                                </td>
                                            );
                                        },
                                    )}

                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-1">
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