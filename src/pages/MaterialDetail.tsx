import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Material, Serial, SerialStatus } from "@/lib/mockData";
import { ArrowLeft, ArrowUpDown, Edit, FileText, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { addDays, format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MaterialForm } from "@/components/forms/MaterialForm";
import { AssignmentForm } from "@/components/forms/AssignmentForm";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MaterialDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [material, setMaterial] = useState<Material | null>(null);
  const [serials, setSerials] = useState<Serial[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedSerial, setSelectedSerial] = useState<string>("");
  const [serialFilter, setSerialFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assignedToFilter, setAssignedToFilter] = useState("");
  const [deliveryDateSort, setDeliveryDateSort] = useState<"asc" | "desc" | null>(null);
  const [warrantyEndSort, setWarrantyEndSort] = useState<"asc" | "desc" | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    
    // Load material from Supabase
    const { data: supabaseMaterial, error: materialError } = await supabase
      .from('materials')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (materialError) {
      console.error('Error loading material:', materialError);
      toast.error('Erreur lors du chargement du matériel');
      return;
    }

    if (supabaseMaterial) {
      // Map to local Material format
      const materialData: Material = {
        id: supabaseMaterial.id,
        name: supabaseMaterial.name,
        internalRef: supabaseMaterial.name,
        category: 'Accessoire',
        stock: supabaseMaterial.stock,
        lowStockThreshold: supabaseMaterial.min_stock || 0,
        tags: [],
        site: 'Siège',
        defaultSupplier: supabaseMaterial.manufacturer || 'Inconnu',
        defaultUnitPrice: supabaseMaterial.unit_price || 0,
        pendingDeliveries: 0,
        nonSerializedStock: 0
      };
      setMaterial(materialData);
    }

    // Load serials from Supabase
    const { data: supabaseSerials, error: serialsError } = await supabase
      .from('serials')
      .select('*')
      .eq('material_id', id);

    if (serialsError) {
      console.error('Error loading serials:', serialsError);
      toast.error('Erreur lors du chargement des numéros de série');
      return;
    }

    // Map to local Serial format
    const serialsData: Serial[] = (supabaseSerials || []).map(serial => {
      const deliveryDate = new Date(serial.purchase_date || serial.created_at);
      const warrantyEnd = serial.warranty_end ? new Date(serial.warranty_end) : addDays(deliveryDate, 365);
      
      return {
        id: serial.id,
        serialNumber: serial.serial_number,
        materialId: serial.material_id,
        materialName: supabaseMaterial?.name || '',
        status: serial.status as SerialStatus,
        deliveryDate,
        warrantyStart: deliveryDate,
        warrantyEnd,
        supplier: supabaseMaterial?.manufacturer || 'Inconnu',
        site: serial.location || 'Siège',
        assignedTo: '',
        purchasePrice: 0,
        warrantyStatus: warrantyEnd < new Date() ? 'expired' : warrantyEnd < addDays(new Date(), 90) ? 'warning' : 'ok'
      };
    });

    setSerials(serialsData);

    // Load assignment documents for this material's serials
    const serialIds = supabaseSerials?.map(s => s.id) || [];
    if (serialIds.length > 0) {
      const { data: docsData, error: docsError } = await supabase
        .from('assignment_documents')
        .select(`
          *,
          assignments!inner(
            serial_id,
            assigned_to,
            start_date,
            serials!inner(
              serial_number,
              material_id
            )
          )
        `)
        .in('assignments.serial_id', serialIds);

      if (!docsError && docsData) {
        setDocuments(docsData);
      }
    }
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
    const matchesAssignedTo = !assignedToFilter || (serial.assignedTo && serial.assignedTo.toLowerCase().includes(assignedToFilter.toLowerCase()));
    return matchesSerial && matchesStatus && matchesAssignedTo;
  }).sort((a, b) => {
    if (deliveryDateSort === "asc") return a.deliveryDate.getTime() - b.deliveryDate.getTime();
    if (deliveryDateSort === "desc") return b.deliveryDate.getTime() - a.deliveryDate.getTime();
    if (warrantyEndSort === "asc") return a.warrantyEnd.getTime() - b.warrantyEnd.getTime();
    if (warrantyEndSort === "desc") return b.warrantyEnd.getTime() - a.warrantyEnd.getTime();
    return 0;
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

      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents d'attribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {documents.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium">{doc.assignments.assigned_to}</p>
                    <p className="text-sm text-muted-foreground">
                      N° série: {doc.assignments.serials.serial_number} • {format(new Date(doc.assignments.start_date), "dd/MM/yyyy")}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const printWindow = window.open("", "_blank");
                      if (printWindow) {
                        printWindow.document.write(doc.document_html);
                        printWindow.document.close();
                      }
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Voir le document
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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

        <div className="flex flex-wrap gap-4">
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
            <option value="Télétravail">Télétravail</option>
          </select>
          <Input
            placeholder="Filtrer par attributaire..."
            value={assignedToFilter}
            onChange={(e) => setAssignedToFilter(e.target.value)}
            className="max-w-xs"
          />
        </div>

        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro de série</TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => {
                    setWarrantyEndSort(null);
                    setDeliveryDateSort(deliveryDateSort === "asc" ? "desc" : "asc");
                  }}>
                    Date de livraison
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => {
                    setDeliveryDateSort(null);
                    setWarrantyEndSort(warrantyEndSort === "asc" ? "desc" : "asc");
                  }}>
                    Fin de garantie
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
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
                    <Select 
                      value={serial.status} 
                      onValueChange={async (value: SerialStatus) => {
                        await db.serials.update(serial.id, { status: value });
                        loadData();
                        toast.success("Statut mis à jour");
                      }}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="En stock">En stock</SelectItem>
                        <SelectItem value="Attribué">Attribué</SelectItem>
                        <SelectItem value="En réparation">En réparation</SelectItem>
                        <SelectItem value="Retiré">Retiré</SelectItem>
                        <SelectItem value="Télétravail">Télétravail</SelectItem>
                      </SelectContent>
                    </Select>
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
