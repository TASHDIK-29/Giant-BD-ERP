'use client';

import {
    Eye,
    Pencil,
    Trash2,
} from 'lucide-react';

import { useRouter } from 'next/navigation';

import type { UserRecord } from '../types';

interface UserTableProps {
    users: UserRecord[];
    isLoading: boolean;
}

export function UserTable({
    users,
    isLoading,
}: UserTableProps) {
    const router = useRouter();

    if (isLoading) {
        return (
            <div className="rounded-xl border bg-background">
                <div className="p-8 text-center text-sm text-muted-foreground">
                    Loading users...
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border bg-background">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-muted/40">
                            <th className="px-5 py-4 text-left font-medium">
                                ID
                            </th>

                            <th className="px-5 py-4 text-left font-medium">
                                Name
                            </th>

                            <th className="px-5 py-4 text-left font-medium">
                                Role
                            </th>

                            <th className="px-5 py-4 text-left font-medium">
                                Gender
                            </th>

                            <th className="px-5 py-4 text-left font-medium">
                                Phone
                            </th>

                            <th className="px-5 py-4 text-left font-medium">
                                Email
                            </th>

                            <th className="px-5 py-4 text-left font-medium">
                                Status
                            </th>

                            <th className="px-5 py-4 text-center font-medium">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={8}
                                    className="px-5 py-12 text-center text-muted-foreground"
                                >
                                    No users found.
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr
                                    key={user.id}
                                    className="border-b last:border-b-0 hover:bg-[#476A8B] hover:text-white"
                                >
                                    {/* ID */}
                                    <td className="px-5 py-4 font-medium">
                                        {user.id}
                                    </td>

                                    {/* Name */}
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">

                                            <span className="font-medium">
                                                {user.name}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Role */}
                                    <td className="px-5 py-4">
                                        {user.role?.name ??
                                            '—'}
                                    </td>

                                    {/* Gender */}
                                    <td className="px-5 py-4">
                                        {user.gender ??
                                            '—'}
                                    </td>

                                    {/* Phone */}
                                    <td className="px-5 py-4">
                                        {user.phone ??
                                            '—'}
                                    </td>

                                    {/* Email */}
                                    <td className="px-5 py-4">
                                        {user.email}
                                    </td>

                                    {/* Status */}
                                    <td className="px-5 py-4">
                                        <span
                                            className={`inline-flex rounded-sm px-3 py-1 text-xs font-medium ${user.status ===
                                                    'ACTIVE'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}
                                        >
                                            {user.status}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-center gap-1">
                                            {/* View */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    router.push(
                                                        `/user/${user.id}`,
                                                    )
                                                }
                                                title="View"
                                                className="rounded-md bg-[#F3F8FE] p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                            >
                                                <Eye className="size-4" />
                                            </button>

                                            {/* Edit */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    router.push(
                                                        `/user/${user.id}/edit`,
                                                    )
                                                }
                                                title="Edit"
                                                className="rounded-md bg-[#F3F8FE] p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                            >
                                                <Pencil className="size-4" />
                                            </button>

                                            {/* Delete */}
                                            <button
                                                type="button"
                                                title="Delete"
                                                className="rounded-md bg-[#F3F8FE] p-2 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}