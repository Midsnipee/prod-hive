import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Order = Tables<'orders'>;
type OrderInsert = TablesInsert<'orders'>;
type OrderUpdate = TablesUpdate<'orders'>;
type OrderLine = Tables<'order_lines'>;

export interface OrderWithLines extends Order {
  order_lines?: OrderLine[];
}

export const useOrders = () => {
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_lines(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as OrderWithLines[];
    }
  });

  const createOrder = useMutation({
    mutationFn: async (order: OrderInsert) => {
      const { data, error } = await supabase
        .from('orders')
        .insert(order)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Commande créée avec succès');
    },
    onError: (error) => {
      console.error('Error creating order:', error);
      toast.error('Erreur lors de la création de la commande');
    }
  });

  const updateOrder = useMutation({
    mutationFn: async ({ id, ...updates }: OrderUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Commande mise à jour');
    },
    onError: (error) => {
      console.error('Error updating order:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  });

  const deleteOrder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Commande supprimée');
    },
    onError: (error) => {
      console.error('Error deleting order:', error);
      toast.error('Erreur lors de la suppression');
    }
  });

  return {
    orders,
    isLoading,
    error,
    createOrder: createOrder.mutate,
    updateOrder: updateOrder.mutate,
    deleteOrder: deleteOrder.mutate,
    isCreating: createOrder.isPending,
    isUpdating: updateOrder.isPending,
    isDeleting: deleteOrder.isPending,
  };
};
