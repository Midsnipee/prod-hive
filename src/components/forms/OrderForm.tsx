import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { db } from '@/lib/db';
import { toast } from 'sonner';
import { Order } from '@/lib/mockData';
import { useEffect, useState } from 'react';
import { Supplier } from '@/lib/db';

const orderSchema = z.object({
  reference: z.string().min(2, 'La référence est requise'),
  supplier: z.string().min(1, 'Le fournisseur est requis'),
  amount: z.number().min(0, 'Le montant doit être positif'),
  status: z.enum(['Demandé', 'Circuit interne', 'Commande fournisseur faite', 'Livré']),
  notes: z.string().optional()
});

type OrderFormValues = z.infer<typeof orderSchema>;

interface OrderFormProps {
  order?: Order;
  onSuccess: () => void;
  onCancel: () => void;
}

export function OrderForm({ order, onSuccess, onCancel }: OrderFormProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    db.suppliers.toArray().then(setSuppliers);
  }, []);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: order ? {
      reference: order.reference,
      supplier: order.supplier,
      amount: order.amount,
      status: order.status,
      notes: ''
    } : {
      reference: '',
      supplier: '',
      amount: 0,
      status: 'Demandé',
      notes: ''
    }
  });

  const onSubmit = async (values: OrderFormValues) => {
    try {
      const orderData: Order = {
        id: order?.id || crypto.randomUUID(),
        reference: values.reference,
        supplier: values.supplier,
        amount: values.amount,
        status: values.status,
        createdAt: order?.createdAt instanceof Date ? order.createdAt : new Date(order?.createdAt || Date.now()),
        currency: 'EUR',
        site: order?.site || '',
        requestedBy: order?.requestedBy || '',
        tags: order?.tags || [],
        lines: order?.lines || [],
        deliveries: order?.deliveries || [],
        history: order?.history || [],
        files: order?.files || []
      };

      if (order?.id) {
        await db.orders.update(order.id, {
          reference: orderData.reference,
          supplier: orderData.supplier,
          amount: orderData.amount,
          status: orderData.status
        });
        toast.success('Commande mise à jour');
      } else {
        await db.orders.add(orderData);
        toast.success('Commande créée');
      }
      onSuccess();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="reference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Référence de commande</FormLabel>
              <FormControl>
                <Input placeholder="CMD-2024-001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="supplier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fournisseur</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un fournisseur" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.name}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Montant total (€)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  onChange={e => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Statut</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Demandé">Demandé</SelectItem>
                  <SelectItem value="Circuit interne">Circuit interne</SelectItem>
                  <SelectItem value="Commande fournisseur faite">Commande fournisseur faite</SelectItem>
                  <SelectItem value="Livré">Livré</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Informations complémentaires..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit">
            {order ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
