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
import { Plus, Search, Filter } from "lucide-react";
import { mockOrders } from "@/lib/mockData";
import { useState } from "react";

const statusColors = {
  "Demandé": "bg-muted text-muted-foreground",
  "Circuit interne": "bg-warning/10 text-warning border-warning",
  "Commande fournisseur faite": "bg-primary/10 text-primary border-primary",
  "Livré": "bg-success/10 text-success border-success"
};

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = mockOrders.filter(order =>
    order.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Commandes</h1>
            <p className="text-muted-foreground mt-1">
              Gérer les devis, commandes et livraisons
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau devis
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par référence, fournisseur..."
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
                <TableHead>Référence</TableHead>
                <TableHead>Fournisseur</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead>Livraison prévue</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium font-mono">{order.reference}</TableCell>
                  <TableCell>{order.supplier}</TableCell>
                  <TableCell className="font-semibold">
                    {order.amount.toLocaleString('fr-FR')} €
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[order.status]}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    {order.expectedDelivery 
                      ? new Date(order.expectedDelivery).toLocaleDateString('fr-FR')
                      : "-"
                    }
                  </TableCell>
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

export default Orders;
