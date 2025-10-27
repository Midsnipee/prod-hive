import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockOrders, Order, OrderStatus, mockSuppliers } from "@/lib/mockData";
import { CalendarIcon, FileText, Filter, MoreHorizontal, Plus, Search, Tags, Download } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const statusColors: Record<OrderStatus, string> = {
  "Demandé": "border-border bg-muted text-muted-foreground",
  "Circuit interne": "border-warning/30 bg-warning/10 text-warning",
  "Commande fournisseur faite": "border-primary/40 bg-primary/10 text-primary",
  "Livré": "border-success/40 bg-success/10 text-success"
};

const statusSteps: OrderStatus[] = ["Demandé", "Circuit interne", "Commande fournisseur faite", "Livré"];

type DateRange = {
  from?: Date;
  to?: Date;
};

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<OrderStatus[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange>({});
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const suppliers = useMemo(() => Array.from(new Set(mockSuppliers.map(supplier => supplier.name))), []);

  const filteredOrders = useMemo(() => {
    return mockOrders.filter(order => {
      const matchesSearch = `${order.reference} ${order.supplier}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(order.status);
      const matchesSupplier = selectedSupplier === "all" || order.supplier === selectedSupplier;
      const matchesDate = (!dateRange.from || order.createdAt >= dateRange.from) && (!dateRange.to || order.createdAt <= dateRange.to);
      return matchesSearch && matchesStatus && matchesSupplier && matchesDate;
    });
  }, [searchTerm, selectedStatuses, selectedSupplier, dateRange]);

  const toggleStatus = (status: OrderStatus) => {
    setSelectedStatuses(prev => prev.includes(status) ? prev.filter(item => item !== status) : [...prev, status]);
  };

  const clearFilters = () => {
    setSelectedStatuses([]);
    setSelectedSupplier("all");
    setDateRange({});
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            Cycle de commande
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Commandes & devis</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Pilotez l'ensemble du cycle achat : demandes internes, commandes fournisseurs, livraisons partielles et pièces jointes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exporter la vue
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nouveau devis
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par référence, fournisseur, tag..."
            className="pl-9"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setFiltersOpen(true)}>
            <Filter className="h-4 w-4" />
            Filtres
          </Button>
          {(selectedStatuses.length > 0 || selectedSupplier !== "all" || dateRange.from || dateRange.to) && (
            <Button variant="ghost" onClick={clearFilters}>
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {selectedStatuses.map(status => (
          <Badge key={status} variant="outline" className="gap-1 border-dashed">
            <Tags className="h-3 w-3" />
            {status}
          </Badge>
        ))}
        {selectedSupplier !== "all" && (
          <Badge variant="outline" className="gap-1 border-dashed">
            <Tags className="h-3 w-3" />
            {selectedSupplier}
          </Badge>
        )}
        {dateRange.from && (
          <Badge variant="outline" className="gap-1 border-dashed">
            <CalendarIcon className="h-3 w-3" />
            Du {format(dateRange.from, "dd MMM", { locale: fr })}
            {dateRange.to && <> au {format(dateRange.to, "dd MMM yyyy", { locale: fr })}</>}
          </Badge>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Référence</TableHead>
              <TableHead>Fournisseur</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Livraison</TableHead>
              <TableHead>Demandé par</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map(order => (
              <TableRow key={order.id} className="cursor-pointer hover:bg-muted/60" onClick={() => setSelectedOrder(order)}>
                <TableCell className="font-mono text-sm font-medium">
                  {order.reference}
                  <div className="mt-1 flex gap-1">
                    {order.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-[11px] font-normal">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{order.supplier}</TableCell>
                <TableCell className="font-semibold">
                  {new Intl.NumberFormat("fr-FR", { style: "currency", currency: order.currency }).format(order.amount)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusColors[order.status]}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {order.expectedDelivery
                    ? format(order.expectedDelivery, "dd MMM yyyy", { locale: fr })
                    : "Livré"}
                </TableCell>
                <TableCell>{order.requestedBy}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={(event) => event.stopPropagation()}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toast.success("Lien de partage copié")}>Partager</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.success("Commande dupliquée")}>Dupliquer</DropdownMenuItem>
                      <DropdownMenuItem>Exporter en PDF</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <FiltersSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        selectedStatuses={selectedStatuses}
        onToggleStatus={toggleStatus}
        selectedSupplier={selectedSupplier}
        onSupplierChange={setSelectedSupplier}
        suppliers={suppliers}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      <OrderDetailSheet order={selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)} />
    </div>
  );
};

interface FiltersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStatuses: OrderStatus[];
  onToggleStatus: (status: OrderStatus) => void;
  selectedSupplier: string;
  onSupplierChange: (value: string) => void;
  suppliers: string[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

const FiltersSheet = ({
  open,
  onOpenChange,
  selectedStatuses,
  onToggleStatus,
  selectedSupplier,
  onSupplierChange,
  suppliers,
  dateRange,
  onDateRangeChange
}: FiltersSheetProps) => {
  const updateDate = (type: keyof DateRange, value?: Date) => {
    onDateRangeChange({ ...dateRange, [type]: value });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Filtres avancés</SheetTitle>
          <SheetDescription>Affinez l'affichage des commandes selon vos critères.</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold">Statuts</h3>
            <div className="mt-3 grid grid-cols-1 gap-2">
              {statusSteps.map(status => (
                <label key={status} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">{status}</p>
                    <p className="text-xs text-muted-foreground">
                      {status === "Commande fournisseur faite" ? "Commande passée, en attente de livraison" : status === "Circuit interne" ? "Validation budgétaire et achats" : status === "Livré" ? "Commande réceptionnée" : "Demande initiale"}
                    </p>
                  </div>
                  <Checkbox checked={selectedStatuses.includes(status)} onCheckedChange={() => onToggleStatus(status)} />
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Fournisseur</h3>
            <div className="mt-3 grid gap-2">
              <label className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="text-sm">Tous fournisseurs</span>
                <Checkbox checked={selectedSupplier === "all"} onCheckedChange={() => onSupplierChange("all")} />
              </label>
              {suppliers.map(supplier => (
                <label key={supplier} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <span className="text-sm">{supplier}</span>
                  <Checkbox checked={selectedSupplier === supplier} onCheckedChange={() => onSupplierChange(supplier)} />
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Période</h3>
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
              <p className="text-xs text-muted-foreground">Sélectionnez un intervalle (jj/mm/aaaa)</p>
              <div className="mt-3 grid gap-3">
                <label className="space-y-1">
                  <span className="text-xs text-muted-foreground">Date de début</span>
                  <Input
                    type="date"
                    value={dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : ""}
                    onChange={(event) => updateDate("from", event.target.value ? new Date(event.target.value) : undefined)}
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs text-muted-foreground">Date de fin</span>
                  <Input
                    type="date"
                    value={dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : ""}
                    onChange={(event) => updateDate("to", event.target.value ? new Date(event.target.value) : undefined)}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

const OrderDetailSheet = ({ order, onOpenChange }: { order: Order | null; onOpenChange: (open: boolean) => void }) => {
  const [status, setStatus] = useState<OrderStatus | undefined>(order?.status);

  useEffect(() => {
    setStatus(order?.status);
  }, [order]);

  const updateStatus = (value: OrderStatus) => {
    setStatus(value);
    toast.success(`Statut mis à jour : ${value}`);
  };

  return (
    <Sheet open={Boolean(order)} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl">
        {order && (
          <ScrollArea className="h-full pr-4">
            <SheetHeader className="sticky top-0 z-10 bg-card pb-4">
              <SheetTitle className="flex items-center justify-between gap-4">
                <span>{order.reference}</span>
                <Badge variant="outline" className={statusColors[status ?? order.status]}>
                  {status ?? order.status}
                </Badge>
              </SheetTitle>
              <SheetDescription className="flex flex-wrap items-center gap-2 text-sm">
                <span>Fournisseur : <strong>{order.supplier}</strong></span>
                <Separator orientation="vertical" className="h-4" />
                <span>Demandé par : {order.requestedBy}</span>
                <Separator orientation="vertical" className="h-4" />
                <span>Créé le {format(order.createdAt, "dd MMM yyyy", { locale: fr })}</span>
              </SheetDescription>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button variant="outline" size="sm" className="gap-1" onClick={() => updateStatus("Circuit interne")}>Passer en circuit interne</Button>
                <Button variant="outline" size="sm" className="gap-1" onClick={() => updateStatus("Commande fournisseur faite")}>Commande fournisseur faite</Button>
                <Button variant="outline" size="sm" className="gap-1" onClick={() => updateStatus("Livré")}>Marquer comme livré</Button>
              </div>
            </SheetHeader>

            <div className="space-y-6 py-6">
              <section className="rounded-lg border border-border bg-muted/40 p-4">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">Progression</h3>
                <div className="mt-3 grid gap-3 md:grid-cols-4">
                  {statusSteps.map((step, index) => {
                    const currentStatus = status ?? order.status;
                    const isCompleted = statusSteps.indexOf(currentStatus) >= index;
                    return (
                      <div
                        key={step}
                        className={cn(
                          "rounded-lg border p-3 text-sm",
                          isCompleted ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground"
                        )}
                      >
                        <p className="font-medium">{step}</p>
                        <p className="mt-1 text-xs">
                          {order.history[index]?.details || "Statut enregistré"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase text-muted-foreground">Lignes de commande</h3>
                  <span className="text-sm text-muted-foreground">Montant total : {new Intl.NumberFormat("fr-FR", { style: "currency", currency: order.currency }).format(order.amount)}</span>
                </div>
                <div className="rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Article</TableHead>
                        <TableHead>Quantité</TableHead>
                        <TableHead>PU</TableHead>
                        <TableHead>TVA</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.lines.map(line => (
                        <TableRow key={line.id}>
                          <TableCell>{line.description}</TableCell>
                          <TableCell>{line.quantity}</TableCell>
                          <TableCell>{new Intl.NumberFormat("fr-FR", { style: "currency", currency: order.currency }).format(line.unitPrice)}</TableCell>
                          <TableCell>{line.taxRate}%</TableCell>
                          <TableCell className="text-right font-medium">
                            {new Intl.NumberFormat("fr-FR", { style: "currency", currency: order.currency }).format(line.unitPrice * line.quantity)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">Livraisons</h3>
                {order.deliveries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune livraison enregistrée pour le moment.</p>
                ) : (
                  order.deliveries.map(delivery => (
                    <div key={delivery.id} className="rounded-lg border border-border bg-muted/30 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                        <span>BL {delivery.deliveryNoteRef}</span>
                        <span>Livré le {format(delivery.deliveredAt, "dd MMM yyyy", { locale: fr })}</span>
                      </div>
                      <Separator className="my-3" />
                      <div className="grid gap-2 text-sm">
                        {delivery.items.map(item => (
                          <div key={item.lineId} className="flex items-center justify-between">
                            <span>{item.quantity} / {order.lines.find(line => line.id === item.lineId)?.quantity} reçus</span>
                            <Badge variant="outline" className="text-xs">Partiel</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">Pièces jointes</h3>
                <div className="grid gap-2 md:grid-cols-2">
                  {order.files.map(file => (
                    <Button key={file.id} variant="outline" className="justify-start gap-2" size="sm">
                      <FileText className="h-4 w-4" />
                      {file.name}
                    </Button>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">Historique</h3>
                <div className="relative border-l border-dashed border-border pl-4">
                  {order.history.map(activity => (
                    <div key={activity.id} className="relative pb-4">
                      <span className="absolute -left-2 h-3 w-3 rounded-full border border-primary bg-background" />
                      <p className="text-xs text-muted-foreground">{format(activity.at, "dd MMM yyyy", { locale: fr })}</p>
                      <p className="text-sm font-semibold">{activity.action}</p>
                      {activity.details && <p className="text-xs text-muted-foreground">{activity.details}</p>}
                      <p className="mt-1 text-xs text-muted-foreground">Par {activity.user}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default Orders;
