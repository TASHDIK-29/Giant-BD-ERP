// ```ts
import {
  Boxes,
  Building2,
  CircleUserRound,
  ClipboardList,
  Factory,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Package,
  PackageCheck,
  PackageOpen,
  Palette,
  ShieldCheck,
  Tags,
  UserRound,
  Warehouse,
} from 'lucide-react';
import { ComponentType } from 'react';

export interface NavigationItem {
  title: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  permission?: string;
}

export interface NavigationGroup {
  title: string;
  icon: ComponentType<{ className?: string }>;
  items: NavigationItem[];
}

export const navigationGroups: NavigationGroup[] = [
  {
    title: 'Warehouse',
    icon: Warehouse,
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        permission: 'dashboard:read',
      },
      {
        title: 'Stock In',
        href: '/stock-in',
        icon: PackageCheck,
        permission: 'stock-in:create'
      },
      {
        title: 'Stock Out',
        href: '/stock-out',
        icon: PackageOpen,
        permission: 'stock-out:create'
      },
      {
        title: 'Batch List',
        href: '/batch-list',
        icon: Boxes,
        permission: 'stock-in:read'
      },
      {
        title: 'Stock Out List',
        href: '/stock-out-list',
        icon: ClipboardList,
        permission: 'stock-out:read'
      },
    ],
  },

  {
    title: 'Product',
    icon: Package,
    items: [
      {
        title: 'Master FG Product',
        href: '/master-fg-product',
        icon: Factory,
        permission: 'master-product:read'
      },
      {
        title: 'Variant FG Product',
        href: '/variant-fg-product',
        icon: Tags,
        permission: 'product-variant:read'
      },
    ],
  },

  {
    title: 'CRM',
    icon: CircleUserRound,
    items: [
      {
        title: 'Buyer',
        href: '/buyer',
        icon: UserRound,
        permission: 'buyer:read'
      },
    ],
  },

  {
    title: 'Attribute',
    icon: Palette,
    items: [
      {
        title: 'Category',
        href: '/category',
        icon: Tags,
        permission: 'category:read'
      },
      {
        title: 'Sub Category',
        href: '/sub-category',
        icon: Tags,
        permission: 'category:read'
      },
      {
        title: 'Material',
        href: '/material',
        icon: Boxes,
        permission: 'material:read'
      },
      {
        title: 'Color',
        href: '/color',
        icon: Palette,
        permission: 'color:read'
      },
      {
        title: 'Warehouse',
        href: '/warehouse',
        icon: Warehouse,
        permission: 'warehouse:read'
      },
      {
        title: 'Zone',
        href: '/zone',
        icon: Building2,
        permission: 'zone:read'
      },
      {
        title: 'Sub Zone',
        href: '/sub-zone',
        icon: Building2,
        permission: 'sub-zone:read'
      },
      {
        title: 'Rack',
        href: '/rack',
        icon: Building2,
        permission: 'rack:read'
      },
    ],
  },
];

export const standaloneNavigationItems: NavigationItem[] = [
  {
    title: 'Role',
    href: '/role',
    icon: ShieldCheck,
    permission: 'role:read'
  },
  {
    title: 'Permission',
    href: '/permission',
    icon: KeyRound,
    permission: 'permission:read'
  },
  {
    title: 'User',
    href: '/user',
    icon: UserRound,
    permission: 'user:read'
  },
];
// ```
