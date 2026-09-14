export interface StockMovement {
    date: string;
    stockIn: number;
    stockOut: number;
}

export interface DashboardBatches {
    today: number;
    yesterday: number;
    thisWeek: number;
    thisMonth: number;
}

export interface StockInByMasterProduct {
    masterProductId: number;
    masterProductName: string;
    masterProductSku: string;
    quantity: number;
}

export interface VariantsPerMasterProduct {
    masterProductId: number;
    masterProductName: string;
    masterProductSku: string;
    variantCount: number;
}

export interface StockOutStatus {
    issued: number;
    delivered: number;
    received: number;
}

export interface DashboardTotals {
    masterProducts: number;
    variants: number;
    colors: number;
    materials: number;
}

export interface DashboardResponse {
    stockMovementLast30Days: StockMovement[];

    batches: DashboardBatches;

    stockInByMasterProduct:
        StockInByMasterProduct[];

    variantsPerMasterProduct:
        VariantsPerMasterProduct[];

    stockOutStatus: StockOutStatus;

    totals: DashboardTotals;
}