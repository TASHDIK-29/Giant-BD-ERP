'use client';

import {
    ChevronDown,
    ChevronUp,
    Loader2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { usePermissionGroups } from '@/features/permissions/hooks';
import { useCreateRole } from '@/features/roles/hooks';

interface SelectedPermissions {
    [permissionId: number]: boolean;
}

export default function NewRolePage() {
    const router = useRouter();

    const [roleName, setRoleName] = useState('');
    const [roleInfoOpen, setRoleInfoOpen] =
        useState(true);

    const [selectedPermissions, setSelectedPermissions] =
        useState<SelectedPermissions>({});

    const [error, setError] = useState('');

    const handleReset = () => {
        setRoleName('');
        setSelectedPermissions({});;
        setError('');
    };

    /*
     * Load permission groups.
     *
     * We request a large limit because a role needs access
     * to all existing permissions, not just the first 10.
     */
    const {
        data,
        isLoading: permissionsLoading,
        isError: permissionsError,
    } = usePermissionGroups({
        page: 1,
        limit: 100,
    });

    const createRoleMutation = useCreateRole();

    const permissionGroups = data?.data ?? [];

    console.log(permissionGroups)

    /*
     * Create the columns dynamically.
     *
     * Example:
     *
     * [
     *   "adjust",
     *   "approve",
     *   "challan",
     *   "create",
     *   "delete",
     *   "read",
     *   "watch"
     * ]
     */
    const actions = useMemo(() => {
        const actionSet = new Set<string>();

        permissionGroups.forEach((group) => {
            group.permissions.forEach((permission) => {
                actionSet.add(permission.action!);
            });
        });

        return Array.from(actionSet);
    }, [permissionGroups]);

    /*
     * Find a permission for a particular module + action.
     */
    const getPermission = (
        group: (typeof permissionGroups)[number],
        action: string,
    ) => {
        return group.permissions.find(
            (permission) =>
                permission.action === action,
        );
    };

    /*
     * Toggle one permission.
     */
    const handlePermissionChange = (
        permissionId: number,
        checked: boolean,
    ) => {
        setSelectedPermissions((previous) => ({
            ...previous,
            [permissionId]: checked,
        }));
    };

    /*
     * Submit role.
     */
    const handleSubmit = (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        setError('');

        const trimmedName = roleName.trim();

        if (!trimmedName) {
            setError('Role name is required.');
            return;
        }

        const permissionIds = Object.entries(
            selectedPermissions,
        )
            .filter(([, checked]) => checked)
            .map(([permissionId]) => Number(permissionId));

        createRoleMutation.mutate(
            {
                name: trimmedName,
                permissionIds,
            },
            {
                onSuccess: () => {
                    router.push('/role');
                },

                onError: (error: any) => {
                    setError(
                        error?.response?.data?.message ||
                        'Failed to create role. Please try again.',
                    );
                },
            },
        );
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-5"
        >
            {/* --------------------------------------- */}
            {/* ROLE INFORMATION */}
            {/* --------------------------------------- */}

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {/* Header */}

                <button
                    type="button"
                    onClick={() =>
                        setRoleInfoOpen(
                            (previous) => !previous,
                        )
                    }
                    className="flex w-full items-center justify-between border-l-4 border-l-blue-600 border-b border-slate-200 px-3 py-3 text-left"
                >
                    <span className="text-sm font-semibold text-slate-800">
                        Role Information
                    </span>

                    {roleInfoOpen ? (
                        <ChevronUp
                            size={16}
                            className="text-slate-500"
                        />
                    ) : (
                        <ChevronDown
                            size={16}
                            className="text-slate-500"
                        />
                    )}
                </button>

                {/* Body */}

                {roleInfoOpen && (
                    <div className="px-4 py-5">
                        <div className="max-w-sm">
                            <label
                                htmlFor="role-name"
                                className="mb-2 block text-xs font-medium text-slate-700"
                            >
                                Role Name
                            </label>

                            <input
                                id="role-name"
                                type="text"
                                value={roleName}
                                onChange={(event) =>
                                    setRoleName(
                                        event.target.value,
                                    )
                                }
                                placeholder="Enter role name"
                                maxLength={100}
                                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                )}
            </section>

            {/* --------------------------------------- */}
            {/* PERMISSIONS */}
            {/* --------------------------------------- */}

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {permissionsLoading ? (
                    <div className="flex min-h-62.5 items-center justify-center">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Loader2
                                size={18}
                                className="animate-spin"
                            />
                            Loading permissions...
                        </div>
                    </div>
                ) : permissionsError ? (
                    <div className="flex min-h-62.5 items-center justify-center px-4 text-sm text-red-500">
                        Failed to load permissions.
                    </div>
                ) : permissionGroups.length === 0 ? (
                    <div className="flex min-h-62.5 items-center justify-center text-sm text-slate-500">
                        No permissions available.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-max border-collapse">
                            <thead>
                                <tr className="h-11 bg-slate-50">
                                    {/* Module */}

                                    <th className="sticky left-0 z-20 min-w-41.25 bg-slate-50 px-3 text-left text-xs font-semibold text-slate-800">
                                        Module
                                    </th>

                                    {/* Dynamic actions */}

                                    {actions.map(
                                        (action) => (
                                            <th
                                                key={
                                                    action
                                                }
                                                className="min-w-18.75 whitespace-nowrap px-2 text-center text-xs font-semibold capitalize text-slate-800"
                                            >
                                                {
                                                    action
                                                }
                                            </th>
                                        ),
                                    )}
                                </tr>
                            </thead>

                            <tbody>
                                {permissionGroups.map(
                                    (group) => (
                                        <tr
                                            key={
                                                group.id
                                            }
                                            className="h-10 border-t border-slate-200"
                                        >
                                            {/* Module */}

                                            <td className="sticky left-0 z-10 bg-white px-3 text-xs font-medium text-slate-700">
                                                {
                                                    group.name
                                                }
                                            </td>

                                            {/* Permissions */}

                                            {actions.map(
                                                (
                                                    action,
                                                ) => {
                                                    const permission =
                                                        getPermission(
                                                            group,
                                                            action,
                                                        );

                                                    return (
                                                        <td
                                                            key={`${group.id}-${action}`}
                                                            className="px-2 text-center"
                                                        >
                                                            {permission ? (
                                                                <input
                                                                    type="checkbox"
                                                                    checked={
                                                                        selectedPermissions[
                                                                        permission
                                                                            .id
                                                                        ] ??
                                                                        false
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        handlePermissionChange(
                                                                            permission.id,
                                                                            event
                                                                                .target
                                                                                .checked,
                                                                        )
                                                                    }
                                                                    className="h-3.5 w-3.5 cursor-pointer appearance-none rounded border border-slate-300 bg-white align-middle checked:border-blue-600 checked:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1"
                                                                />
                                                            ) : null}
                                                        </td>
                                                    );
                                                },
                                            )}
                                        </tr>
                                    ),
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* --------------------------------------- */}
            {/* ERROR */}
            {/* --------------------------------------- */}

            {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* --------------------------------------- */}
            {/* ACTIONS */}
            {/* --------------------------------------- */}

            {/* <div className="flex items-center justify-end gap-3">
                <button
                    type="button"
                    onClick={() => router.push('/role')}
                    disabled={
                        createRoleMutation.isPending
                    }
                    className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={
                        createRoleMutation.isPending
                    }
                    className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {createRoleMutation.isPending && (
                        <Loader2
                            size={15}
                            className="animate-spin"
                        />
                    )}

                    Create Role
                </button>
            </div> */}


            {/* Bottom Actions */}
            <div className="flex flex-col-reverse gap-3 rounded-2xl border bg-background p-3 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={() =>
                        router.back()
                    }
                    className="h-10 rounded-md px-12 text-sm font-semibold text-white bg-red-600"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    onClick={
                        handleReset
                    }
                    className="h-10 rounded-md border border-orange-400 px-12 text-sm font-semibold text-orange-500 transition hover:bg-orange-50"
                >
                    Reset
                </button>

                {/* <button
                    type="submit"
                    disabled={
                        createMutation.isPending
                    }
                    className="h-10 rounded-md bg-[#476AB8] px-12 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {createMutation.isPending
                        ? 'Creating...'
                        : 'Create'}
                </button> */}

                <button
                    type="submit"
                    disabled={
                        createRoleMutation.isPending
                    }
                    className="flex items-center gap-2 rounded-md bg-[#476AB8] px-12 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {createRoleMutation.isPending && (
                        <Loader2
                            size={15}
                            className="animate-spin"
                        />
                    )}

                    Create Role
                </button>
            </div>

        </form>
    );
}