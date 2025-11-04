import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Material } from "@/lib/mockData";
import {
  Download,
  Layers,
  ListFilter,
  PackageSearch,
  Plus,
  Search,
  Upload,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MaterialForm } from "@/components/forms/MaterialForm";
import { db } from "@/lib/db";

const Materials = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [site, setSite] = useState("all");
  const [supplier, setSupplier] = useState("all");
  const [onlyAlerts, setOnlyAlerts] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [showNewMaterialDialog, setShowNewMaterialDialog] = useState(false);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    const materialsFromDb = await db.materials.toArray();
    setMaterials(materialsFromDb);
  };

  const categories = useMemo(() => Array.from(new Set(materials.map(material => material.category))), [materials]);
  const sites = useMemo(() => Array.from(new Set(materials.map(material => material.site))), [materials]);
  const suppliers = useMemo(() => Array.from(new Set(materials.map(material => material.defaultSupplier))), [materials]);

  const filteredMaterials = useMemo(() =>
    materials.filter(material => {
      const matchesSearch = `${material.name} ${material.internalRef} ${material.tags.join(" ")}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = category === "all" || material.category === category;
      const matchesSite = site === "all" || material.site === site;
      const matchesSupplier = supplier === "all" || material.defaultSupplier === supplier;
      const matchesAlerts = !onlyAlerts || material.stock <= material.lowStockThreshold;
      return matchesSearch && matchesCategory && matchesSite && matchesSupplier && matchesAlerts;
    }),
  [materials, searchTerm, category, site, supplier, onlyAlerts]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Layers className="h-4 w-4" />
            Catalogue matériel
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Matériels & stocks</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Suivez vos équipements, seuils d'alerte et stocks par site. Importez en masse ou générez des codes pour l'étiquetage.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Importer CSV/Excel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Importer des matériels</DialogTitle>
                <DialogDescription>
                  Collez vos données ou importez un fichier respectant le modèle fourni. Les champs obligatoires : nom, catégorie, référence, fournisseur, prix.
                </DialogDescription>
              </DialogHeader>
              <Textarea placeholder="Coller le contenu CSV ici..." className="h-40" />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <Button variant="link" className="px-0" onClick={() => toast.success("Modèle téléchargé")}>Télécharger le modèle</Button>
                <Button onClick={() => toast.success("Import simulé avec succès")}>Importer</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="gap-2" onClick={() => toast.success("Export CSV généré")}> <Download className="h-4 w-4" />Exporter</Button>
          <Button className="gap-2" onClick={() => setShowNewMaterialDialog(true)}>
            <Plus className="h-4 w-4" />
            Nouveau matériel
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher nom, référence, tag..."
            className="pl-9"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            {categories.map(item => (
              <SelectItem key={item} value={item}>{item}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={site} onValueChange={setSite}>
          <SelectTrigger>
            <SelectValue placeholder="Site" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous sites</SelectItem>
            {sites.map(item => (
              <SelectItem key={item} value={item}>{item}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={supplier} onValueChange={setSupplier}>
          <SelectTrigger>
            <SelectValue placeholder="Fournisseur" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous fournisseurs</SelectItem>
            {suppliers.map(item => (
              <SelectItem key={item} value={item}>{item}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Toggle
          pressed={onlyAlerts}
          onPressedChange={(value) => setOnlyAlerts(value)}
          variant="outline"
          className="gap-2"
        >
          <ListFilter className="h-4 w-4" />
          Seuils bas & alertes
        </Toggle>
        <Badge variant="outline" className="gap-1">
          <PackageSearch className="h-3 w-3" /> {filteredMaterials.length} matériels affichés
        </Badge>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Matériel</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Référence</TableHead>
              <TableHead>Fournisseur</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>En alerte</TableHead>
              <TableHead>Site</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMaterials.map(material => {
              const isLow = material.stock <= material.lowStockThreshold;
              return (
                <TableRow key={material.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/materials/${material.id}`)}>
                  <TableCell>
                    <div className="font-semibold">{material.name}</div>
                    <p className="text-xs text-muted-foreground">{material.tags.join(", ")}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{material.category}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{material.internalRef}</TableCell>
                  <TableCell>{material.defaultSupplier}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span className={cn("font-semibold", isLow && "text-warning")}>{material.stock} sérialisés</span>
                      {material.nonSerializedStock > 0 && (
                        <span className="text-xs text-muted-foreground">+ {material.nonSerializedStock} non sérialisés</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {isLow ? (
                      <Badge variant="outline" className="border-warning text-warning">Seuil {material.lowStockThreshold}</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">OK</span>
                    )}
                  </TableCell>
                  <TableCell>{material.site}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showNewMaterialDialog} onOpenChange={setShowNewMaterialDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouveau matériel</DialogTitle>
            <DialogDescription>
              Créez un nouveau matériel dans votre inventaire.
            </DialogDescription>
          </DialogHeader>
          <MaterialForm 
            onSuccess={() => {
              setShowNewMaterialDialog(false);
              loadMaterials();
            }} 
            onCancel={() => setShowNewMaterialDialog(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Materials;
