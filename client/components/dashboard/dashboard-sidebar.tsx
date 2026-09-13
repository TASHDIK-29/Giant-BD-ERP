'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    ChevronDown,
    LogOut,
} from 'lucide-react';
import { useState } from 'react';

import {
    navigationGroups,
    standaloneNavigationItems,
} from '@/constants/navigation';

import { useLogout } from '@/features/auth/hooks';
import { useAuth } from '@/features/auth/auth-provider';

interface DashboardSidebarProps {
    collapsed: boolean;
}

export function DashboardSidebar({
    collapsed,
}: DashboardSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const { session } = useAuth();

    const logoutMutation = useLogout();

    const [openGroups, setOpenGroups] = useState<
        Record<string, boolean>
    >({
        Warehouse: true,
        Product: false,
        CRM: false,
        Attribute: false,
    });

    const toggleGroup = (groupName: string) => {
        setOpenGroups((current) => ({
            ...Object.keys(current).reduce(
                (acc, key) => {
                    acc[key] = false;
                    return acc;
                },
                {} as Record<string, boolean>,
            ),
            [groupName]: !current[groupName],
        }));
    };

    const closeAllGroups = () => {
        setOpenGroups({
            Warehouse: false,
            Product: false,
            CRM: false,
            Attribute: false,
        });
    };

    const handleLogout = async () => {
        try {
            await logoutMutation.mutateAsync();
        } finally {
            router.replace('/login');
            router.refresh();
        }
    };

    const isItemActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard';
        }

        return (
            pathname === href ||
            pathname.startsWith(`${href}/`)
        );
    };

    const userName = session?.user?.name ?? '';
    const userEmail = session?.user?.email ?? '';

    const userInitial = userName
        .trim()
        .charAt(0)
        .toUpperCase();

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-40 flex flex-col overflow-hidden border-r bg-background transition-all duration-300 ${collapsed
                ? 'w-20'
                : 'w-72'
                }`}
        >
            <div
                className={`flex h-full flex-col ${collapsed ? 'w-20' : 'w-72'
                    }`}
            >
                {/* ================================================== */}
                {/* Logo */}
                {/* ================================================== */}

                <div
                    className={`flex h-20 shrink-0 items-center ${collapsed
                        ? 'justify-center px-2'
                        : 'justify-center px-6'
                        }`}
                >
                    <Link
                        href="/dashboard"
                        className="flex items-center justify-center"
                    >
                        {collapsed ? (
                            // Tiny logo
                            <Image
                                src="/logo-small.webp"
                                alt="Giant BD ERP"
                                width={22}
                                height={34}
                                priority
                                className="object-contain"
                            />
                        ) : (
                            // Full logo
                            <Image
                                src="/logo.webp"
                                alt="Giant BD ERP"
                                width={100}
                                height={100}
                                priority
                                className="object-contain"
                            />
                        )}
                    </Link>
                </div>

                {/* ================================================== */}
                {/* Navigation */}
                {/* ================================================== */}

                <nav className="flex-1 overflow-y-auto px-3 py-5">
                    <div className="space-y-2">
                        {navigationGroups.map((group) => {
                            const GroupIcon = group.icon;

                            const isOpen =
                                openGroups[group.title];

                            const groupActive =
                                group.items.some((item) =>
                                    isItemActive(
                                        item.href,
                                    ),
                                );

                            return (
                                <div
                                    key={group.title}
                                >
                                    {/* Group */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            toggleGroup(
                                                group.title,
                                            )
                                        }
                                        title={
                                            collapsed
                                                ? group.title
                                                : undefined
                                        }
                                        className={`flex w-full items-center rounded-lg text-sm font-medium transition-colors ${collapsed
                                            ? 'justify-center px-2 py-2'
                                            : 'justify-between px-3 py-2.5'
                                            } ${groupActive
                                                ? 'bg-[#476AB8] text-white'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                            }`}
                                    >
                                        <span
                                            className={`flex items-center ${collapsed
                                                ? 'justify-center'
                                                : 'gap-3'
                                                }`}
                                        >
                                            <span className="rounded-xl border border-slate-300 bg-white p-2">
                                                <GroupIcon className="size-5 text-[#476AB8]" />
                                            </span>

                                            {/* Hide title when collapsed */}
                                            {!collapsed && (
                                                <span>
                                                    {
                                                        group.title
                                                    }
                                                </span>
                                            )}
                                        </span>

                                        {/* Hide chevron when collapsed */}
                                        {!collapsed && (
                                            <ChevronDown
                                                className={`size-4 transition-transform ${isOpen
                                                    ? 'rotate-180'
                                                    : ''
                                                    }`}
                                            />
                                        )}
                                    </button>

                                    {/* ================================================== */}
                                    {/* Group Items */}
                                    {/* ================================================== */}

                                    {isOpen && (
                                        <div
                                            className={`mt-1 space-y-1 ${collapsed
                                                ? 'pl-0'
                                                : 'pl-3'
                                                }`}
                                        >
                                            {group.items.map(
                                                (item) => {
                                                    const ItemIcon =
                                                        item.icon;

                                                    const active =
                                                        isItemActive(
                                                            item.href,
                                                        );

                                                    return (
                                                        <Link
                                                            key={
                                                                item.href
                                                            }
                                                            href={
                                                                item.href
                                                            }
                                                            title={
                                                                collapsed
                                                                    ? item.title
                                                                    : undefined
                                                            }
                                                            className={`flex items-center rounded-lg text-sm transition-colors ${collapsed
                                                                ? 'justify-center px-2 py-2.5'
                                                                : 'gap-3 px-3 py-2.5'
                                                                } ${active
                                                                    ? 'bg-[#476AB8] text-primary-foreground'
                                                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                                }`}
                                                        >
                                                            {/* Show icon */}
                                                            <ItemIcon
                                                                className={`size-5 shrink-0 ${
                                                                    active
                                                                        ? 'text-white'
                                                                        : 'text-blue-600'
                                                                }`}
                                                            />

                                                            {/* Hide title */}
                                                            {!collapsed && (
                                                                <span>
                                                                    {
                                                                        item.title
                                                                    }
                                                                </span>
                                                            )}
                                                        </Link>
                                                    );
                                                },
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* ================================================== */}
                        {/* Standalone Navigation */}
                        {/* ================================================== */}

                        <div className="space-y-1">
                            {standaloneNavigationItems.map(
                                (item) => {
                                    const ItemIcon =
                                        item.icon;

                                    const active =
                                        isItemActive(
                                            item.href,
                                        );

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={closeAllGroups}
                                            title={
                                                collapsed
                                                    ? item.title
                                                    : undefined
                                            }
                                            className={`flex items-center rounded-lg text-sm transition-colors ${collapsed
                                                ? 'justify-center px-2 py-2'
                                                : 'gap-3 px-3 py-2.5'
                                                } ${active
                                                    ? 'bg-[#476AB8] text-primary-foreground'
                                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                }`}
                                        >
                                            <span className="rounded-xl border border-slate-300 bg-white p-2">
                                                <ItemIcon
                                                    className={`size-5 shrink-0 ${active
                                                        ? 'text-[#476AB8]'
                                                        : 'text-blue-600'
                                                        }`}
                                                />
                                            </span>

                                            {/* Hide title */}
                                            {!collapsed && (
                                                <span>
                                                    {
                                                        item.title
                                                    }
                                                </span>
                                            )}
                                        </Link>
                                    );
                                },
                            )}
                        </div>
                    </div>
                </nav>

                {/* ================================================== */}
                {/* User / Logout */}
                {/* ================================================== */}

                <div className="shrink-0 border-t p-3">
                    <div
                        className={`rounded-lg bg-[#476AB8] text-white ${collapsed
                            ? 'flex justify-center px-2 py-2'
                            : 'flex items-center gap-4 px-4 py-2'
                            }`}
                    >
                        {/* User */}
                        <div
                            className={`min-w-0 ${collapsed
                                ? 'flex justify-center'
                                : 'flex flex-1 items-center gap-2'
                                }`}
                        >
                            {/* Avatar */}
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#99b0e2] text-sm font-medium uppercase">
                                {userInitial}
                            </span>

                            {/* User information */}
                            {!collapsed && (
                                <div className="min-w-0">
                                    <h1 className="truncate text-sm font-medium">
                                        {userName}
                                    </h1>

                                    <h1 className="truncate text-xs text-gray-300">
                                        {userEmail}
                                    </h1>
                                </div>
                            )}
                        </div>

                        {/* Logout - hidden when collapsed */}
                        {!collapsed && (
                            <button
                                type="button"
                                onClick={handleLogout}
                                disabled={
                                    logoutMutation.isPending
                                }
                                className="shrink-0 rounded-md p-1 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label="Logout"
                            >
                                <LogOut className="size-5 text-white" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
}