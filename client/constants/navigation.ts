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
      },
      {
        title: 'Stock In',
        href: '/stock-in',
        icon: PackageCheck,
      },
      {
        title: 'Stock Out',
        href: '/stock-out',
        icon: PackageOpen,
      },
      {
        title: 'Batch List',
        href: '/batch-list',
        icon: Boxes,
      },
      {
        title: 'Stock Out List',
        href: '/stock-out-list',
        icon: ClipboardList,
      },
    ],
  },

  {
    title: 'Product',
    icon: Package,
    items: [
      {
        title: 'Master FG Product',
        href: '/master-fg-products',
        icon: Factory,
      },
      {
        title: 'Variant FG Product',
        href: '/variant-fg-products',
        icon: Tags,
      },
    ],
  },

  {
    title: 'CRM',
    icon: CircleUserRound,
    items: [
      {
        title: 'Buyer',
        href: '/buyers',
        icon: UserRound,
      },
    ],
  },

  {
    title: 'Attribute',
    icon: Palette,
    items: [
      {
        title: 'Category',
        href: '/categories',
        icon: Tags,
      },
      {
        title: 'Sub Category',
        href: '/sub-categories',
        icon: Tags,
      },
      {
        title: 'Material',
        href: '/materials',
        icon: Boxes,
      },
      {
        title: 'Color',
        href: '/colors',
        icon: Palette,
      },
      {
        title: 'Warehouse',
        href: '/warehouses',
        icon: Warehouse,
      },
      {
        title: 'Zone',
        href: '/zones',
        icon: Building2,
      },
      {
        title: 'Sub Zone',
        href: '/sub-zones',
        icon: Building2,
      },
      {
        title: 'Rack',
        href: '/racks',
        icon: Building2,
      },
    ],
  },
];

export const standaloneNavigationItems: NavigationItem[] = [
  {
    title: 'Role',
    href: '/roles',
    icon: ShieldCheck,
  },
  {
    title: 'Permission',
    href: '/permissions',
    icon: KeyRound,
  },
  {
    title: 'User',
    href: '/users',
    icon: UserRound,
  },
];
// ```
