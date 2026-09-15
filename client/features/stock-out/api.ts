
import { api } from '@/lib/axios';
import {
    Buyer,
    CreateLetterOfCreditPayload,
    CreatePurchaseOrderPayload,
    CreateStockOutPayload,
    MasterProduct,
    ProductVariant,
    StockInDetailResponse,
    StockInItem,
    StockInListResponse,
} from './types';

/* =========================
   BUYERS
========================= */

export async function getBuyers() {
    const response = await api.get<Buyer[]>(
        '/buyers',
    );

    return response.data;
}

/* =========================
   CREATE LC
========================= */

export async function createLetterOfCredit(
    payload: CreateLetterOfCreditPayload,
) {
    const response =
        await api.post(
            '/buyers/lc',
            payload,
        );

    return response.data;
}

/* =========================
   CREATE PO
========================= */

export async function createPurchaseOrder(
    payload: CreatePurchaseOrderPayload,
) {
    const response =
        await api.post(
            '/buyers/po',
            payload,
        );

    return response.data;
}

/* =========================
   MASTER PRODUCTS
========================= */

export async function getMasterProducts() {
    const response =
        await api.get<{
            data: MasterProduct[];
        }>('/products/master');

    return response.data.data;
}

/* =========================
   VARIANTS
========================= */

export async function getVariants() {
    const response =
        await api.get<{
            data: ProductVariant[];
        }>('/products/variants');

    return response.data.data;
}

/* =========================
   STOCK IN LIST
========================= */

export async function getStockInList() {
    const response =
        await api.get<StockInListResponse>(
            '/stock-in',
            {
                params: {
                    page: 1,
                    limit: 100,
                },
            },
        );

    return response.data;
}

/* =========================
   STOCK IN DETAIL
========================= */

export async function getStockInDetail(
    stockInId: number,
) {
    const response =
        await api.get<StockInDetailResponse>(
            `/stock-in/${stockInId}`,
        );

    return response.data.data;
}

/* =========================
   CREATE STOCK OUT
========================= */

export async function createStockOut(
    payload: CreateStockOutPayload,
) {
    const response =
        await api.post(
            '/stock-outs',
            payload,
        );

    return response.data;
}



export async function getAvailableStockDetails(
    batchIds: number[],
): Promise<
    Record<number, StockInItem[]>
> {
    const entries = await Promise.all(
        batchIds.map(async (batchId) => {
            const response =
                await getStockInDetail(batchId);

            return [
                batchId,
                response.items,
            ] as const;
        }),
    );

    return Object.fromEntries(entries);
}