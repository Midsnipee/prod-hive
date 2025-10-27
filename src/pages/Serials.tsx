import { AppLayout } from "@/components/layout/AppLayout";
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
import { Search, Filter, Plus } from "lucide-react";
import { mockSerials, mockMaterials } from "@/lib/mockData";
import { useState } from "react";

const statusColors = {
  "En stock": "bg-success/10 text-success border-success",
  "Attribué": "bg-primary/10 text-primary border-primary",
  "En réparation": "bg-warning/10 text-warning border-warning",
  "Retiré": "bg-muted text-muted-foreground"
};

const Serials = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const serialsWithMaterial = mockSerials.map(serial => ({
    ...serial,
    material: mockMaterials.find(m => m.id === serial.materialId)
  }));

  const filteredSerials = serialsWithMaterial.filter(serial =>
    serial.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    serial.material?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Numéros de série</h1>
            <p className="text-muted-foreground mt-1">
              Suivre chaque unité de matériel individuellement
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une série
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par numéro de série, matériel..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>
        </div>

        <div className="bg-card border border-border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro de série</TableHead>
                <TableHead>Matériel</TableHead>
                <TableHead>Livraison</TableHead>
                <TableHead>Garantie</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Attribué à</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSerials.map((serial) => {
                const warrantyEndDate = new Date(serial.warrantyEnd);
                const now = new Date();
                const daysUntilExpiry = Math.floor((warrantyEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                const warrantyExpiringSoon = daysUntilExpiry > 0 && daysUntilExpiry <= 90;

                return (
                  <TableRow key={serial.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-mono font-medium">{serial.serialNumber}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{serial.material?.name}</div>
                        <div className="text-sm text-muted-foreground">{serial.material?.category}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(serial.deliveryDate).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {new Date(serial.warrantyEnd).toLocaleDateString('fr-FR')}
                        </span>
                        {warrantyExpiringSoon && (
                          <Badge variant="outline" className="text-warning border-warning text-xs">
                            {daysUntilExpiry}j
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[serial.status]}>
                        {serial.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {serial.assignedTo || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Détails
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
};

export default Serials;
