import { ReactNode, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  MoveRight,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { addDays, format } from "date-fns";
import { fr } from "date-fns/locale";

export type DashboardFilters = {
  period: string;
  category: string;
  supplier: string;
  site: string;
};

export interface DashboardWidgetRenderProps {
  filters: DashboardFilters;
  onNavigate: (path: string) => void;
}

export interface DashboardWidgetConfig {
  id: string;
  title: string;
  description: string;
  size: "small" | "medium" | "large";
  icon: React.ComponentType<{ className?: string }>;
  render: (props: DashboardWidgetRenderProps & { filters: DashboardFilters }) => ReactNode;
}

interface DashboardWidgetProps {
  config: DashboardWidgetConfig;
  filters: DashboardFilters;
  onNavigate: (path: string) => void;
}

const sizeToColumn: Record<DashboardWidgetConfig["size"], string> = {
  small: "md:col-span-1 xl:col-span-4",
  medium: "md:col-span-2 xl:col-span-6",
  large: "md:col-span-2 xl:col-span-12"
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);

export const DashboardWidget = ({ config, filters, onNavigate }: DashboardWidgetProps) => {
  const Icon = config.icon;

  return (
    <Card className={cn("border-border shadow-sm transition-all", sizeToColumn[config.size])}>
      <CardHeader className="gap-4 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon className="h-4 w-4" />
            Widget
          </div>
          <CardTitle className="text-lg font-semibold">{config.title}</CardTitle>
          <p className="text-sm text-muted-foreground max-w-[520px]">{config.description}</p>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {config.render({ filters, onNavigate })}
      </CardContent>
    </Card>
  );
};

interface FilterProps {
  value: DashboardFilters;
  onChange: (value: DashboardFilters) => void;
  className?: string;
}

const Filters = ({ value, onChange, className }: FilterProps) => (
  <div className={cn("grid gap-2 rounded-lg border border-dashed border-border bg-card/60 p-3", className)}>
    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Filtres du dashboard</p>
    <div className="grid grid-cols-2 gap-2">
      <Select
        value={value.period}
        onValueChange={(period) => onChange({ ...value, period })}
      >
        <SelectTrigger className="h-9 text-xs">
          <SelectValue placeholder="Période" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="this-month">Ce mois-ci</SelectItem>
          <SelectItem value="this-quarter">Ce trimestre</SelectItem>
          <SelectItem value="this-year">Cette année</SelectItem>
          <SelectItem value="rolling-12">Glissant 12 mois</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={value.category}
        onValueChange={(category) => onChange({ ...value, category })}
      >
        <SelectTrigger className="h-9 text-xs">
          <SelectValue placeholder="Catégorie" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes catégories</SelectItem>
          <SelectItem value="PC Portable">PC Portable</SelectItem>
          <SelectItem value="Smartphone">Smartphone</SelectItem>
          <SelectItem value="Dock">Dock</SelectItem>
          <SelectItem value="Écran">Écran</SelectItem>
          <SelectItem value="Accessoire">Accessoire</SelectItem>
          <SelectItem value="Tablette">Tablette</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={value.supplier}
        onValueChange={(supplier) => onChange({ ...value, supplier })}
      >
        <SelectTrigger className="h-9 text-xs">
          <SelectValue placeholder="Fournisseur" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous fournisseurs</SelectItem>
          <SelectItem value="ACME Corp">ACME Corp</SelectItem>
          <SelectItem value="Contoso">Contoso</SelectItem>
          <SelectItem value="Globex">Globex</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={value.site}
        onValueChange={(site) => onChange({ ...value, site })}
      >
        <SelectTrigger className="h-9 text-xs">
          <SelectValue placeholder="Site" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous sites</SelectItem>
          <SelectItem value="Paris">Paris</SelectItem>
          <SelectItem value="Lyon">Lyon</SelectItem>
          <SelectItem value="Marseille">Marseille</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
);

interface ChartWidgetProps {
  title: string;
  subtitle?: string;
  data: Array<{ name: string; value: number; threshold?: number; supplier?: string; site?: string; period?: string; category?: string }>;
  filters: DashboardFilters;
  onDetail: () => void;
}

const ChartWidget = ({ title, subtitle, data, filters, onDetail }: ChartWidgetProps) => {
  const filteredData = useMemo(
    () =>
      data
        .filter(item => filters.category === "all" || item.category === filters.category)
        .filter(item => filters.site === "all" || item.site === filters.site)
        .filter(item => filters.supplier === "all" || item.supplier === filters.supplier)
        .map(item => ({
          name: item.name,
          stock: item.value,
          threshold: item.threshold ?? 0
        })),
    [data, filters]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <Button variant="ghost" size="sm" onClick={onDetail} className="gap-1 text-xs">
          Voir le détail
          <MoveRight className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="h-48">
        <ChartContainer
          className="h-full"
          config={{
            stock: { label: "Stock", color: "hsl(var(--primary))" },
            threshold: { label: "Seuil", color: "hsl(var(--destructive))" }
          }}
        >
          <BarChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} width={36} tick={{ fontSize: 12 }} />
            <Bar dataKey="stock" radius={[4, 4, 0, 0]} fill="var(--color-stock)" />
            <Bar dataKey="threshold" radius={[4, 4, 0, 0]} fill="var(--color-threshold)" />
            <ChartTooltip cursor={{ fill: "hsl(var(--muted))" }} content={<ChartTooltipContent />} />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
};

interface ListWidgetProps {
  title: string;
  metric: number;
  metricLabel: string;
  items: Array<{ id: string; primary: string; secondary: string; status?: string; supplier?: string; site?: string; period?: string }>;
  filters: DashboardFilters;
  onDetail: () => void;
}

const ListWidget = ({ title, metric, metricLabel, items, filters, onDetail }: ListWidgetProps) => {
  const filteredItems = useMemo(
    () =>
      items.filter(item =>
        (filters.supplier === "all" || item.supplier === filters.supplier) &&
        (filters.site === "all" || item.site === filters.site)
      ),
    [filters, items]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{metricLabel}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{metric}</p>
        </div>
      </div>
      <Separator />
      <ScrollArea className="h-48">
        <div className="space-y-3 pr-4">
          {filteredItems.slice(0, 6).map(item => (
            <div key={item.id} className="space-y-1">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>{item.primary}</span>
                {item.status && (
                  <Badge variant="outline" className="text-xs">
                    {item.status}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{item.secondary}</p>
            </div>
          ))}
          {filteredItems.length === 0 && (
            <p className="text-xs text-muted-foreground">Aucun élément correspondant aux filtres.</p>
          )}
        </div>
      </ScrollArea>
      <Button variant="ghost" size="sm" className="w-full" onClick={onDetail}>
        Voir le détail
      </Button>
    </div>
  );
};

interface TimelineWidgetProps {
  title: string;
  events: Array<{ id: string; title: string; description?: string; date: Date; site?: string; supplier?: string; period?: string }>;
  filters: DashboardFilters;
  onDetail: () => void;
}

const TimelineWidget = ({ title, events, filters, onDetail }: TimelineWidgetProps) => {
  const filteredEvents = useMemo(
    () =>
      events
        .filter(event => filters.site === "all" || event.site === filters.site)
        .filter(event => filters.supplier === "all" || event.supplier === filters.supplier)
        .sort((a, b) => b.date.getTime() - a.date.getTime()),
    [events, filters]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">Derniers mouvements et incidents</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onDetail} className="gap-1 text-xs">
          Voir le détail
          <MoveRight className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="relative ml-3 space-y-6 border-l border-dashed border-border pl-6">
        {filteredEvents.slice(0, 6).map(event => (
          <div key={event.id} className="relative">
            <span className="absolute -left-[13px] flex h-3 w-3 items-center justify-center rounded-full border border-primary bg-background" />
            <p className="text-xs text-muted-foreground">
              {format(event.date, "dd MMMM yyyy", { locale: fr })}
            </p>
            <p className="text-sm font-semibold">{event.title}</p>
            {event.description && <p className="text-xs text-muted-foreground">{event.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

interface KpiWidgetProps {
  title: string;
  value: number;
  currency?: string;
  comparison?: { label: string; value: number; direction: "up" | "down" };
  filters: DashboardFilters;
  onDetail: () => void;
}

const KpiWidget = ({ title, value, currency, comparison, onDetail }: KpiWidgetProps) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">Basé sur les prix d'achat</p>
      </div>
      <Button variant="ghost" size="sm" onClick={onDetail} className="gap-1 text-xs">
        Voir le détail
        <MoveRight className="h-3.5 w-3.5" />
      </Button>
    </div>
    <p className="text-3xl font-bold tracking-tight">{currency ? formatCurrency(value) : value}</p>
    {comparison && (
      <div className={cn("flex items-center gap-2 text-xs font-medium", comparison.direction === "up" ? "text-success" : "text-destructive")}
      >
        {comparison.direction === "up" ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
        {comparison.value}% {comparison.label}
      </div>
    )}
  </div>
);

interface AlertListWidgetProps {
  title: string;
  alerts: Array<{ id: string; title: string; description: string; severity: "warning" | "critical"; site?: string; supplier?: string; period?: string }>;
  filters: DashboardFilters;
  onDetail: () => void;
}

const AlertListWidget = ({ title, alerts, filters, onDetail }: AlertListWidgetProps) => {
  const filteredAlerts = useMemo(
    () =>
      alerts.filter(alert =>
        (filters.site === "all" || alert.site === filters.site) &&
        (filters.supplier === "all" || alert.supplier === filters.supplier)
      ),
    [alerts, filters]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">Garanties expirées, seuils bas et incidents</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onDetail} className="gap-1 text-xs">
          Voir le détail
          <MoveRight className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="space-y-3">
        {filteredAlerts.slice(0, 6).map(alert => (
          <div key={alert.id} className={cn("rounded-lg border p-3", alert.severity === "critical" ? "border-destructive/50 bg-destructive/10" : "border-warning/40 bg-warning/10")}
          >
            <div className="flex items-center justify-between text-sm font-medium">
              <span>{alert.title}</span>
              {alert.severity === "critical" ? (
                <Badge variant="outline" className="border-destructive text-destructive">
                  Critique
                </Badge>
              ) : (
                <Badge variant="outline" className="border-warning text-warning">
                  Alerte
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
          </div>
        ))}
        {filteredAlerts.length === 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-border p-3 text-xs text-muted-foreground">
            <XCircle className="h-4 w-4" />
            Aucun signal critique pour les filtres sélectionnés.
          </div>
        )}
      </div>
    </div>
  );
};

interface MultiMetricWidgetProps {
  title: string;
  metrics: Array<{ label: string; value: number; icon: React.ComponentType<{ className?: string }> }>;
  filters: DashboardFilters;
  onDetail: () => void;
}

const MultiMetricWidget = ({ title, metrics, onDetail }: MultiMetricWidgetProps) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">Suivi des statuts du parc matériel</p>
      </div>
      <Button variant="ghost" size="sm" onClick={onDetail} className="gap-1 text-xs">
        Voir le détail
        <MoveRight className="h-3.5 w-3.5" />
      </Button>
    </div>
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map(metric => {
        const Icon = metric.icon;
        return (
          <div key={metric.label} className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center justify-between">
              <Icon className="h-4 w-4 text-primary" />
              <span className="text-2xl font-semibold">{metric.value}</span>
            </div>
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{metric.label}</p>
          </div>
        );
      })}
    </div>
  </div>
);

interface CalendarWidgetProps {
  title: string;
  events: Array<{ id: string; date: Date; label: string; type: "return" | "warranty"; site?: string; supplier?: string; period?: string }>;
  filters: DashboardFilters;
  onDetail: () => void;
}

const CalendarWidget = ({ title, events, filters, onDetail }: CalendarWidgetProps) => {
  const start = new Date();
  const days = Array.from({ length: 14 }).map((_, index) => addDays(start, index));
  const eventsByDay = useMemo(() => {
    return days.map(day => ({
      day,
      events: events.filter(event =>
        (filters.site === "all" || event.site === filters.site) &&
        (filters.supplier === "all" || event.supplier === filters.supplier) &&
        format(event.date, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
      )
    }));
  }, [days, events, filters]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">14 prochains jours</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onDetail} className="gap-1 text-xs">
          Voir le détail
          <MoveRight className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {eventsByDay.map(({ day, events: dayEvents }) => (
          <div key={day.toISOString()} className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground">
              {format(day, "EEE dd MMM", { locale: fr })}
            </p>
            <div className="mt-2 space-y-2">
              {dayEvents.map(event => (
                <div key={event.id} className="rounded border border-border bg-background p-2 text-xs">
                  <div className="flex items-center gap-2 font-medium">
                    {event.type === "return" ? <MoveRight className="h-3.5 w-3.5 text-primary" /> : <AlertTriangle className="h-3.5 w-3.5 text-warning" />}
                    {event.label}
                  </div>
                </div>
              ))}
              {dayEvents.length === 0 && (
                <p className="text-xs text-muted-foreground">Aucune échéance.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

DashboardWidget.Filters = Filters;
DashboardWidget.Chart = ChartWidget;
DashboardWidget.List = ListWidget;
DashboardWidget.Timeline = TimelineWidget;
DashboardWidget.Kpi = KpiWidget;
DashboardWidget.AlertList = AlertListWidget;
DashboardWidget.MultiMetric = MultiMetricWidget;
DashboardWidget.Calendar = CalendarWidget;

export { Filters as DashboardFiltersControl };

