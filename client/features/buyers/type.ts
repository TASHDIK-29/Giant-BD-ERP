
export type BuyersStatus =
    | 'ACTIVE'
    | 'INACTIVE';


export type BuyersType =
    | 'LOCAL'
    | 'INTERNATIONAL';



export interface PurchaseOrders {
    id: number;
    poNumber: string;
}

export interface LettersOfCredit {
    id: number;
    lcNumber: string;
    purchaseOrders?: PurchaseOrders[];
}

export interface BuyersRecord {
    id: number;
    name: string;
    type: BuyersType;
    status: BuyersStatus;
    lettersOfCredit?: LettersOfCredit[];
}

export interface BuyersMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface BuyersResponse {
    data: BuyersRecord[];
}

export interface QueryBuyersParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: BuyersStatus;
}