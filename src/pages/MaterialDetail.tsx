import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { Material, Serial } from "@/lib/mockData";
import { ArrowLeft, Edit, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MaterialForm } from "@/components/forms/MaterialForm";
import { AssignmentForm } from "@/components/forms/AssignmentForm";
import { cn } from "@/lib/utils";

const MaterialDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [material, setMaterial] = useState<Material | null>(null);
  const [serials, setSerials] = useState<Serial[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedSerial, setSelectedSerial] = useState<string>("");
  const [serialFilter, setSerialFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    
    const materialData = await db.materials.get(id);
    if (materialData) {
      setMaterial(materialData);
    }

    const serialsData = await db.serials.where('materialId').equals(id).toArray();
    setSerials(serialsData);
  };

  if (!material) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  const filteredSerials = serials.filter(serial => {
    const matchesSerial = serial.serialNumber.toLowerCase().includes(serialFilter.toLowerCase());
    const matchesStatus = statusFilter === "all" || serial.status === statusFilter;
    return matchesSerial && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/materials')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{material.name}</h1>
          <p className="text-muted-foreground mt-1">
            Référence: {material.internalRef} • Fournisseur: {material.defaultSupplier}
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowEditDialog(true)}>
          <Edit className="h-4 w-4" />
          Modifier
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Stock disponible</p>
          <p className="text-2xl font-bold">{material.stock}</p>
          <p className="text-xs text-muted-foreground mt-1">Seuil d'alerte: {material.lowStockThreshold}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Prix unitaire</p>
          <p className="text-2xl font-bold">{material.defaultUnitPrice.toFixed(2)} €</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Catégorie</p>
          <Badge variant="secondary" className="mt-2">{material.category}</Badge>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Site</p>
          <p className="text-lg font-semibold mt-1">{material.site}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Numéros de série</h2>
          <Button className="gap-2" onClick={() => {
            setSelectedSerial("");
            setShowAssignDialog(true);
          }}>
            <Plus className="h-4 w-4" />
            Nouvelle attribution
          </Button>
        </div>

        <div className="flex gap-4">
          <Input
            placeholder="Filtrer par numéro de série..."
            value={serialFilter}
            onChange={(e) => setSerialFilter(e.target.value)}
            className="max-w-xs"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">Tous les statuts</option>
            <option value="En stock">En stock</option>
            <option value="Attribué">Attribué</option>
            <option value="En réparation">En réparation</option>
            <option value="Retiré">Retiré</option>
          </select>
        </div>

        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro de série</TableHead>
                <TableHead>Date de livraison</TableHead>
                <TableHead>Fin de garantie</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Attribué à</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSerials.map(serial => (
                <TableRow key={serial.id}>
                  <TableCell className="font-mono text-xs">{serial.serialNumber}</TableCell>
                  <TableCell>{serial.deliveryDate.toLocaleDateString("fr-FR")}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{serial.warrantyEnd.toLocaleDateString("fr-FR")}</span>
                      {serial.warrantyStatus !== "ok" && (
                        <Badge variant="outline" className={cn(
                          serial.warrantyStatus === "warning" ? "border-warning text-warning" : "border-destructive text-destructive"
                        )}>
                          {serial.warrantyStatus === "warning" ? "< 90j" : "Expirée"}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={serial.status === "En stock" ? "default" : "secondary"}>
                      {serial.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{serial.assignedTo ?? "-"}</TableCell>
                  <TableCell>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedSerial(serial.serialNumber);
                        setShowAssignDialog(true);
                      }}
                    >
                      Attribuer
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le matériel</DialogTitle>
            <DialogDescription>
              Modifiez les informations de ce matériel.
            </DialogDescription>
          </DialogHeader>
          <MaterialForm 
            material={material}
            onSuccess={() => {
              setShowEditDialog(false);
              loadData();
              toast.success("Matériel mis à jour");
            }} 
            onCancel={() => setShowEditDialog(false)} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouvelle attribution</DialogTitle>
            <DialogDescription>
              Attribuez ce matériel à un utilisateur.
            </DialogDescription>
          </DialogHeader>
          <AssignmentForm 
            prefilledSerial={selectedSerial}
            prefilledMaterialName={material.name}
            onSuccess={() => {
              setShowAssignDialog(false);
              loadData();
              toast.success("Attribution créée");
            }} 
            onCancel={() => setShowAssignDialog(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaterialDetail;
