import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { mockSerials, SerialStatus, mockAssignments } from "@/lib/mockData";
import { AlertTriangle, History, Plus, Search, ShieldCheck, SlidersHorizontal, UserRound } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const statusColors: Record<SerialStatus, string> = {
  "En stock": "border-success/40 bg-success/10 text-success",
  "Attribué": "border-primary/40 bg-primary/10 text-primary",
  "En réparation": "border-warning/40 bg-warning/10 text-warning",
  "Retiré": "border-border bg-muted/40 text-muted-foreground"
};

const Serials = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<SerialStatus | "all">("all");
  const [selectedSerial, setSelectedSerial] = useState<string | null>(null);

  const filteredSerials = useMemo(() =>
    mockSerials.filter(serial => {
      const matchesSearch = `${serial.serialNumber} ${serial.materialName}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || serial.status === statusFilter;
      return matchesSearch && matchesStatus;
    }),
  [searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
            Traçabilité unitaire
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Numéros de série</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Visualisez la vie de chaque équipement : livraisons, garanties, attributions et incidents.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Créer une série en lot
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer des numéros de série</DialogTitle>
                <DialogDescription>Collez ou importez jusqu'à 100 numéros de série pour un même matériel.</DialogDescription>
              </DialogHeader>
              <Textarea className="h-40" placeholder="Numéro1\nNuméro2\n..." />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => toast.success("Modèle CSV téléchargé")}>Télécharger modèle</Button>
                <Button onClick={() => toast.success("Numéros créés")}>Créer</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button className="gap-2" onClick={() => toast.success("Scanner activé (simulation)") }>
            <SlidersHorizontal className="h-4 w-4" />
            Scanner un code
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher numéro, matériel, utilisateur..."
            className="pl-9"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <ToggleGroup type="single" value={statusFilter} onValueChange={(value) => setStatusFilter((value || "all") as SerialStatus | "all")} className="flex rounded-lg border border-border">
          <ToggleGroupItem value="all" className="flex-1">Tous</ToggleGroupItem>
          <ToggleGroupItem value="En stock" className="flex-1">En stock</ToggleGroupItem>
          <ToggleGroupItem value="Attribué" className="flex-1">Attribué</ToggleGroupItem>
          <ToggleGroupItem value="En réparation" className="flex-1">En réparation</ToggleGroupItem>
          <ToggleGroupItem value="Retiré" className="flex-1">Retiré</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Numéro</TableHead>
              <TableHead>Matériel</TableHead>
              <TableHead>Livraison</TableHead>
              <TableHead>Garantie</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Site</TableHead>
              <TableHead>Attribué à</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSerials.map(serial => (
              <TableRow key={serial.id} className="cursor-pointer hover:bg-muted/60" onClick={() => setSelectedSerial(serial.id)}>
                <TableCell className="font-mono text-sm font-semibold">{serial.serialNumber}</TableCell>
                <TableCell>
                  <div className="font-semibold">{serial.materialName}</div>
                  <p className="text-xs text-muted-foreground">{serial.supplier}</p>
                </TableCell>
                <TableCell>{serial.deliveryDate.toLocaleDateString("fr-FR")}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{serial.warrantyEnd.toLocaleDateString("fr-FR")}</span>
                    {serial.warrantyStatus !== "ok" && (
                      <Badge variant="outline" className={serial.warrantyStatus === "warning" ? "border-warning text-warning" : "border-destructive text-destructive"}>
                        {serial.warrantyStatus === "warning" ? "< 90j" : "Expirée"}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusColors[serial.status]}>
                    {serial.status}
                  </Badge>
                </TableCell>
                <TableCell>{serial.site}</TableCell>
                <TableCell>{serial.assignedTo ?? "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <SerialDetailSheet serialId={selectedSerial} onOpenChange={(open) => !open && setSelectedSerial(null)} />
    </div>
  );
};

const SerialDetailSheet = ({ serialId, onOpenChange }: { serialId: string | null; onOpenChange: (open: boolean) => void }) => {
  const serial = serialId ? mockSerials.find(item => item.id === serialId) : undefined;

  if (!serial) {
    return <Sheet open={false} onOpenChange={onOpenChange} />;
  }

  const assignmentHistory = mockAssignments.filter(assignment => assignment.serialId === serial.id);
  const events = [
    {
      id: "delivery",
      label: "Réception",
      description: `Livré le ${serial.deliveryDate.toLocaleDateString("fr-FR")}`,
      icon: History
    },
    ...assignmentHistory.map((assignment, index) => ({
      id: `assign-${index}`,
      label: `Attribution ${assignment.assignedTo}`,
      description: `Début ${assignment.startDate.toLocaleDateString("fr-FR")}${assignment.expectedReturn ? ` • Retour prévu ${assignment.expectedReturn.toLocaleDateString("fr-FR")}` : ""}`,
      icon: UserRound
    })),
    serial.warrantyStatus !== "ok"
      ? {
          id: "warranty",
          label: "Alerte garantie",
          description: `Expiration le ${serial.warrantyEnd.toLocaleDateString("fr-FR")}`,
          icon: AlertTriangle
        }
      : null
  ].filter(Boolean) as { id: string; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[];

  return (
    <Sheet open={Boolean(serial)} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{serial.serialNumber}</SheetTitle>
          <SheetDescription>{serial.materialName} — {serial.supplier}</SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-full pr-4">
          <div className="space-y-6 py-6">
            <section className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Statut</p>
                  <Badge variant="outline" className={statusColors[serial.status]}>
                    {serial.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Garantie</p>
                  <div className="flex items-center gap-2">
                    <span>{serial.warrantyEnd.toLocaleDateString("fr-FR")}</span>
                    {serial.warrantyStatus !== "ok" && (
                      <Badge variant="outline" className={serial.warrantyStatus === "warning" ? "border-warning text-warning" : "border-destructive text-destructive"}>
                        {serial.warrantyStatus === "warning" ? "< 90j" : "Expirée"}
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Prix d'achat</p>
                  <p className="font-semibold">{new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(serial.purchasePrice)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Site</p>
                  <p className="font-semibold">{serial.site}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => toast.success("Attribution planifiée")}>Attribuer</Button>
                <Button size="sm" variant="outline" onClick={() => toast.success("Passé en réparation")}>Déclarer en réparation</Button>
                <Button size="sm" variant="outline" onClick={() => toast.success("Statut mis à jour")}>Clôturer</Button>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase text-muted-foreground">Historique</h3>
              <div className="relative border-l border-dashed border-border pl-4">
                {events.map(event => {
                  const Icon = event.icon;
                  return (
                    <div key={event.id} className="relative pb-4">
                      <span className="absolute -left-2 flex h-4 w-4 items-center justify-center rounded-full border border-primary bg-background">
                        <Icon className="h-3 w-3 text-primary" />
                      </span>
                      <p className="text-sm font-semibold">{event.label}</p>
                      <p className="text-xs text-muted-foreground">{event.description}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase text-muted-foreground">Assignations en cours</h3>
              {assignmentHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune attribution active.</p>
              ) : (
                assignmentHistory.map(assignment => (
                  <div key={assignment.id} className="rounded border border-border bg-muted/30 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{assignment.assignedTo}</span>
                      {assignment.expectedReturn && (
                        <Badge variant="outline" className="text-xs">Retour {assignment.expectedReturn.toLocaleDateString("fr-FR")}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Attribué le {assignment.startDate.toLocaleDateString("fr-FR")}</p>
                  </div>
                ))
              )}
            </section>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default Serials;
