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
import { Plus, Search, Filter, FileText } from "lucide-react";
import { mockAssignments } from "@/lib/mockData";
import { useState } from "react";

const Assignments = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAssignments = mockAssignments.filter(assignment =>
    assignment.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Attributions</h1>
            <p className="text-muted-foreground mt-1">
              Gérer l'attribution de matériels aux utilisateurs
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle attribution
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par utilisateur, matériel, service..."
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
                <TableHead>Utilisateur</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Matériel</TableHead>
                <TableHead>Numéro de série</TableHead>
                <TableHead>Date d'attribution</TableHead>
                <TableHead>Retour prévu</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssignments.map((assignment) => (
                <TableRow key={assignment.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                        {assignment.assignedTo.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium">{assignment.assignedTo}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{assignment.department}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{assignment.materialName}</TableCell>
                  <TableCell className="font-mono text-sm">{assignment.serialNumber}</TableCell>
                  <TableCell>
                    {new Date(assignment.startDate).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    {assignment.expectedReturn 
                      ? new Date(assignment.expectedReturn).toLocaleDateString('fr-FR')
                      : <span className="text-muted-foreground">Non défini</span>
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        Reçu
                      </Button>
                      <Button variant="ghost" size="sm">
                        Retourner
                      </Button>
                    </div>
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

export default Assignments;
