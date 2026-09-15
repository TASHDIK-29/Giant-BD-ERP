import { api } from '@/lib/axios';

import {
    CreateStockInPayload,
    MasterProduct,
    PaginatedResponse,
    ProductVariant,
    Rack,
    StockInResponse,
    SubZone,
    Warehouse,
    Zone,
} from './types';

async function getAllPages<T>(
    endpoint: string,
): Promise<T[]> {
    const firstResponse =
        await api.get<PaginatedResponse<T>>(
            endpoint,
            {
                params: {
                    page: 1,
                    limit: 100,
                },
            },
        );

    const firstData = firstResponse.data.data;
    const totalPages =
        firstResponse.data.meta.totalPages;

    if (totalPages <= 1) {
        return firstData;
    }

    const remainingRequests = Array.from(
        { length: totalPages - 1 },
        (_, index) =>
            api.get<PaginatedResponse<T>>(
                endpoint,
                {
                    params: {
                        page: index + 2,
                        limit: 100,
                    },
                },
            ),
    );

    const remainingResponses =
        await Promise.all(remainingRequests);

    return [
        ...firstData,
        ...remainingResponses.flatMap(
            (response) => response.data.data,
        ),
    ];
}

export async function getMasterProducts() {
    return getAllPages<MasterProduct>(
        '/products/master',
    );
}

export async function getProductVariants() {
    return getAllPages<ProductVariant>(
        '/products/variants',
    );
}

export async function getWarehouses() {
    return getAllPages<Warehouse>(
        '/warehouses',
    );
}

export async function getZones() {
    return getAllPages<Zone>(
        '/zones',
    );
}

export async function getSubZones() {
    return getAllPages<SubZone>(
        '/sub-zones',
    );
}

export async function getRacks() {
    return getAllPages<Rack>(
        '/racks',
    );
}

export async function createStockIn(
    payload: CreateStockInPayload,
) {
    const response =
        await api.post<StockInResponse>(
            '/stock-in',
            payload,
        );

    return response.data;
}