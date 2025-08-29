export type ID = string;
export type ISODate = string;

export interface OrdersRepo {
  create(orgId: ID, data: any): Promise<ID>;
  update(orgId: ID, id: ID, patch: any): Promise<void>;
  findById(orgId: ID, id: ID): Promise<any | null>;
  dueInRange(orgId: ID, fromISO: ISODate, toISO: ISODate): Promise<Array<any>>;
  countOpen(orgId: ID): Promise<number>;
}

export interface ProductsRepo {
  findByName(orgId: ID, name: string): Promise<any | null>;
  upsertMany(orgId: ID, list: Array<{ sku: string; name: string; uom?: string }>): Promise<number>;
  list(orgId: ID): Promise<Array<any>>;
}

export interface SettingsRepo {
  get(orgId: ID): Promise<any>;
  set(
    orgId: ID,
    patch: Partial<{
      primaryLang: string;
      secondaryLang?: string;
      currency: string;
      units: string;
      requireApproval: boolean;
    }>
  ): Promise<void>;
}

export interface ThreadsRepo {
  create(orgId: ID, data: any): Promise<ID>;
  addMessage(orgId: ID, threadId: ID, msg: any): Promise<ID>;
}

export interface InvoicesRepo {
  create(orgId: ID, data: any): Promise<ID>;
}

export interface InventoryRepo {
  move(orgId: ID, data: any): Promise<ID>;
}

export interface AuditRepo {
  log(orgId: ID, entry: any): Promise<void>;
}

export type Repo = {
  orders: OrdersRepo;
  products: ProductsRepo;
  settings: SettingsRepo;
  threads: ThreadsRepo;
  invoices: InvoicesRepo;
  inventory: InventoryRepo;
  audit: AuditRepo;
};
