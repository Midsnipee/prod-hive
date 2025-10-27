import { useMemo, useState } from "react";
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
import { mockMaterials, Material, mockSerials, mockAssignments } from "@/lib/mockData";
import {
  Download,
  Filter,
  Layers,
  Link2,
  ListFilter,
  PackageSearch,
  Plus,
  QrCode,
  Search,
  Upload,
  Wand2
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const Materials = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [site, setSite] = useState("all");
  const [supplier, setSupplier] = useState("all");
  const [onlyAlerts, setOnlyAlerts] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const categories = useMemo(() => Array.from(new Set(mockMaterials.map(material => material.category))), []);
  const sites = useMemo(() => Array.from(new Set(mockMaterials.map(material => material.site))), []);
  const suppliers = useMemo(() => Array.from(new Set(mockMaterials.map(material => material.defaultSupplier))), []);

  const filteredMaterials = useMemo(() =>
    mockMaterials.filter(material => {
      const matchesSearch = `${material.name} ${material.internalRef} ${material.tags.join(" ")}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = category === "all" || material.category === category;
      const matchesSite = site === "all" || material.site === site;
      const matchesSupplier = supplier === "all" || material.defaultSupplier === supplier;
      const matchesAlerts = !onlyAlerts || material.stock <= material.lowStockThreshold;
      return matchesSearch && matchesCategory && matchesSite && matchesSupplier && matchesAlerts;
    }),
  [searchTerm, category, site, supplier, onlyAlerts]);

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
          <Button className="gap-2">
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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMaterials.map(material => {
              const isLow = material.stock <= material.lowStockThreshold;
              return (
                <TableRow key={material.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedMaterial(material)}>
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
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={(event) => { event.stopPropagation(); toast.success("Code QR généré"); }}>
                        <QrCode className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={(event) => { event.stopPropagation(); toast.success("Lien de fiche copié"); }}>
                        <Link2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <MaterialDetailSheet material={selectedMaterial} onOpenChange={(open) => !open && setSelectedMaterial(null)} />
    </div>
  );
};

const MaterialDetailSheet = ({ material, onOpenChange }: { material: Material | null; onOpenChange: (open: boolean) => void }) => {
  if (!material) {
    return <Sheet open={false} onOpenChange={onOpenChange} />;
  }

  const serials = mockSerials.filter(serial => serial.materialId === material.id);
  const assignments = mockAssignments.filter(assignment => assignment.materialName === material.name);
  const warrantyWarnings = serials.filter(serial => serial.warrantyStatus !== "ok");

  const pattern = material.internalRef.split("").map(char => char.charCodeAt(0).toString(2).padStart(8, "0")).join("");
  const qrMatrix = Array.from({ length: 12 }).map((_, row) =>
    Array.from({ length: 12 }).map((__, col) => pattern[(row * 12 + col) % pattern.length] === "1")
  );

  return (
    <Sheet open={Boolean(material)} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{material.name}</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-full pr-4">
          <div className="space-y-6 py-6">
            <section className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Référence interne</p>
                  <p className="font-mono text-sm font-semibold">{material.internalRef}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fournisseur par défaut</p>
                  <p className="font-semibold">{material.defaultSupplier}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stock disponible</p>
                  <p className="font-semibold">{material.stock} / seuil {material.lowStockThreshold}</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="flex flex-wrap gap-4">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Code-barres</p>
                  <div className="mt-2 flex overflow-hidden rounded border border-border bg-background">
                    {pattern.split("").map((bit, index) => (
                      <span key={index} className={cn("h-16 w-[2px]", bit === "1" ? "bg-foreground" : "bg-background")} />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Code QR</p>
                  <div className="mt-2 grid grid-cols-12 gap-[1px] rounded border border-border bg-background p-2">
                    {qrMatrix.map((row, rowIndex) => row.map((isFilled, colIndex) => (
                      <span key={`${rowIndex}-${colIndex}`} className={cn("h-3 w-3", isFilled ? "bg-foreground" : "bg-background")} />
                    )))}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="gap-2" onClick={() => toast.success("Codes téléchargés")}> <QrCode className="h-4 w-4" /> Télécharger</Button>
                <Button size="sm" variant="outline" className="gap-2" onClick={() => toast.success("Nouveau lot créé")}> <Wand2 className="h-4 w-4" /> Créer numéros de série</Button>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase text-muted-foreground">Numéros de série</h3>
              <div className="rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Numéro</TableHead>
                      <TableHead>Livraison</TableHead>
                      <TableHead>Garantie</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Attribué à</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serials.map(serial => (
                      <TableRow key={serial.id}>
                        <TableCell className="font-mono text-xs">{serial.serialNumber}</TableCell>
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
                        <TableCell>{serial.status}</TableCell>
                        <TableCell>{serial.assignedTo ?? "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase text-muted-foreground">Attributions</h3>
              {assignments.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune attribution enregistrée pour ce matériel.</p>
              ) : (
                <div className="space-y-3">
                  {assignments.map(assignment => (
                    <div key={assignment.id} className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{assignment.assignedTo}</span>
                        <span className="text-xs text-muted-foreground">{assignment.department}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Attribué le {assignment.startDate.toLocaleDateString("fr-FR")}</p>
                      {assignment.expectedReturn && (
                        <p className="text-xs text-muted-foreground">Retour prévu le {assignment.expectedReturn.toLocaleDateString("fr-FR")}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase text-muted-foreground">Alertes garanties</h3>
              {warrantyWarnings.length === 0 ? (
                <p className="text-sm text-muted-foreground">Toutes les garanties sont à jour.</p>
              ) : (
                <div className="space-y-2">
                  {warrantyWarnings.map(serial => (
                    <div key={serial.id} className="rounded border border-warning bg-warning/10 p-3 text-sm">
                      <p className="font-semibold">{serial.serialNumber}</p>
                      <p className="text-xs text-muted-foreground">Expiration le {serial.warrantyEnd.toLocaleDateString("fr-FR")}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default Materials;
