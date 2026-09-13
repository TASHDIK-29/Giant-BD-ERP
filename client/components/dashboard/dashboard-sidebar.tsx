
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, LogOut } from 'lucide-react';
import { useState } from 'react';

import {
    navigationGroups,
    standaloneNavigationItems,
} from '@/constants/navigation';
import { useLogout } from '@/features/auth/hooks';
import Image from 'next/image';
import { useAuth } from '@/features/auth/auth-provider';

export function DashboardSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const { session } = useAuth();

    const logoutMutation = useLogout();

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
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

        return pathname === href || pathname.startsWith(`${href}/`);
    };

    return (
        <aside className="fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r bg-background">
            {/* Logo */}
            <div className="flex h-20 shrink-0 justify-center items-center px-6">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-3"
                >
                    <Image src={'/logo.webp'} alt='logo' width={100} height={100} />
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-5">
                <div className="space-y-2">
                    {navigationGroups.map((group) => {
                        const GroupIcon = group.icon;
                        const isOpen = openGroups[group.title];

                        const groupActive = group.items.some((item) =>
                            isItemActive(item.href)
                        );

                        return (
                            <div key={group.title}>
                                <button
                                    type="button"
                                    onClick={() => toggleGroup(group.title)}
                                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${groupActive
                                        ? 'bg-[#476AB8] text-white'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                >
                                    <span className="flex items-center gap-3">
                                        <span className='p-2 border border-slate-300 bg-white rounded-xl'><GroupIcon className="size-5 text-[#476AB8]" /></span>
                                        {group.title}
                                    </span>

                                    <ChevronDown
                                        className={`size-4 transition-transform ${isOpen ? 'rotate-180' : ''
                                            }`}
                                    />
                                </button>

                                {isOpen && (
                                    <div className="mt-1 space-y-1 pl-3">
                                        {group.items.map((item) => {
                                            const ItemIcon = item.icon;
                                            const active = isItemActive(item.href);

                                            return (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${active
                                                        ? 'bg-[#476AB8] text-primary-foreground'
                                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                        }`}
                                                >
                                                    {/* <ItemIcon className="size-4 shrink-0 text-blue-600" /> */}
                                                    <span>{item.title}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Standalone navigation */}
                    {/* <div className="my-3 border-t" /> */}

                    <div className="space-y-1">
                        {standaloneNavigationItems.map((item) => {
                            const ItemIcon = item.icon;
                            const active = isItemActive(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${active
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                >
                                    <span className='p-2 border border-slate-300 rounded-xl'><ItemIcon className="size-5 shrink-0 text-blue-600" /></span>
                                    <span>{item.title}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* Logout */}
            <div className="shrink-0 border-t p-3">

                <div className='bg-[#476AB8] rounded-lg flex items-center gap-4 px-4 py-2 text-white'>

                    <div className='flex-1 flex items-center gap-2'>
                        <span className='px-3 py-2  rounded-full bg-[#99b0e2]'>
                            {
                                session?.user?.name.trim()[0]
                            }
                        </span>
                        <div>
                            <h1>
                                {session?.user?.name}
                            </h1>
                            <h1 className='text-gray-300'>
                                {session?.user?.email}
                            </h1>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={logoutMutation.isPending}
                        className=""
                    >
                        <LogOut className="size-5 text-white" />
                    </button>
                </div>
            </div>
        </aside>
    );
}

