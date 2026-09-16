'use client';

import {
    ChevronDown,
    ChevronUp,
    Loader2,
    Plus,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
    useCreatePermissionGroup,
    usePermissionGroups,
} from '@/features/permissions/hooks';

export default function NewPermissionGroupPage() {
    const router = useRouter();

    const [groupName, setGroupName] = useState('');
    const [selectedActions, setSelectedActions] =
        useState<string[]>([]);

    const [customOperation, setCustomOperation] =
        useState('');

    const [customActions, setCustomActions] =
        useState<string[]>([]);

    const [isExpanded, setIsExpanded] =
        useState(true);

    const [error, setError] = useState('');

    /*
     * Load existing permission groups.
     *
     * We only need the existing actions from these groups.
     */
    const {
        data,
        isLoading,
        isError,
    } = usePermissionGroups({
        page: 1,
        limit: 100,
    });

    const createPermissionGroupMutation =
        useCreatePermissionGroup();

    const permissionGroups = data?.data ?? [];

    /*
     * Extract all unique actions from existing
     * permission groups.
     *
     * Example:
     *
     * [
     *   "create",
     *   "read",
     *   "update",
     *   "delete",
     *   "watch",
     *   "status"
     * ]
     */
    const existingActions = useMemo(() => {
        const actionSet = new Set<string>();

        permissionGroups.forEach((group) => {
            group.permissions.forEach(
                (permission) => {
                    actionSet.add(
                        permission.action!,
                    );
                },
            );
        });

        return Array.from(actionSet).sort(
            (a, b) =>
                a.localeCompare(b),
        );
    }, [permissionGroups]);

    /*
     * Combine existing actions + custom actions.
     *
     * Set removes duplicates.
     */
    const allActions = useMemo(() => {
        return Array.from(
            new Set([
                ...existingActions,
                ...customActions,
            ]),
        );
    }, [
        existingActions,
        customActions,
    ]);

    /*
     * Toggle an action.
     */
    const handleActionToggle = (
        action: string,
    ) => {
        setSelectedActions(
            (previous) => {
                if (
                    previous.includes(action)
                ) {
                    return previous.filter(
                        (item) =>
                            item !== action,
                    );
                }

                return [
                    ...previous,
                    action,
                ];
            },
        );
    };

    /*
     * Add custom operation.
     */
    const handleAddCustomOperation = () => {
        const action =
            customOperation.trim();

        if (!action) {
            return;
        }

        /*
         * Convert custom operation to lower case
         * because actions/keys are normally
         * normalized this way.
         */
        const normalizedAction =
            action.toLowerCase();

        /*
         * Don't add duplicates.
         */
        if (
            allActions.includes(
                normalizedAction,
            )
        ) {
            /*
             * If it already exists, simply select it.
             */
            if (
                !selectedActions.includes(
                    normalizedAction,
                )
            ) {
                setSelectedActions(
                    (previous) => [
                        ...previous,
                        normalizedAction,
                    ],
                );
            }

            setCustomOperation('');
            return;
        }

        setCustomActions(
            (previous) => [
                ...previous,
                normalizedAction,
            ],
        );

        setSelectedActions(
            (previous) => [
                ...previous,
                normalizedAction,
            ],
        );

        setCustomOperation('');
    };

    /*
     * Remove a custom operation.
     */
    const handleRemoveCustomAction = (
        action: string,
    ) => {
        setCustomActions(
            (previous) =>
                previous.filter(
                    (item) =>
                        item !== action,
                ),
        );

        setSelectedActions(
            (previous) =>
                previous.filter(
                    (item) =>
                        item !== action,
                ),
        );
    };

    /*
     * Submit.
     */
    const handleSubmit = (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        setError('');

        const name =
            groupName.trim();

        if (!name) {
            setError(
                'Group name is required.',
            );
            return;
        }

        if (
            selectedActions.length ===
            0
        ) {
            setError(
                'Please select at least one permission.',
            );
            return;
        }

        /*
         * Key is automatically generated
         * from group name.
         *
         * Example:
         *
         * Buyer      -> buyer
         * Sales Team -> sales-team
         */
        const key = name
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-');

        createPermissionGroupMutation.mutate(
            {
                name,
                key,
                actions: selectedActions,
            },
            {
                onSuccess: () => {
                    router.push(
                        '/permission',
                    );
                },

                onError: (
                    error: any,
                ) => {
                    setError(
                        error?.response
                            ?.data
                            ?.message ||
                            'Failed to create permission group.',
                    );
                },
            },
        );
    };

    /*
     * Reset form.
     */
    const handleReset = () => {
        setGroupName('');
        setSelectedActions([]);
        setCustomOperation('');
        setCustomActions([]);
        setError('');
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-5"
        >
            {/* ================================================= */}
            {/* PERMISSION GROUP INFORMATION */}
            {/* ================================================= */}

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {/* Header */}

                <button
                    type="button"
                    onClick={() =>
                        setIsExpanded(
                            (previous) =>
                                !previous,
                        )
                    }
                    className="flex h-[53px] w-full items-center justify-between border-b border-slate-200 border-l-4 border-l-blue-600 px-3 text-left"
                >
                    <span className="text-sm font-semibold text-slate-800">
                        Permission Group
                        Information
                    </span>

                    {isExpanded ? (
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

                {isExpanded && (
                    <div className="px-4 pb-4 pt-4">
                        {/* ================================= */}
                        {/* GROUP NAME */}
                        {/* ================================= */}

                        <div className="max-w-[375px]">
                            <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                Group Name
                                (Module Name)
                            </label>

                            <input
                                type="text"
                                value={
                                    groupName
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setGroupName(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                placeholder="Enter group name"
                                maxLength={100}
                                className="h-8 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        {/* ================================= */}
                        {/* PERMISSIONS */}
                        {/* ================================= */}

                        <div className="mt-5">
                            <label className="mb-2 block text-xs font-semibold text-slate-800">
                                Permissions
                            </label>

                            {isLoading ? (
                                <div className="flex h-24 items-center justify-center">
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Loader2
                                            size={
                                                15
                                            }
                                            className="animate-spin"
                                        />
                                        Loading
                                        permissions...
                                    </div>
                                </div>
                            ) : isError ? (
                                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-3 text-xs text-red-600">
                                    Failed to
                                    load
                                    existing
                                    permissions.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                                    {allActions.map(
                                        (
                                            action,
                                        ) => {
                                            const isSelected =
                                                selectedActions.includes(
                                                    action,
                                                );

                                            const isCustom =
                                                customActions.includes(
                                                    action,
                                                );

                                            return (
                                                <div
                                                    key={
                                                        action
                                                    }
                                                    className={`flex h-[38px] items-center justify-between rounded-lg border px-3 transition ${
                                                        isSelected
                                                            ? 'border-blue-200 bg-blue-50'
                                                            : 'border-slate-200 bg-slate-50'
                                                    }`}
                                                >
                                                    <label className="flex min-w-0 cursor-pointer items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                isSelected
                                                            }
                                                            onChange={() =>
                                                                handleActionToggle(
                                                                    action,
                                                                )
                                                            }
                                                            className="h-3.5 w-3.5 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                        />

                                                        <span className="truncate text-xs font-medium capitalize text-slate-700">
                                                            {
                                                                action
                                                            }
                                                        </span>
                                                    </label>

                                                    {isCustom && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleRemoveCustomAction(
                                                                    action,
                                                                )
                                                            }
                                                            className="ml-2 text-slate-400 hover:text-red-500"
                                                            title="Remove custom operation"
                                                        >
                                                            <X
                                                                size={
                                                                    13
                                                                }
                                                            />
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        },
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ================================= */}
                        {/* CUSTOM OPERATION */}
                        {/* ================================= */}

                        <div className="mt-4">
                            <label className="mb-2 block text-xs font-medium text-slate-700">
                                Custom Operation
                            </label>

                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={
                                        customOperation
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setCustomOperation(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    onKeyDown={(
                                        event,
                                    ) => {
                                        if (
                                            event.key ===
                                            'Enter'
                                        ) {
                                            event.preventDefault();

                                            handleAddCustomOperation();
                                        }
                                    }}
                                    placeholder="Enter custom operation"
                                    maxLength={
                                        50
                                    }
                                    className="h-8 w-[218px] rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />

                                <button
                                    type="button"
                                    onClick={
                                        handleAddCustomOperation
                                    }
                                    className="flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                                >
                                    <Plus
                                        size={
                                            13
                                        }
                                    />

                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* ================================================= */}
            {/* ERROR */}
            {/* ================================================= */}

            {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                    {error}
                </div>
            )}

            {/* ================================================= */}
            {/* BOTTOM ACTION BAR */}
            {/* ================================================= */}

            <section className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                <div className="flex justify-end gap-2">
                    {/* Cancel */}

                    <button
                        type="button"
                        onClick={() =>
                            router.push(
                                '/permission',
                            )
                        }
                        disabled={
                            createPermissionGroupMutation.isPending
                        }
                        className="h-9 rounded-md px-12 bg-red-600 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    {/* Reset */}

                    <button
                        type="button"
                        onClick={
                            handleReset
                        }
                        disabled={
                            createPermissionGroupMutation.isPending
                        }
                        className="h-9 rounded-md px-12 border border-amber-400 bg-white text-xs font-semibold text-amber-600 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Reset
                    </button>

                    {/* Create */}

                    <button
                        type="submit"
                        disabled={
                            createPermissionGroupMutation.isPending
                        }
                        className="flex h-9 px-12 items-center justify-center gap-2 rounded-md bg-[#476AB8] text-xs font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {createPermissionGroupMutation.isPending && (
                            <Loader2
                                size={14}
                                className="animate-spin"
                            />
                        )}

                        Create
                    </button>
                </div>
            </section>
        </form>
    );
}