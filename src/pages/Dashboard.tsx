import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Shield, 
  Users 
} from "lucide-react";
import { mockMaterials, mockOrders, mockSerials, mockAssignments } from "@/lib/mockData";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  // Calculs pour les statistiques
  const totalStock = mockMaterials.reduce((acc, item) => acc + item.stock, 0);
  const lowStockItems = mockMaterials.filter(item => item.stock < item.threshold).length;
  const pendingDeliveries = mockOrders.filter(o => o.status === "Commande fournisseur faite").length;
  const stockValue = mockMaterials.reduce((acc, item) => acc + (item.price * item.stock), 0);
  const warrantyExpiringSoon = mockSerials.filter(s => {
    const endDate = new Date(s.warrantyEnd);
    const now = new Date();
    const daysUntilExpiry = Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 90;
  }).length;
  const recentAssignments = mockAssignments.length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Vue d'ensemble de votre gestion de stock
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Stock total"
            value={totalStock}
            icon={Package}
            description={`${mockMaterials.length} types de matériels`}
            onClick={() => navigate("/materials")}
          />
          
          <StatCard
            title="Valeur du stock"
            value={`${stockValue.toLocaleString('fr-FR')} €`}
            icon={TrendingUp}
            description="Prix d'achat total"
            onClick={() => navigate("/materials")}
          />
          
          <StatCard
            title="Seuils d'alerte"
            value={lowStockItems}
            icon={AlertTriangle}
            description="Matériels en stock faible"
            onClick={() => navigate("/materials")}
          />
          
          <StatCard
            title="Livraisons en attente"
            value={pendingDeliveries}
            icon={Clock}
            description="Commandes en cours"
            onClick={() => navigate("/orders")}
          />
          
          <StatCard
            title="Garanties à surveiller"
            value={warrantyExpiringSoon}
            icon={Shield}
            description="Expiration < 90 jours"
            onClick={() => navigate("/serials")}
          />
          
          <StatCard
            title="Attributions actives"
            value={recentAssignments}
            icon={Users}
            description="Matériels attribués"
            onClick={() => navigate("/assignments")}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Stock par catégorie</h3>
            <div className="space-y-3">
              {Object.entries(
                mockMaterials.reduce((acc, item) => {
                  acc[item.category] = (acc[item.category] || 0) + item.stock;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{category}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(count / totalStock) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Commandes récentes</h3>
            <div className="space-y-3">
              {mockOrders.slice(0, 4).map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{order.reference}</p>
                    <p className="text-xs text-muted-foreground">{order.supplier}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{order.amount.toLocaleString('fr-FR')} €</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-muted">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
