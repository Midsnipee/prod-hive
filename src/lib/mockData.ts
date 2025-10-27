export interface Material {
  id: string;
  name: string;
  category: string;
  internalRef: string;
  supplier: string;
  price: number;
  stock: number;
  threshold: number;
  site: string;
}

export interface Serial {
  id: string;
  materialId: string;
  serialNumber: string;
  deliveryDate: string;
  warrantyStart: string;
  warrantyEnd: string;
  status: "En stock" | "Attribué" | "En réparation" | "Retiré";
  assignedTo?: string;
}

export interface Order {
  id: string;
  reference: string;
  supplier: string;
  amount: number;
  status: "Demandé" | "Circuit interne" | "Commande fournisseur faite" | "Livré";
  createdAt: string;
  expectedDelivery?: string;
}

export interface Assignment {
  id: string;
  serialNumber: string;
  materialName: string;
  assignedTo: string;
  department: string;
  startDate: string;
  expectedReturn?: string;
}

export const mockMaterials: Material[] = [
  {
    id: "1",
    name: "Dell Latitude 5420",
    category: "PC Portable",
    internalRef: "PC-LAT-5420",
    supplier: "ACME Corp",
    price: 1299,
    stock: 15,
    threshold: 5,
    site: "Paris"
  },
  {
    id: "2",
    name: "Dell Monitor P2422H",
    category: "Écran",
    internalRef: "MON-P2422",
    supplier: "ACME Corp",
    price: 249,
    stock: 8,
    threshold: 10,
    site: "Paris"
  },
  {
    id: "3",
    name: "iPhone 14 Pro",
    category: "Smartphone",
    internalRef: "TEL-IP14P",
    supplier: "Contoso Ltd",
    price: 1159,
    stock: 3,
    threshold: 5,
    site: "Lyon"
  },
  {
    id: "4",
    name: "Dell Dock WD19",
    category: "Dock",
    internalRef: "DOC-WD19",
    supplier: "ACME Corp",
    price: 189,
    stock: 12,
    threshold: 8,
    site: "Paris"
  },
  {
    id: "5",
    name: "MacBook Pro 14",
    category: "PC Portable",
    internalRef: "PC-MBP14",
    supplier: "Contoso Ltd",
    price: 2399,
    stock: 6,
    threshold: 3,
    site: "Lyon"
  }
];

export const mockSerials: Serial[] = [
  {
    id: "1",
    materialId: "1",
    serialNumber: "LAT5420-001",
    deliveryDate: "2024-01-15",
    warrantyStart: "2024-01-15",
    warrantyEnd: "2027-01-15",
    status: "Attribué",
    assignedTo: "Marie Dubois"
  },
  {
    id: "2",
    materialId: "1",
    serialNumber: "LAT5420-002",
    deliveryDate: "2024-01-15",
    warrantyStart: "2024-01-15",
    warrantyEnd: "2027-01-15",
    status: "En stock"
  },
  {
    id: "3",
    materialId: "3",
    serialNumber: "IP14P-045",
    deliveryDate: "2024-02-20",
    warrantyStart: "2024-02-20",
    warrantyEnd: "2025-02-20",
    status: "Attribué",
    assignedTo: "Jean Martin"
  }
];

export const mockOrders: Order[] = [
  {
    id: "1",
    reference: "CMD-2024-001",
    supplier: "ACME Corp",
    amount: 12990,
    status: "Livré",
    createdAt: "2024-01-10",
    expectedDelivery: "2024-01-15"
  },
  {
    id: "2",
    reference: "CMD-2024-002",
    supplier: "Contoso Ltd",
    amount: 4990,
    status: "Commande fournisseur faite",
    createdAt: "2024-02-01",
    expectedDelivery: "2024-03-15"
  },
  {
    id: "3",
    reference: "CMD-2024-003",
    supplier: "ACME Corp",
    amount: 2450,
    status: "Circuit interne",
    createdAt: "2024-02-20"
  },
  {
    id: "4",
    reference: "CMD-2024-004",
    supplier: "Contoso Ltd",
    amount: 8970,
    status: "Demandé",
    createdAt: "2024-03-01"
  }
];

export const mockAssignments: Assignment[] = [
  {
    id: "1",
    serialNumber: "LAT5420-001",
    materialName: "Dell Latitude 5420",
    assignedTo: "Marie Dubois",
    department: "Développement",
    startDate: "2024-01-20",
  },
  {
    id: "2",
    serialNumber: "IP14P-045",
    materialName: "iPhone 14 Pro",
    assignedTo: "Jean Martin",
    department: "Commercial",
    startDate: "2024-02-25",
    expectedReturn: "2025-02-25"
  }
];
