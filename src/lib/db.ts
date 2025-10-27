import Dexie, { Table } from 'dexie';
import { Material, Serial, Order, Assignment } from './mockData';

export interface User {
  id: string;
  email: string;
  password: string;
  displayName: string;
  department: string;
  site: string;
  role: 'admin' | 'magasinier' | 'acheteur' | 'lecteur';
  createdAt: Date;
}

export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: Date;
}

export interface OrderLine {
  id: string;
  orderId: string;
  materialId: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

export class StockDB extends Dexie {
  users!: Table<User>;
  suppliers!: Table<Supplier>;
  materials!: Table<Material>;
  serials!: Table<Serial>;
  orders!: Table<Order>;
  orderLines!: Table<OrderLine>;
  assignments!: Table<Assignment>;

  constructor() {
    super('StockManagementDB');
    this.version(1).stores({
      users: 'id, email, role',
      suppliers: 'id, name',
      materials: 'id, name, category, stock',
      serials: 'id, serialNumber, materialId, status',
      orders: 'id, reference, supplier, status, createdAt',
      orderLines: 'id, orderId, materialId',
      assignments: 'id, serialNumber, assignedTo, startDate'
    });
  }
}

export const db = new StockDB();
