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
import { Plus, Search, Filter, Download } from "lucide-react";
import { mockMaterials } from "@/lib/mockData";
import { useState } from "react";

const Materials = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMaterials = mockMaterials.filter(material =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.internalRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Matériels</h1>
            <p className="text-muted-foreground mt-1">
              Gérer le catalogue et le stock de matériels
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau matériel
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, référence, catégorie..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>

        <div className="bg-card border border-border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Référence</TableHead>
                <TableHead>Fournisseur</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Site</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMaterials.map((material) => (
                <TableRow key={material.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{material.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{material.category}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{material.internalRef}</TableCell>
                  <TableCell>{material.supplier}</TableCell>
                  <TableCell>{material.price.toLocaleString('fr-FR')} €</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={material.stock < material.threshold ? "text-warning font-semibold" : ""}>
                        {material.stock}
                      </span>
                      {material.stock < material.threshold && (
                        <Badge variant="outline" className="text-warning border-warning">
                          Seuil bas
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{material.site}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Voir détails
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
};

export default Materials;
