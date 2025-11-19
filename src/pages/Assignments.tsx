import { useMemo, useState, useEffect } from "react";
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
import { mockAssignments } from "@/lib/mockData";
import { CalendarIcon, FileText, Mail, Plus, Search, Send, UserCog } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ImportUsersCSV } from "@/components/settings/ImportUsersCSV";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const Assignments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "ongoing" | "overdue">("all");
  const [department, setDepartment] = useState("all");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

  const departments = useMemo(() => Array.from(new Set(mockAssignments.map(assignment => assignment.department))), []);

  const filteredAssignments = useMemo(() => mockAssignments.filter(assignment => {
    const matchesSearch = `${assignment.assignedTo} ${assignment.materialName} ${assignment.serialNumber}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = department === "all" || assignment.department === department;
    const now = new Date();
    const overdue = assignment.expectedReturn && assignment.expectedReturn < now && !assignment.endDate;
    const matchesStatus = statusFilter === "all" || (statusFilter === "ongoing" && !overdue) || (statusFilter === "overdue" && overdue);
    return matchesSearch && matchesDepartment && matchesStatus;
  }), [searchTerm, department, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserCog className="h-4 w-4" />
            Gestion des utilisateurs
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Utilisateurs</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Gérez les utilisateurs, leurs attributions et générez des reçus PDF.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ImportUsersCSV />
          <Button variant="outline" className="gap-2" onClick={() => toast.success("Reçu généré (simulation)")}>
            <FileText className="h-4 w-4" />
            Générer un reçu
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle attribution
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher utilisateur, matériel, numéro..."
            className="pl-9"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <ToggleGroup type="single" value={statusFilter} onValueChange={(value) => setStatusFilter((value || "all") as "all" | "ongoing" | "overdue")} className="flex rounded-lg border border-border">
            <ToggleGroupItem value="all" className="flex-1">Toutes</ToggleGroupItem>
            <ToggleGroupItem value="ongoing" className="flex-1">Actives</ToggleGroupItem>
            <ToggleGroupItem value="overdue" className="flex-1">En retard</ToggleGroupItem>
          </ToggleGroup>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous services</SelectItem>
              {departments.map(item => (
                <SelectItem key={item} value={item}>{item}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Matériel</TableHead>
              <TableHead>Numéro</TableHead>
              <TableHead>Début</TableHead>
              <TableHead>Retour</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssignments.map(assignment => {
              const overdue = assignment.expectedReturn && assignment.expectedReturn < new Date();
              return (
                <TableRow key={assignment.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedAssignmentId(assignment.id)}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                        {assignment.assignedTo.split(" ").map(name => name[0]).join("")}
                      </div>
                      <div>
                        <p className="font-semibold">{assignment.assignedTo}</p>
                        <p className="text-xs text-muted-foreground">{assignment.site}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{assignment.department}</Badge>
                  </TableCell>
                  <TableCell>{assignment.materialName}</TableCell>
                  <TableCell className="font-mono text-xs">{assignment.serialNumber}</TableCell>
                  <TableCell>{assignment.startDate.toLocaleDateString("fr-FR")}</TableCell>
                  <TableCell>
                    {assignment.expectedReturn ? (
                      <span className={cn(overdue && !assignment.endDate && "text-warning font-semibold")}> {assignment.expectedReturn.toLocaleDateString("fr-FR")} </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Non défini</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={(event) => { event.stopPropagation(); toast.success("Reçu généré"); }}>
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={(event) => { event.stopPropagation(); toast.success("Rappel envoyé"); }}>
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AssignmentSheet assignmentId={selectedAssignmentId} onOpenChange={(open) => !open && setSelectedAssignmentId(null)} />
    </div>
  );
};

const AssignmentSheet = ({ assignmentId, onOpenChange }: { assignmentId: string | null; onOpenChange: (open: boolean) => void }) => {
  const assignment = assignmentId ? mockAssignments.find(item => item.id === assignmentId) : undefined;
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    if (assignment) {
      loadDocuments(assignment.assignedTo);
    }
  }, [assignment]);

  const loadDocuments = async (assignedTo: string) => {
    const { data, error } = await supabase
      .from('assignment_documents')
      .select(`
        *,
        assignments!inner(
          assigned_to,
          start_date,
          serial_number
        )
      `)
      .eq('assignments.assigned_to', assignedTo);

    if (!error && data) {
      setDocuments(data);
    }
  };

  if (!assignment) {
    return <Sheet open={false} onOpenChange={onOpenChange} />;
  }

  const overdue = assignment.expectedReturn && assignment.expectedReturn < new Date() && !assignment.endDate;

  return (
    <Sheet open={Boolean(assignment)} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{assignment.assignedTo}</SheetTitle>
          <SheetDescription>{assignment.department} — {assignment.materialName}</SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-full pr-4">
          <div className="space-y-6 py-6">
            <section className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Matériel</p>
                  <p className="font-semibold">{assignment.materialName}</p>
                  <p className="text-xs text-muted-foreground">Numéro {assignment.serialNumber}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Dates</p>
                  <p className="text-sm">Attribué le {assignment.startDate.toLocaleDateString("fr-FR")}</p>
                  <p className={cn("text-sm", overdue && "text-warning font-semibold") }>
                    {assignment.expectedReturn ? `Retour prévu ${assignment.expectedReturn.toLocaleDateString("fr-FR")}` : "Retour non planifié"}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => toast.success("Rappel envoyé")}>Envoyer un rappel</Button>
                <Button size="sm" variant="outline" onClick={() => toast.success("Retour enregistré")}>Enregistrer un retour</Button>
                <Button size="sm" variant="outline" onClick={() => toast.success("Reçu téléchargé")}>Télécharger le reçu</Button>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase text-muted-foreground">Documents</h3>
              <div className="flex flex-col gap-2">
                {documents.length > 0 ? (
                  documents.map((doc: any) => (
                    <Button
                      key={doc.id}
                      variant="outline"
                      size="sm"
                      className="gap-2 justify-start"
                      onClick={() => {
                        const printWindow = window.open("", "_blank");
                        if (printWindow) {
                          printWindow.document.write(doc.document_html);
                          printWindow.document.close();
                        }
                      }}
                    >
                      <FileText className="h-4 w-4" />
                      Document télétravail - {format(new Date(doc.assignments.start_date), "dd/MM/yyyy")}
                    </Button>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Aucun document disponible</p>
                )}
                <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.success("Reçu partagé")}>
                  <Send className="h-4 w-4" /> Partager
                </Button>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase text-muted-foreground">Historique</h3>
              <div className="relative border-l border-dashed border-border pl-4">
                <div className="relative pb-4">
                  <span className="absolute -left-2 flex h-4 w-4 items-center justify-center rounded-full border border-primary bg-background">
                    <CalendarIcon className="h-3 w-3 text-primary" />
                  </span>
                  <p className="text-sm font-semibold">Affectation</p>
                  <p className="text-xs text-muted-foreground">Créée le {assignment.startDate.toLocaleDateString("fr-FR")}</p>
                </div>
                {assignment.expectedReturn && (
                  <div className="relative pb-4">
                    <span className="absolute -left-2 flex h-4 w-4 items-center justify-center rounded-full border border-primary bg-background">
                      <CalendarIcon className="h-3 w-3 text-primary" />
                    </span>
                    <p className="text-sm font-semibold">Retour programmé</p>
                    <p className="text-xs text-muted-foreground">Prévu le {assignment.expectedReturn.toLocaleDateString("fr-FR")}</p>
                  </div>
                )}
                {assignment.endDate && (
                  <div className="relative pb-4">
                    <span className="absolute -left-2 flex h-4 w-4 items-center justify-center rounded-full border border-primary bg-background">
                      <CalendarIcon className="h-3 w-3 text-primary" />
                    </span>
                    <p className="text-sm font-semibold">Retour confirmé</p>
                    <p className="text-xs text-muted-foreground">Reçu le {assignment.endDate.toLocaleDateString("fr-FR")}</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default Assignments;
