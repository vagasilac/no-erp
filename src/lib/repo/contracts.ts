export interface OrdersRepo {
  create(orgId: string, data: any): Promise<string>;
  update(orgId: string, id: string, patch: any): Promise<void>;
  dueInRange(orgId: string, fromISO: string, toISO: string): Promise<any[]>;
  findById(orgId: string, id: string): Promise<any | null>;
}

export interface ProductsRepo {
  findByName(orgId: string, name: string): Promise<any | null>;
  upsertMany(orgId: string, list: any[]): Promise<number>;
  list(orgId: string): Promise<any[]>;
}

export interface CustomersRepo {
  upsertByDisplayName(orgId: string, displayName: string): Promise<any>;
}

export interface SettingsRepo {
  get(orgId: string): Promise<any>;
  set(orgId: string, patch: any): Promise<void>;
}

export interface ThreadsRepo {
  create(orgId: string, data: any): Promise<string>;
  addMessage(orgId: string, threadId: string, msg: any): Promise<string>;
  delete(orgId: string, threadId: string): Promise<void>;
  export(orgId: string, threadId: string): Promise<any>;
}

export interface InvoicesRepo {
  create(orgId: string, data: any): Promise<string>;
}

export interface InventoryRepo {
  move(orgId: string, data: any): Promise<string>;
}

export interface AuditRepo {
  log(orgId: string, entry: any): Promise<void>;
}

export type Repo = {
  orders: OrdersRepo;
  products: ProductsRepo;
  customers: CustomersRepo;
  settings: SettingsRepo;
  threads: ThreadsRepo;
  invoices: InvoicesRepo;
  inventory: InventoryRepo;
  audit: AuditRepo;
};
