export const routePermissions: Record<
    string,
    string
> = {
    '/role': 'role:read',
    '/role/new': 'role:create',

    '/permission':
        'permission:read',
    '/permission/new':
        'permission:create',

    '/user': 'user:read',
    '/user/new': 'user:create',

    '/master-fg-product':
        'master-product:read',

    '/master-fg-product/new':
        'master-product:create',

    '/variant-fg-product':
        'product-variant:read',

    '/variant-fg-product/new':
        'product-variant:create',

    '/category': 'category:read',
    '/category/new': 'category:create',

    '/sub-category': 'category:read',
    '/sub-category/new': 'category:create',

    '/material': 'material:read',
    '/material/new': 'material:create',

    '/color': 'color:read',
    '/color/new': 'color:create',

    '/warehouse': 'warehouse:read',
    '/warehouse/new': 'warehouse:create',

    '/zone': 'zone:read',
    '/zone/new': 'zone:create',

    '/sub-zone': 'sub-zone:read',
    '/sub-zone/new': 'sub-zone:create',

    '/rack': 'rack:read',
    '/rack/new': 'rack:create',

};