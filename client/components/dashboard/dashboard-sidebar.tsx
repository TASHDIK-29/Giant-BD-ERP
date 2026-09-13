// ```tsx
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

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const logoutMutation = useLogout();

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Warehouse: true,
    Product: true,
    CRM: true,
    Attribute: true,
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
      <div className="flex h-20 shrink-0 items-center border-b px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-3"
        >
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <span className="text-lg font-bold">G</span>
          </div>

          <div>
            <p className="text-base font-semibold leading-none">
              Giant BD ERP
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Inventory Management
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-2">
          {navigationGroups.map((group) => {
            const GroupIcon = group.icon;
            const isOpen = openGroups[group.title];

            return (
              <div key={group.title}>
                <button
                  type="button"
                  onClick={() => toggleGroup(group.title)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <span className="flex items-center gap-3">
                    <GroupIcon className="size-4" />
                    {group.title}
                  </span>

                  <ChevronDown
                    className={`size-4 transition-transform ${
                      isOpen ? 'rotate-180' : ''
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
                          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                            active
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                        >
                          <ItemIcon className="size-4 shrink-0" />
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
          <div className="my-3 border-t" />

          <div className="space-y-1">
            {standaloneNavigationItems.map((item) => {
              const ItemIcon = item.icon;
              const active = isItemActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <ItemIcon className="size-4 shrink-0" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Logout */}
      <div className="shrink-0 border-t p-3">
        <button
          type="button"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogOut className="size-4" />

          <span>
            {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
          </span>
        </button>
      </div>
    </aside>
  );
}
// ```
