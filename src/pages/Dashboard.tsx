import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  BarChart3,
  BellRing,
  Blocks,
  CalendarClock,
  Clock,
  LayoutGrid,
  Package,
  Shield,
  TrendingUp,
  Users,
  Wrench
} from "lucide-react";
import { mockAssignments, mockDashboardAlerts, mockMaterials, mockOrders, mockSerials } from "@/lib/mockData";
import { DashboardWidget, DashboardWidgetConfig } from "@/components/dashboard/DashboardWidget";
import { Badge } from "@/components/ui/badge";

const availableWidgets: DashboardWidgetConfig[] = [
  {
    id: "stock-overview",
    title: "Stock par catégorie",
    description: "Visualisez la répartition du stock et les seuils critiques",
    icon: BarChart3,
    size: "medium",
    render: ({ filters, onNavigate }) => (
      <DashboardWidget.Chart
        title="Répartition du stock"
        subtitle="Catégories principales"
        data={mockMaterials.map(item => ({
          name: item.category,
          value: item.stock,
          threshold: item.lowStockThreshold,
          site: item.site,
          supplier: item.defaultSupplier,
          category: item.category,
          period: "this-year"
        }))}
        filters={filters}
        onDetail={() => onNavigate("/materials")}
      />
    )
  },
  {
    id: "pending-deliveries",
    title: "Livraisons en attente",
    description: "Commandes fournisseur en cours d'acheminement",
    icon: Clock,
    size: "small",
    render: ({ filters, onNavigate }) => (
      <DashboardWidget.List
        title="Livraisons en attente"
        metric={mockOrders.filter(order => order.status === "Commande fournisseur faite").length}
        metricLabel="Commandes en transit"
        items={mockOrders
          .filter(order => order.status !== "Livré")
          .map(order => ({
            id: order.id,
            primary: order.reference,
            secondary: `${order.supplier} • ${new Date(order.expectedDelivery ?? order.createdAt).toLocaleDateString("fr-FR")}`,
            status: order.status,
            site: order.site,
            supplier: order.supplier,
            period: "this-quarter"
          }))}
        filters={filters}
        onDetail={() => onNavigate("/orders?status=Commande%20fournisseur%20faite")}
      />
    )
  },
  {
    id: "warranty",
    title: "Garanties à surveiller",
    description: "Matériels dont la garantie expire bientôt",
    icon: Shield,
    size: "small",
    render: ({ filters, onNavigate }) => (
      <DashboardWidget.List
        title="Garanties < 90 jours"
        metric={mockSerials.filter(serial => serial.warrantyStatus === "warning").length}
        metricLabel="Unités à renouveler"
        items={mockSerials
          .filter(serial => serial.warrantyStatus !== "ok")
          .map(serial => ({
            id: serial.id,
            primary: serial.serialNumber,
            secondary: `${serial.materialName} • ${serial.warrantyEnd.toLocaleDateString("fr-FR")}`,
            status: serial.status,
            supplier: serial.supplier,
            site: serial.site,
            period: "this-quarter"
          }))}
        filters={filters}
        onDetail={() => onNavigate("/serials?warranty=soon")}
      />
    )
  },
  {
    id: "assignments",
    title: "Attributions récentes",
    description: "Suivi des mouvements de matériel",
    icon: Users,
    size: "medium",
    render: ({ filters, onNavigate }) => (
      <DashboardWidget.Timeline
        title="Dernières attributions"
        events={mockAssignments.map(assignment => ({
          id: assignment.id,
          title: `${assignment.assignedTo} • ${assignment.materialName}`,
          description: assignment.department,
          date: assignment.startDate,
          site: assignment.site,
          supplier: assignment.supplier,
          period: "this-month"
        }))}
        filters={filters}
        onDetail={() => onNavigate("/assignments")}
      />
    )
  },
  {
    id: "stock-value",
    title: "Valeur du stock",
    description: "Synthèse financière du parc",
    icon: TrendingUp,
    size: "small",
    render: ({ filters, onNavigate }) => (
      <DashboardWidget.Kpi
        title="Valeur estimée"
        value={mockMaterials.reduce((total, item) => total + item.defaultUnitPrice * item.stock, 0)}
        currency="€"
        comparison={{
          label: "vs mois dernier",
          value: 6.4,
          direction: "up"
        }}
        filters={filters}
        onDetail={() => onNavigate("/materials")}
      />
    )
  },
  {
    id: "alerts",
    title: "Alertes",
    description: "Ruptures de stock et garanties expirées",
    icon: BellRing,
    size: "medium",
    render: ({ filters, onNavigate }) => (
      <DashboardWidget.AlertList
        title="Alertes prioritaires"
        alerts={mockDashboardAlerts.map(alert => ({
          ...alert,
          period: alert.period,
          supplier: alert.supplier,
          site: alert.site
        }))}
        filters={filters}
        onDetail={() => onNavigate("/materials?view=alerts")}
      />
    )
  },
  {
    id: "lifecycle",
    title: "Cycle de vie",
    description: "Suivi des étapes clés du parc",
    icon: LayoutGrid,
    size: "large",
    render: ({ filters, onNavigate }) => (
      <DashboardWidget.MultiMetric
        title="Cycle de vie du matériel"
        metrics={[
          { label: "En stock", value: mockSerials.filter(serial => serial.status === "En stock").length, icon: Package },
          { label: "Attribués", value: mockSerials.filter(serial => serial.status === "Attribué").length, icon: Users },
          { label: "En maintenance", value: mockSerials.filter(serial => serial.status === "En réparation").length, icon: Wrench },
          { label: "Fin de vie", value: mockSerials.filter(serial => serial.status === "Retiré").length, icon: Blocks }
        ]}
        filters={filters}
        onDetail={() => onNavigate("/serials")}
      />
    )
  },
  {
    id: "calendar",
    title: "Échéances",
    description: "Retours programmés et garanties à échéance",
    icon: CalendarClock,
    size: "medium",
    render: ({ filters, onNavigate }) => (
      <DashboardWidget.Calendar
        title="Échéances du mois"
        events={[
          ...mockAssignments
            .filter(assignment => assignment.expectedReturn)
            .map(assignment => ({
              id: `assignment-${assignment.id}`,
              date: assignment.expectedReturn!,
              label: `${assignment.assignedTo} - ${assignment.materialName}`,
              type: "return" as const,
              site: assignment.site,
              supplier: assignment.supplier,
              period: "this-month"
            })),
          ...mockSerials
            .filter(serial => serial.warrantyStatus === "warning")
            .map(serial => ({
              id: `warranty-${serial.id}`,
              date: serial.warrantyEnd,
              label: `${serial.materialName} (${serial.serialNumber})`,
              type: "warranty" as const,
              site: serial.site,
              supplier: serial.supplier,
              period: "this-quarter"
            }))
        ]}
        filters={filters}
        onDetail={() => onNavigate("/assignments?view=calendar")}
      />
    )
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ period: "this-quarter", category: "all", supplier: "all", site: "all" });

  const widgets = availableWidgets;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <LayoutGrid className="h-4 w-4" />
            Vue globale
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Surveillez les indicateurs clés de vos opérations en un coup d'œil.
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Package className="h-3 w-3" /> {mockMaterials.length} matériels
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" /> {mockAssignments.length} attributions actives
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> {mockDashboardAlerts.length} alertes
            </Badge>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <DashboardWidget.Filters
            value={filters}
            onChange={setFilters}
            className="w-[320px]"
          />
        </div>
      </div>

      <div className="grid auto-rows-max gap-4 md:grid-cols-2 xl:grid-cols-12">
        {widgets.map(widget => (
          <DashboardWidget
            key={widget.id}
            config={widget}
            filters={filters}
            onNavigate={path => navigate(path)}
          />
        ))}
      </div>

    </div>
  );
};

export default Dashboard;
