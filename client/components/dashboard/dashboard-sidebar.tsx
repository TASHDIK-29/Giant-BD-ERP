


'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, LogOut } from 'lucide-react';
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
            ...current,
            [groupName]: !current[groupName],
        }));
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
                ? 'w-0 border-r-0'
                : 'w-72'
                }`}
        >
            <div className="flex h-full w-72 flex-col">
                {/* Logo */}
                <div className="flex h-20 shrink-0 items-center justify-center px-6">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3"
                    >
                        <Image
                            src="/logo.webp"
                            alt="Giant BD ERP"
                            width={100}
                            height={100}
                            priority
                        />
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-5">
                    <div className="space-y-2">
                        {navigationGroups.map((group) => {
                            const GroupIcon = group.icon;

                            const isOpen =
                                openGroups[group.title];

                            const groupActive =
                                group.items.some((item) =>
                                    isItemActive(item.href),
                                );

                            return (
                                <div key={group.title}>
                                    {/* Group */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            toggleGroup(
                                                group.title,
                                            )
                                        }
                                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${groupActive
                                            ? 'bg-[#476AB8] text-white'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                            }`}
                                    >
                                        <span className="flex items-center gap-3">
                                            <span className="rounded-xl border border-slate-300 bg-white p-2">
                                                <GroupIcon className="size-5 text-[#476AB8]" />
                                            </span>

                                            <span>
                                                {group.title}
                                            </span>
                                        </span>

                                        <ChevronDown
                                            className={`size-4 transition-transform ${isOpen
                                                ? 'rotate-180'
                                                : ''
                                                }`}
                                        />
                                    </button>

                                    {/* Group Items */}
                                    {isOpen && (
                                        <div className="mt-1 space-y-1 pl-3">
                                            {group.items.map(
                                                (item) => {
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
                                                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${active
                                                                ? 'bg-[#476AB8] text-primary-foreground'
                                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                                }`}
                                                        >
                                                            <span>
                                                                {
                                                                    item.title
                                                                }
                                                            </span>
                                                        </Link>
                                                    );
                                                },
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Standalone Navigation */}
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
                                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${active
                                                    ? 'bg-[#476AB8] text-primary-foreground'
                                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                }`}
                                        >
                                            <span className="rounded-xl bg-white border border-slate-300 p-2">
                                                <ItemIcon className="size-5 shrink-0 text-blue-600" />
                                            </span>

                                            <span>
                                                {item.title}
                                            </span>
                                        </Link>

                                        // <Link
                                        //     key={item.href}
                                        //     href={item.href}
                                        //     className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${active
                                        //         ? 'bg-primary text-primary-foreground'
                                        //         : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        //         }`}
                                        // >
                                        //     <span className='p-2 border border-slate-300 rounded-xl'><ItemIcon className="size-5 shrink-0 text-blue-600" /></span>
                                        //     <span>{item.title}</span>
                                        // </Link>
                                    );
                                },
                            )}
                        </div>
                    </div>
                </nav>

                {/* User / Logout */}
                <div className="shrink-0 border-t p-3">
                    <div className="flex items-center gap-4 rounded-lg bg-[#476AB8] px-4 py-2 text-white">
                        {/* User */}
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#99b0e2] text-sm font-medium uppercase">
                                {userInitial}
                            </span>

                            <div className="min-w-0">
                                <h1 className="truncate text-sm font-medium">
                                    {userName}
                                </h1>

                                <h1 className="truncate text-xs text-gray-300">
                                    {userEmail}
                                </h1>
                            </div>
                        </div>

                        {/* Logout */}
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
                    </div>
                </div>
            </div>
        </aside>
    );
}