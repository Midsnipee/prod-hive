import { addDays, subDays } from "date-fns";

export type MaterialCategory = "PC Portable" | "Écran" | "Dock" | "Smartphone" | "Accessoire" | "Tablette" | "Réseau" | "Imprimante";
export type SerialStatus = "En stock" | "Attribué" | "En réparation" | "Retiré";
export type WarrantyStatus = "ok" | "warning" | "expired";
export type OrderStatus = "Demandé" | "Circuit interne" | "Commande fournisseur faite" | "Livré";

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  site: string;
}

export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  internalRef: string;
  defaultSupplier: string;
  defaultUnitPrice: number;
  site: string;
  lowStockThreshold: number;
  notes?: string;
  stock: number;
  pendingDeliveries: number;
  nonSerializedStock: number;
  tags: string[];
}

export interface Serial {
  id: string;
  materialId: string;
  materialName: string;
  serialNumber: string;
  deliveryDate: Date;
  warrantyStart: Date;
  warrantyEnd: Date;
  supplier: string;
  site: string;
  purchasePrice: number;
  status: SerialStatus;
  assignedTo?: string;
  warrantyStatus: WarrantyStatus;
}

export interface Assignment {
  id: string;
  serialId: string;
  serialNumber: string;
  materialName: string;
  assignedTo: string;
  department: string;
  site: string;
  supplier: string;
  startDate: Date;
  expectedReturn?: Date;
  endDate?: Date;
  document?: string;
  notes?: string;
}

export interface OrderLine {
  id: string;
  itemId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

export interface DeliveryItem {
  lineId: string;
  quantity: number;
  serialNumbers?: string[];
}

export interface Delivery {
  id: string;
  orderId: string;
  deliveryNoteRef: string;
  deliveredAt: Date;
  files: string[];
  items: DeliveryItem[];
}

export interface OrderActivity {
  id: string;
  action: string;
  user: string;
  at: Date;
  details?: string;
}

export interface OrderFile {
  id: string;
  name: string;
  type: "devis" | "commande" | "livraison" | "facture";
  url: string;
}

export interface Order {
  id: string;
  reference: string;
  supplier: string;
  status: OrderStatus;
  amount: number;
  currency: string;
  createdAt: Date;
  expectedDelivery?: Date;
  site: string;
  requestedBy: string;
  tags: string[];
  lines: OrderLine[];
  deliveries: Delivery[];
  history: OrderActivity[];
  files: OrderFile[];
}

export interface DashboardAlert {
  id: string;
  title: string;
  description: string;
  severity: "warning" | "critical";
  site: string;
  supplier: string;
  period: string;
}

export const mockSuppliers: Supplier[] = [
  {
    id: "sup-1",
    name: "ACME Corp",
    contact: "Laura Bernard",
    email: "l.bernard@acme.com",
    phone: "+33 1 23 45 67 89",
    address: "42 rue Victor Hugo, 75009 Paris",
    site: "Paris"
  },
  {
    id: "sup-2",
    name: "Contoso",
    contact: "Marc Lefèvre",
    email: "marc.lefevre@contoso.fr",
    phone: "+33 4 56 78 90 12",
    address: "15 avenue Foch, 69006 Lyon",
    site: "Lyon"
  },
  {
    id: "sup-3",
    name: "Globex",
    contact: "Alice Martin",
    email: "amartin@globex.com",
    phone: "+33 1 98 76 54 32",
    address: "5 chemin des Acacias, 13008 Marseille",
    site: "Marseille"
  }
];

const baseMaterials: Omit<Material, "stock" | "pendingDeliveries" | "nonSerializedStock">[] = [
  {
    id: "mat-1",
    name: "Dell Latitude 5420",
    category: "PC Portable",
    internalRef: "PC-LAT-5420",
    defaultSupplier: "ACME Corp",
    defaultUnitPrice: 1299,
    site: "Paris",
    lowStockThreshold: 5,
    notes: "Standard Windows 11 Pro",
    tags: ["Windows", "15 pouces"]
  },
  {
    id: "mat-2",
    name: "Dell Monitor P2422H",
    category: "Écran",
    internalRef: "MON-P2422",
    defaultSupplier: "ACME Corp",
    defaultUnitPrice: 249,
    site: "Paris",
    lowStockThreshold: 10,
    notes: "Full HD - Bras VESA",
    tags: ["Full HD", "Business"]
  },
  {
    id: "mat-3",
    name: "iPhone 15",
    category: "Smartphone",
    internalRef: "TEL-IP15",
    defaultSupplier: "Contoso",
    defaultUnitPrice: 1159,
    site: "Lyon",
    lowStockThreshold: 5,
    notes: "Forfaits commerciaux",
    tags: ["iOS", "5G"]
  },
  {
    id: "mat-4",
    name: "Dell Dock WD19",
    category: "Dock",
    internalRef: "DOC-WD19",
    defaultSupplier: "ACME Corp",
    defaultUnitPrice: 189,
    site: "Paris",
    lowStockThreshold: 8,
    tags: ["USB-C", "Ethernet"]
  },
  {
    id: "mat-5",
    name: "MacBook Pro 14",
    category: "PC Portable",
    internalRef: "PC-MBP14",
    defaultSupplier: "Contoso",
    defaultUnitPrice: 2399,
    site: "Lyon",
    lowStockThreshold: 3,
    tags: ["macOS", "Développement"]
  },
  {
    id: "mat-6",
    name: "iPad Air",
    category: "Tablette",
    internalRef: "TAB-IPADAIR",
    defaultSupplier: "Globex",
    defaultUnitPrice: 869,
    site: "Paris",
    lowStockThreshold: 4,
    tags: ["Formation", "Mobilité"]
  },
  {
    id: "mat-7",
    name: "Logitech MX Master 3",
    category: "Accessoire",
    internalRef: "ACC-MX3",
    defaultSupplier: "ACME Corp",
    defaultUnitPrice: 99,
    site: "Paris",
    lowStockThreshold: 15,
    tags: ["Souris", "Bluetooth"]
  },
  {
    id: "mat-8",
    name: "Switch Cisco C9200",
    category: "Réseau",
    internalRef: "NET-C9200",
    defaultSupplier: "Globex",
    defaultUnitPrice: 2590,
    site: "Marseille",
    lowStockThreshold: 2,
    tags: ["LAN", "PoE"]
  },
  {
    id: "mat-9",
    name: "Imprimante HP LaserJet Pro",
    category: "Imprimante",
    internalRef: "PRN-LJPRO",
    defaultSupplier: "Globex",
    defaultUnitPrice: 549,
    site: "Lyon",
    lowStockThreshold: 2,
    tags: ["A4", "Réseau"]
  },
  {
    id: "mat-10",
    name: "Casque Jabra Evolve2",
    category: "Accessoire",
    internalRef: "ACC-JABRA",
    defaultSupplier: "ACME Corp",
    defaultUnitPrice: 169,
    site: "Paris",
    lowStockThreshold: 12,
    tags: ["Audio", "Télétravail"]
  }
];

const serials: Serial[] = [];
const statuses: SerialStatus[] = ["En stock", "Attribué", "En réparation", "Retiré"];

baseMaterials.forEach((material, materialIndex) => {
  const totalSerials = material.category === "Accessoire" ? 10 : material.category === "PC Portable" ? 8 : 5;
  for (let i = 0; i < totalSerials; i += 1) {
    const status = statuses[(materialIndex + i) % statuses.length];
    const deliveryDate = subDays(new Date(), 90 + i * 5 + materialIndex * 3);
    const warrantyDuration = material.category === "PC Portable" || material.category === "Smartphone" ? 24 : 36;
    const warrantyEnd = addDays(deliveryDate, warrantyDuration * 30);
    const warrantyStatus: WarrantyStatus = warrantyEnd < new Date()
      ? "expired"
      : warrantyEnd < addDays(new Date(), 90)
        ? "warning"
        : "ok";

    serials.push({
      id: `${material.id}-${i + 1}`,
      materialId: material.id,
      materialName: material.name,
      serialNumber: `${material.internalRef}-${String(i + 1).padStart(3, "0")}`,
      deliveryDate,
      warrantyStart: deliveryDate,
      warrantyEnd,
      supplier: material.defaultSupplier,
      site: material.site,
      purchasePrice: material.defaultUnitPrice,
      status,
      assignedTo: status === "Attribué" ? (i % 2 === 0 ? "Marie Dubois" : "Jean Martin") : undefined,
      warrantyStatus
    });
  }
});

const materialStock = serials.reduce<Record<string, number>>((acc, serial) => {
  if (!acc[serial.materialId]) acc[serial.materialId] = 0;
  if (serial.status === "En stock") acc[serial.materialId] += 1;
  return acc;
}, {});

const materialPending = serials.reduce<Record<string, number>>((acc, serial) => {
  if (!acc[serial.materialId]) acc[serial.materialId] = 0;
  if (serial.status === "En réparation") acc[serial.materialId] += 1;
  return acc;
}, {});

export const mockMaterials: Material[] = baseMaterials.map(material => ({
  ...material,
  stock: materialStock[material.id] ?? 0,
  pendingDeliveries: materialPending[material.id] ?? 0,
  nonSerializedStock: material.category === "Accessoire" ? 20 : 0
}));

export const mockSerials: Serial[] = serials;

export const mockAssignments: Assignment[] = mockSerials
  .filter(serial => serial.status === "Attribué")
  .slice(0, 20)
  .map((serial, index) => ({
    id: `asg-${index + 1}`,
    serialId: serial.id,
    serialNumber: serial.serialNumber,
    materialName: serial.materialName,
    assignedTo: serial.assignedTo ?? (index % 2 === 0 ? "Pauline Garnier" : "Adrien Mercier"),
    department: index % 3 === 0 ? "Développement" : index % 3 === 1 ? "Commercial" : "RH",
    site: serial.site,
    supplier: serial.supplier,
    startDate: subDays(new Date(), index * 4),
    expectedReturn: index % 2 === 0 ? addDays(new Date(), 45 + index * 3) : undefined,
    document: "charte-utilisation.pdf",
    notes: index % 4 === 0 ? "Prévoir renouvellement" : undefined
  }));

const orderStatuses: OrderStatus[] = ["Demandé", "Circuit interne", "Commande fournisseur faite", "Livré"];

export const mockOrders: Order[] = Array.from({ length: 6 }).map((_, index) => {
  const status = orderStatuses[index % orderStatuses.length];
  const createdAt = subDays(new Date(), index * 12 + 5);
  const expectedDelivery = status === "Livré" ? undefined : addDays(createdAt, 21);
  const supplier = mockSuppliers[index % mockSuppliers.length];

  const lines: OrderLine[] = [
    {
      id: `line-${index}-1`,
      itemId: mockMaterials[index % mockMaterials.length].id,
      description: mockMaterials[index % mockMaterials.length].name,
      quantity: 5 + index,
      unitPrice: mockMaterials[index % mockMaterials.length].defaultUnitPrice,
      taxRate: 20
    },
    {
      id: `line-${index}-2`,
      itemId: mockMaterials[(index + 3) % mockMaterials.length].id,
      description: mockMaterials[(index + 3) % mockMaterials.length].name,
      quantity: 3,
      unitPrice: mockMaterials[(index + 3) % mockMaterials.length].defaultUnitPrice,
      taxRate: 20
    }
  ];

  const deliveries: Delivery[] = status === "Livré"
    ? [
        {
          id: `del-${index}-1`,
          orderId: `ord-${index + 1}`,
          deliveryNoteRef: `BL-2024-${index + 1}`,
          deliveredAt: addDays(createdAt, 14),
          files: ["bon-livraison.pdf"],
          items: lines.map(line => ({ lineId: line.id, quantity: Math.ceil(line.quantity * 0.8) }))
        }
      ]
    : status === "Commande fournisseur faite"
      ? [
          {
            id: `del-${index}-1`,
            orderId: `ord-${index + 1}`,
            deliveryNoteRef: `BL-2024-${index + 1}`,
            deliveredAt: addDays(createdAt, 10),
            files: ["reception-partielle.pdf"],
            items: lines.map(line => ({ lineId: line.id, quantity: Math.ceil(line.quantity * 0.5) }))
          }
        ]
      : [];

  const history: OrderActivity[] = [
    {
      id: `act-${index}-1`,
      action: "Création de la demande",
      user: "Sophie Leroy",
      at: createdAt,
      details: "Demande initiale validée par le manager."
    },
    {
      id: `act-${index}-2`,
      action: "Validation interne",
      user: "Louis Caron",
      at: addDays(createdAt, 2),
      details: "Budget approuvé par la direction."
    },
    ...(status === "Commande fournisseur faite" || status === "Livré"
      ? [
          {
            id: `act-${index}-3`,
            action: "Passage de commande fournisseur",
            user: "Alice Dupont",
            at: addDays(createdAt, 3),
            details: "PO envoyé au fournisseur et accusé de réception reçu."
          }
        ]
      : []),
    ...(status === "Livré"
      ? [
          {
            id: `act-${index}-4`,
            action: "Livraison complète",
            user: "Magasin Central",
            at: addDays(createdAt, 14),
            details: "Contrôle qualité réalisé et pièces jointes archivées."
          }
        ]
      : [])
  ];

  return {
    id: `ord-${index + 1}`,
    reference: `CMD-2024-${String(index + 1).padStart(3, "0")}`,
    supplier: supplier.name,
    status,
    amount: lines.reduce((acc, line) => acc + line.unitPrice * line.quantity, 0),
    currency: "EUR",
    createdAt,
    expectedDelivery,
    site: supplier.site,
    requestedBy: index % 2 === 0 ? "Camille Petit" : "Julien Robert",
    tags: index % 2 === 0 ? ["Capex", "Urgent"] : ["Renouvellement"],
    lines,
    deliveries,
    history,
    files: [
      { id: `file-${index}-1`, name: "Devis signé.pdf", type: "devis", url: "devis-signe.pdf" },
      { id: `file-${index}-2`, name: "Bon de commande.pdf", type: "commande", url: "bon-commande.pdf" },
      ...(status === "Livré"
        ? [{ id: `file-${index}-3`, name: "Facture.pdf", type: "facture", url: "facture.pdf" }]
        : [])
    ]
  } satisfies Order;
});

export const mockDashboardAlerts: DashboardAlert[] = [
  {
    id: "alert-1",
    title: "Seuil bas - iPhone 15",
    description: "Stock restant 3 unités sur le site de Lyon",
    severity: "warning",
    site: "Lyon",
    supplier: "Contoso",
    period: "this-month"
  },
  {
    id: "alert-2",
    title: "Garantie expirée - Dell Latitude",
    description: "2 équipements ont dépassé la garantie",
    severity: "critical",
    site: "Paris",
    supplier: "ACME Corp",
    period: "this-quarter"
  },
  {
    id: "alert-3",
    title: "Retour en retard",
    description: "1 attribution n'a pas été clôturée à la date prévue",
    severity: "warning",
    site: "Paris",
    supplier: "ACME Corp",
    period: "this-month"
  },
  {
    id: "alert-4",
    title: "Maintenance prolongée",
    description: "Un MacBook Pro est en réparation depuis 25 jours",
    severity: "critical",
    site: "Lyon",
    supplier: "Contoso",
    period: "this-quarter"
  }
];

