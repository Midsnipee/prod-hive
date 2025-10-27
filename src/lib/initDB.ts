import { db } from './db';
import { mockMaterials, mockSerials, mockOrders, mockAssignments } from './mockData';

export const initializeDatabase = async () => {
  try {
    // Check if already initialized
    const userCount = await db.users.count();
    if (userCount > 0) return;

    // Create default admin user
    await db.users.add({
      id: crypto.randomUUID(),
      email: 'admin@stock.local',
      password: 'admin123',
      displayName: 'Administrateur',
      department: 'IT',
      site: 'Siège',
      role: 'admin',
      createdAt: new Date()
    });

    // Add other default users
    await db.users.bulkAdd([
      {
        id: crypto.randomUUID(),
        email: 'magasinier@stock.local',
        password: 'mag123',
        displayName: 'Jean Dupont',
        department: 'Logistique',
        site: 'Entrepôt A',
        role: 'magasinier',
        createdAt: new Date()
      },
      {
        id: crypto.randomUUID(),
        email: 'acheteur@stock.local',
        password: 'ach123',
        displayName: 'Marie Martin',
        department: 'Achats',
        site: 'Siège',
        role: 'acheteur',
        createdAt: new Date()
      },
      {
        id: crypto.randomUUID(),
        email: 'lecteur@stock.local',
        password: 'lec123',
        displayName: 'Pierre Durand',
        department: 'Commercial',
        site: 'Agence B',
        role: 'lecteur',
        createdAt: new Date()
      }
    ]);

    // Add suppliers
    await db.suppliers.bulkAdd([
      {
        id: crypto.randomUUID(),
        name: 'ACME Corp',
        contact: 'John Smith',
        email: 'contact@acme.com',
        phone: '+33 1 23 45 67 89',
        address: '123 Rue de Paris, 75001 Paris',
        createdAt: new Date()
      },
      {
        id: crypto.randomUUID(),
        name: 'Contoso Ltd',
        contact: 'Jane Doe',
        email: 'sales@contoso.com',
        phone: '+33 1 98 76 54 32',
        address: '456 Avenue des Champs, 75008 Paris',
        createdAt: new Date()
      }
    ]);

    // Add mock data
    await db.materials.bulkAdd(mockMaterials.map(m => ({ ...m, id: m.id || crypto.randomUUID() })));
    await db.serials.bulkAdd(mockSerials.map(s => ({ ...s, id: crypto.randomUUID(), materialId: s.materialId || mockMaterials[0].id })));
    await db.orders.bulkAdd(mockOrders.map(o => ({ ...o, id: crypto.randomUUID() })));
    await db.assignments.bulkAdd(mockAssignments.map(a => ({ ...a, id: crypto.randomUUID() })));

    console.log('Base de données initialisée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error);
  }
};
