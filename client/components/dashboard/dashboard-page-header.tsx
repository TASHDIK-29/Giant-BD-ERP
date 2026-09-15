'use client';

import {
    Download,
    Printer,
    RefreshCw,
    Search,
    Plus,
} from 'lucide-react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
    useDashboardHeader,
} from './dashboard-header-context';

interface PageConfig {
    title: string;
    breadcrumb: string[];
    showSearch?: boolean;
    showDownload?: boolean;
    showRefresh?: boolean;
    showPrint?: boolean;
    showPageSize?: boolean;
    showNew?: boolean;
    newHref?: string; // Optional custom route for + New
}

const pageConfigs: Record<string, PageConfig> = {
    '/dashboard': {
        title: 'Warehouse FG',
        breadcrumb: ['Warehouse', 'Dashboard'],
        showSearch: false,
        showDownload: false,
        showRefresh: true,
        showPrint: false,
        showPageSize: false,
        showNew: false,
    },

    '/stock-in': {
        title: 'Warehouse FG',
        breadcrumb: ['Warehouse', 'Stock In'],
        showSearch: true,
        showDownload: true,
        showRefresh: true,
        showPrint: true,
        showPageSize: true,
        showNew: true,
    },

    '/stock-out': {
        title: 'Warehouse FG',
        breadcrumb: ['Warehouse', 'Stock Out'],
        showSearch: true,
        showDownload: true,
        showRefresh: true,
        showPrint: true,
        showPageSize: true,
        showNew: true,
    },

    '/batch-list': {
        title: 'Warehouse FG',
        breadcrumb: ['Warehouse', 'Batch List'],
        showSearch: true,
        showDownload: true,
        showRefresh: true,
        showPrint: true,
        showPageSize: true,
        showNew: false,
    },

    '/stock-out-list': {
        title: 'Warehouse FG',
        breadcrumb: ['Warehouse', 'Stock Out List'],
        showSearch: true,
        showDownload: true,
        showRefresh: true,
        showPrint: true,
        showPageSize: true,
        showNew: false,
    },

    '/master-fg-product': {
        title: 'Product',
        breadcrumb: ['Product', 'Master FG Product'],
        showSearch: true,
        showDownload: true,
        showRefresh: true,
        showPrint: true,
        showPageSize: true,
        showNew: true,
    },

    '/variant-fg-product': {
        title: 'Product',
        breadcrumb: ['Product', 'Variant FG Product'],
        showSearch: true,
        showDownload: true,
        showRefresh: true,
        showPrint: true,
        showPageSize: true,
        showNew: true,
    },

    '/buyer': {
        title: 'Buyer',
        breadcrumb: ['CRM', 'Buyer'],
        showSearch: true,
        showDownload: true,
        showRefresh: true,
        showPrint: true,
        showPageSize: true,
        showNew: true,
    },

    '/category': {
        title: 'Category',
        breadcrumb: ['Attribute', 'Category'],
        showSearch: true,
        showDownload: true,
        showRefresh: true,
        showPrint: true,
        showPageSize: true,
        showNew: true,
    },

    '/sub-category': {
        title: 'Sub Category',
        breadcrumb: ['Attribute', 'Sub Category'],
        showSearch: true,
        showDownload: true,
        showRefresh: true,
        showPrint: true,
        showPageSize: true,
        showNew: true,
    },

    '/material': {
        title: 'Material',
        breadcrumb: ['Attribute', 'Material'],
        showSearch: true,
        showDownload: true,
        showRefresh: true,
        showPrint: true,
        showPageSize: true,
        showNew: true,
    },

    '/color': {
        title: 'Color',
        breadcrumb: ['Attribute', 'Color'],
        showSearch: true,
        showDownload: true,
        showRefresh: true,
        showPrint: true,
        showPageSize: true,
        showNew: true,
    },

    '/warehouse': {
        title: 'Warehouse',
        breadcrumb: ['Attribute', 'Warehouse'],
        showSearch: true,
        showDownload: true,
        showRefresh: true,
        showPrint: true,
        showPageSize: true,
        showNew: true,
    },

    '/zone': {
        title: 'Zone',
        breadcrumb: ['Attribute', 'Zone'],
        showSearch: true,
        showDownload: true,
        showRefresh: true,
        showPrint: true,
        showPageSize: true,
        showNew: true,
    },

    '/sub-zone': {
        title: 'Sub Zone',
        breadcrumb: ['Attribute', 'Sub Zone'],
        showSearch: true,
        showDownload: true,
        showRefresh: true,
        showPrint: true,
        showPageSize: true,
        showNew: true,
    },

    '/rack': {
        title: 'Rack',
        breadcrumb: ['Attribute', 'Rack'],
        showSearch: true,
        showDownload: true,
        showRefresh: true,
        showPrint: true,
        showPageSize: true,
        showNew: true,
    },

    '/role': {
        title: 'Role',
        breadcrumb: ['Role'],
        showSearch: true,
        showDownload: true,
        showRefresh: true,
        showPrint: true,
        showPageSize: true,
        showNew: true,
    },

    '/permission': {
        title: 'Permission',
        breadcrumb: ['Permission'],
        showSearch: true,
        showDownload: true,
        showRefresh: true,
        showPrint: true,
        showPageSize: true,
        showNew: true,
    },

    '/user': {
        title: 'User',
        breadcrumb: ['User'],
        showSearch: true,
        showDownload: true,
        showRefresh: true,
        showPrint: true,
        showPageSize: true,
        showNew: true,
    },
};

export function DashboardPageHeader() {
    const pathname = usePathname();

    const {
        searchValue,
        setSearchValue,
        triggerRefresh,
    } = useDashboardHeader();

    const config =
        pageConfigs[pathname] ?? {
            title: 'Dashboard',
            breadcrumb: ['Dashboard'],
        };

    // Computes target URL dynamically (e.g. /user -> /user/new, or custom newHref)
    const newTargetHref = config.newHref ?? `${pathname}/new`;

    return (
        <div className="rounded-2xl border bg-background px-5 py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                {/* Dynamic left side */}
                <div>
                    <h1 className="text-lg font-semibold">
                        {config.title}
                    </h1>

                    <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        {config.breadcrumb.map(
                            (item, index) => (
                                <span key={item}>
                                    {index > 0 && (
                                        <span className="mx-1">
                                            &gt;
                                        </span>
                                    )}

                                    {item}
                                </span>
                            ),
                        )}
                    </div>
                </div>

                {/* Fixed right side */}
                <div className="flex flex-wrap items-center gap-2">

                    {config.showSearch && (
                        <div className="relative">
                            <Input
                                value={searchValue}
                                onChange={(event) =>
                                    setSearchValue(
                                        event.target.value,
                                    )
                                }
                                placeholder={`Search ${config.title.toLowerCase()}...`}
                                className="h-9 w-62.5 border-primary pr-9"
                            />

                            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        </div>
                    )}

                    {config.showDownload && (
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9"
                        >
                            <Download className="h-4 w-4" />
                        </Button>
                    )}

                    {config.showRefresh && (
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9"
                            onClick={triggerRefresh}
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    )}

                    {config.showPrint && (
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9"
                        >
                            <Printer className="h-4 w-4" />
                        </Button>
                    )}

                    {config.showPageSize && (
                        <select
                            defaultValue="20"
                            className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="10">
                                10
                            </option>
                            <option value="20">
                                20
                            </option>
                            <option value="50">
                                50
                            </option>
                            <option value="100">
                                100
                            </option>
                        </select>
                    )}

                    {config.showNew && (
                        <Link href={newTargetHref}>
                            <Button className="h-9 bg-[#476AB8]">
                                <Plus className="mr-1 h-4 w-4" /> New
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}