const API_PREFIX = "/api/v1";

type ApiErrorBody = {
  message?: string | string[];
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parseError(response: Response) {
  try {
    const body = (await response.json()) as ApiErrorBody;
    const message = Array.isArray(body.message) ? body.message.join(" ") : body.message;
    return message || "Something went wrong. Please try again.";
  } catch {
    return "Something went wrong. Please try again.";
  }
}

async function request<T>(path: string, init: RequestInit = {}, canRefresh = true): Promise<T> {
  const response = await fetch(`${API_PREFIX}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  const canRefreshSession =
    canRefresh &&
    path !== "/auth/refresh" &&
    path !== "/auth/login" &&
    path !== "/auth/verify-otp";

  if (response.status === 401 && canRefreshSession) {
    const refreshResponse = await fetch(`${API_PREFIX}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (refreshResponse.ok) {
      return request<T>(path, init, false);
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, await parseError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export type Session = {
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
    roleId?: number;
  };
  permissions?: unknown[];
};

export type DashboardData = {
  stockMovementLast30Days: Array<{
    date: string;
    stockIn: number;
    stockOut: number;
  }>;
  batches: {
    today: number;
    yesterday: number;
    thisWeek: number;
    thisMonth: number;
  };
  stockInByMasterProduct: Array<{
    masterProductId: number;
    masterProductName: string;
    masterProductSku: string;
    quantity: number;
  }>;
  variantsPerMasterProduct: Array<{
    masterProductId: number;
    masterProductName: string;
    masterProductSku: string;
    variantCount: number;
  }>;
  stockOutStatus: {
    issued: number;
    delivered: number;
    received: number;
  };
  totals: {
    masterProducts: number;
    variants: number;
    colors: number;
    materials: number;
  };
};

export type Permission = {
  id: number;
  name: string;
  action: string;
  permissionGroupId: number;
};

export type PermissionGroup = {
  id: number;
  name: string;
  key: string;
  description: string | null;
  permissions: Permission[];
  permissionCount: number;
  createdAt: string;
  updatedAt: string;
};

export type PermissionGroupsResponse = {
  data: PermissionGroup[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type Role = {
  id: number;
  name: string;
  description: string | null;
  status: string;
  isSystem: boolean;
  userCount: number;
  permissionCount: number;
  createdAt: string;
  updatedAt: string;
};

export type RolesResponse = {
  data: Role[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type UserRecord = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  gender: "MALE" | "FEMALE" | null;
  avatar: string | null;
  signature: string | null;
  status: "ACTIVE" | "INACTIVE";
  roleId: number;
  role: {
    id: number;
    name: string;
    description: string | null;
    status: "ACTIVE" | "INACTIVE";
  };
  createdAt: string;
  updatedAt: string;
};

export type UsersResponse = {
  data: UserRecord[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type CategoryRecord = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  type: "CATEGORY" | "SUB_CATEGORY";
  parentId: number | null;
  parent: { id: number; name: string; slug: string } | null;
  mediaId: number | null;
  status: "ACTIVE" | "INACTIVE";
  sortOrder: number;
  childrenCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CategoriesResponse = {
  data: CategoryRecord[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export type ColorRecord = {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ColorsResponse = {
  data: ColorRecord[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export type MaterialRecord = {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MaterialsResponse = {
  data: MaterialRecord[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export type MasterProductRecord = {
  id: number;
  name: string;
  sku: string;
  categoryId: number;
  subCategoryId: number | null;
  materialId: number;
  category: { id: number; name: string; slug: string };
  subCategory: { id: number; name: string; slug: string } | null;
  material: { id: number; name: string };
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
  _count?: { variants: number };
  variantsCount?: number;
};

export type MasterProductsResponse = {
  data: MasterProductRecord[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export type ProductVariantRecord = {
  id: number;
  sku: string;
  size: string;
  gender: "MALE" | "FEMALE";
  modelNumber: string | null;
  uom: string;
  productsPerPacket: number;
  packagingType: string;
  status: "ACTIVE" | "INACTIVE";
  masterProduct: { id: number; name: string; sku: string; status: "ACTIVE" | "INACTIVE" };
  color: { id: number; name: string };
  createdAt: string;
  updatedAt: string;
};

export type ProductVariantsResponse = {
  data: ProductVariantRecord[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

export type StockInItemRecord = {
  id: number;
  quantity: number;
  productVariant: { id: number; size: string; sku: string; gender: "MALE" | "FEMALE" };
  warehouse: { id: number; name: string; code: string };
  zone: { id: number; name: string; code: string };
  subZone: { id: number; name: string; code: string };
  rack: { id: number; name: string; code: string };
};

export type StockInRecord = {
  id: number;
  batchId: string;
  masterProductId: number;
  colorId: number;
  gender: "MALE" | "FEMALE";
  stockInDate: string;
  productionDate: string;
  expiryDate: string | null;
  totalQuantity: number;
  totalPackages: number;
  masterProduct: { id: number; name: string; sku: string };
  color: { id: number; name: string };
  createdBy?: { id: number; name: string; email: string };
  items?: StockInItemRecord[];
  itemCount?: number;
};

export type StockInsResponse = {
  data: StockInRecord[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export type StockOutRecord = {
  id: number;
  stockOutNumber: string;
  buyerId: number;
  letterOfCreditId: number;
  purchaseOrderId: number;
  masterProductId: number;
  colorId: number;
  gender: "MALE" | "FEMALE";
  requestDate: string;
  stockOutDate: string | null;
  status: string;
  buyer: { id: number; name: string; type: string; status: string };
  letterOfCredit: { id: number; lcNumber: string; buyerId: number };
  purchaseOrder: { id: number; poNumber: string; letterOfCreditId: number };
  masterProduct: { id: number; name: string; sku: string; status: string };
  color: { id: number; name: string };
  items: Array<{ id: number; batchId: string; productVariantId: number; quantity: number; productVariant: { id: number; size: string; sku: string; modelNumber: string | null; gender: string; uom: string; productsPerPacket: number; packagingType: string } }>;
};

export type StockOutsResponse = { data: StockOutRecord[]; meta: { page: number; limit: number; total: number; totalPages: number; hasNextPage?: boolean; hasPreviousPage?: boolean } };

export type BuyerRecord = {
  id: number;
  name: string;
  type: "LOCAL" | "INTERNATIONAL";
  status: "ACTIVE" | "INACTIVE";
  lettersOfCredit: Array<{ id: number; lcNumber: string; purchaseOrders: Array<{ id: number; poNumber: string }> }>;
};

export type WarehouseRecord = { id: number; name: string; code: string; description: string | null; status: "ACTIVE" | "INACTIVE"; createdAt: string; updatedAt: string };
export type ZoneRecord = { id: number; name: string; code: string; description: string | null; warehouseId: number; warehouse: { id: number; name: string; code: string }; status: "ACTIVE" | "INACTIVE"; createdAt: string; updatedAt: string };
export type SubZoneRecord = { id: number; name: string; code: string; description: string | null; zoneId: number; zone: { id: number; name: string; code: string; warehouse: { id: number; name: string; code: string } }; status: "ACTIVE" | "INACTIVE"; createdAt: string; updatedAt: string };
export type RackRecord = { id: number; name: string; code: string; description: string | null; subZoneId: number; subZone: { id: number; name: string; code: string; zone: { id: number; name: string; code: string; warehouse: { id: number; name: string; code: string } } }; status: "ACTIVE" | "INACTIVE"; createdAt: string; updatedAt: string };
type CollectionResponse<T> = { data: T[]; meta: { total: number; page: number; limit: number; totalPages: number } };

export function login(email: string, password: string) {
  return request<{ message: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function verifyOtp(email: string, otp: string) {
  return request<{ message: string }>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  }, false);
}

export function getSession() {
  return request<Session>("/auth/session");
}

export function getDashboard() {
  return request<DashboardData>("/dashboard");
}

export function getPermissionGroups(page = 1, limit = 100) {
  return request<PermissionGroupsResponse>(`/permissions/groups?page=${page}&limit=${limit}`);
}

export function createPermissionGroup(payload: { name: string; key: string; actions: string[]; description?: string }) {
  return request<{ message: string; data: PermissionGroup }>("/permissions/groups", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logout() {
  return request<{ message: string }>("/auth/logout", { method: "POST" });
}

export function getRoles(page = 1, limit = 100) {
  return request<RolesResponse>(`/roles?page=${page}&limit=${limit}`);
}

export function createRole(payload: { name: string; description?: string; permissionIds?: number[]; grantAll?: boolean }) {
  return request<{ message: string; data: Role }>("/roles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getUsers(page = 1, limit = 100) {
  return request<UsersResponse>(`/users?page=${page}&limit=${limit}`);
}

export function createUser(payload: { name: string; email: string; password: string; roleId: number; phone?: string; gender?: "MALE" | "FEMALE" }) {
  return request<{ message: string; user: UserRecord }>("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getCategories(type: "CATEGORY" | "SUB_CATEGORY", page = 1, limit = 100) {
  return request<CategoriesResponse>(`/categories?type=${type}&page=${page}&limit=${limit}`);
}

export function createCategory(payload: { name: string; description?: string; mediaId?: number; sortOrder?: number }) {
  return request<{ message: string; category: CategoryRecord }>("/categories", { method: "POST", body: JSON.stringify(payload) });
}

export function createSubCategory(payload: { name: string; parentId: number; description?: string; mediaId?: number; sortOrder?: number }) {
  return request<{ message: string; subCategory: CategoryRecord }>("/categories/sub-categories", { method: "POST", body: JSON.stringify(payload) });
}

export function getColors(page = 1, limit = 100) {
  return request<ColorsResponse>(`/colors?page=${page}&limit=${limit}`);
}

export function createColor(payload: { name: string; description?: string }) {
  return request<{ message: string; data: ColorRecord }>("/colors", { method: "POST", body: JSON.stringify(payload) });
}

export function getMaterials(page = 1, limit = 100) {
  return request<MaterialsResponse>(`/materials?page=${page}&limit=${limit}`);
}

export function createMaterial(payload: { name: string; description?: string }) {
  return request<{ message: string; data: MaterialRecord }>("/materials", { method: "POST", body: JSON.stringify(payload) });
}

export function getBuyers() { return request<BuyerRecord[]>("/buyers"); }
export function createBuyer(payload: { name: string; type: "LOCAL" | "INTERNATIONAL" }) { return request<{ message: string; data: BuyerRecord }>("/buyers", { method: "POST", body: JSON.stringify(payload) }); }

export function getWarehouses(page = 1, limit = 100) { return request<CollectionResponse<WarehouseRecord>>(`/warehouses?page=${page}&limit=${limit}`); }
export function createWarehouse(payload: { name: string; code: string; description?: string }) { return request<{ message: string; data: WarehouseRecord }>("/warehouses", { method: "POST", body: JSON.stringify(payload) }); }
export function getZones(page = 1, limit = 100, warehouseId?: number) { return request<CollectionResponse<ZoneRecord>>(`/zones?page=${page}&limit=${limit}${warehouseId ? `&warehouseId=${warehouseId}` : ""}`); }
export function createZone(payload: { name: string; code: string; warehouseId: number; description?: string }) { return request<{ message: string; data: ZoneRecord }>("/zones", { method: "POST", body: JSON.stringify(payload) }); }
export function getSubZones(page = 1, limit = 100, zoneId?: number) { return request<CollectionResponse<SubZoneRecord>>(`/sub-zones?page=${page}&limit=${limit}${zoneId ? `&zoneId=${zoneId}` : ""}`); }
export function createSubZone(payload: { name: string; code: string; zoneId: number; description?: string }) { return request<{ message: string; data: SubZoneRecord }>("/sub-zones", { method: "POST", body: JSON.stringify(payload) }); }
export function getRacks(page = 1, limit = 100, subZoneId?: number) { return request<CollectionResponse<RackRecord>>(`/racks?page=${page}&limit=${limit}${subZoneId ? `&subZoneId=${subZoneId}` : ""}`); }
export function createRack(payload: { name: string; code: string; subZoneId: number; description?: string }) { return request<{ message: string; data: RackRecord }>("/racks", { method: "POST", body: JSON.stringify(payload) }); }

export function getMasterProducts(page = 1, limit = 100) { return request<MasterProductsResponse>(`/products/master?page=${page}&limit=${limit}`); }
export function createMasterProduct(payload: { name: string; categoryId: number; subCategoryId?: number; materialId: number }) { return request<{ message: string; data: MasterProductRecord }>("/products/master", { method: "POST", body: JSON.stringify(payload) }); }
export function getProductVariants(page = 1, limit = 100, filters?: { masterProductId?: number; colorId?: number; gender?: "MALE" | "FEMALE" }) { const params = new URLSearchParams({ page: String(page), limit: String(limit) }); if (filters?.masterProductId) params.set("masterProductId", String(filters.masterProductId)); if (filters?.colorId) params.set("colorId", String(filters.colorId)); if (filters?.gender) params.set("gender", filters.gender); return request<ProductVariantsResponse>(`/products/variants?${params.toString()}`); }
export function createProductVariants(payload: { masterProductId: number; colorId: number; gender: "MALE" | "FEMALE"; sizes: string[]; modelNumber?: string; uom: string; productsPerPacket: number; packagingType: string }) { return request<{ message: string; data: ProductVariantRecord[] }>("/products/variants", { method: "POST", body: JSON.stringify(payload) }); }
export function createStockIn(payload: { masterProductId: number; colorId: number; gender: "MALE" | "FEMALE"; stockInDate: string; productionDate: string; expiryDate?: string; items: Array<{ size: string; quantity: number; warehouseId: number; zoneId: number; subZoneId: number; rackId: number }> }) { return request<{ message: string; data: StockInRecord }>("/stock-in", { method: "POST", body: JSON.stringify(payload) }); }
export function getStockIns(page = 1, limit = 100) { return request<StockInsResponse>(`/stock-in?page=${page}&limit=${limit}`); }
export function getStockIn(id: number) { return request<{ data: StockInRecord & { masterProduct: StockInRecord["masterProduct"] & { material: { id: number; name: string } } } }>(`/stock-in/${id}`); }
export function createLetterOfCredit(payload: { buyerId: number; lcNumber: string }) { return request<{ message: string; data: { id: number; lcNumber: string; buyerId: number; purchaseOrders?: Array<{ id: number; poNumber: string }> } }>("/buyers/lc", { method: "POST", body: JSON.stringify(payload) }); }
export function createPurchaseOrder(payload: { letterOfCreditId: number; poNumber: string }) { return request<{ message: string; data: { id: number; poNumber: string; letterOfCreditId: number } }>("/buyers/po", { method: "POST", body: JSON.stringify(payload) }); }
export function getStockOuts(page = 1, limit = 100) { return request<StockOutsResponse>(`/stock-outs?page=${page}&limit=${limit}`); }
export function createStockOut(payload: { buyerId: number; letterOfCreditId: number; purchaseOrderId: number; masterProductId: number; colorId: number; gender: "MALE" | "FEMALE"; requestDate: string; stockOutDate?: string; items: Array<{ batchId: string; productVariantId: number; quantity: number }> }) { return request<{ message: string; data: StockOutRecord }>("/stock-outs", { method: "POST", body: JSON.stringify(payload) }); }