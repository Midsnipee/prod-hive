import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { OrderLine } from "@/lib/mockData";

interface DeliveryProgressTableProps {
  orderId: string;
  orderLines: OrderLine[];
  currency: string;
}

interface OrderLineProgress extends OrderLine {
  deliveredQuantity: number;
}

export const DeliveryProgressTable = ({ orderId, orderLines, currency }: DeliveryProgressTableProps) => {
  const [linesWithProgress, setLinesWithProgress] = useState<OrderLineProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeliveryProgress = async () => {
      setLoading(true);
      
      // Fetch order lines from Supabase with delivered quantities
      const { data: supabaseOrderLines, error } = await supabase
        .from('order_lines')
        .select('material_name, delivered_quantity, quantity')
        .eq('order_id', orderId);

      if (error) {
        console.error('Error fetching delivery progress:', error);
        setLinesWithProgress(orderLines.map(line => ({ ...line, deliveredQuantity: 0 })));
        setLoading(false);
        return;
      }

      // Merge local order lines with Supabase data
      const merged = orderLines.map(line => {
        const supabaseLine = supabaseOrderLines?.find(
          sl => sl.material_name === line.description
        );
        return {
          ...line,
          deliveredQuantity: supabaseLine?.delivered_quantity || 0,
        };
      });

      setLinesWithProgress(merged);
      setLoading(false);
    };

    fetchDeliveryProgress();
  }, [orderId, orderLines]);

  if (loading) {
    return (
      <div className="rounded-lg border border-border p-4 text-center text-sm text-muted-foreground">
        Chargement des informations de livraison...
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Article</TableHead>
            <TableHead>Quantité</TableHead>
            <TableHead>Livré</TableHead>
            <TableHead>PU</TableHead>
            <TableHead>TVA</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {linesWithProgress.map(line => {
            const isFullyDelivered = line.deliveredQuantity >= line.quantity;
            const isPartiallyDelivered = line.deliveredQuantity > 0 && !isFullyDelivered;
            
            return (
              <TableRow key={line.id}>
                <TableCell>{line.description}</TableCell>
                <TableCell>{line.quantity}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{line.deliveredQuantity}</span>
                    {isFullyDelivered ? (
                      <Badge variant="default" className="text-xs">Complet</Badge>
                    ) : isPartiallyDelivered ? (
                      <Badge variant="secondary" className="text-xs">Partiel</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">En attente</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(line.unitPrice)}
                </TableCell>
                <TableCell>{line.taxRate}%</TableCell>
                <TableCell className="text-right font-medium">
                  {new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(line.unitPrice * line.quantity)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
