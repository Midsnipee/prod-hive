import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Serial = Tables<'serials'>;
type SerialInsert = TablesInsert<'serials'>;
type SerialUpdate = TablesUpdate<'serials'>;

export interface SerialWithMaterial extends Serial {
  material?: Tables<'materials'>;
}

export const useSerials = () => {
  const queryClient = useQueryClient();

  const { data: serials = [], isLoading, error } = useQuery({
    queryKey: ['serials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('serials')
        .select(`
          *,
          material:materials(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SerialWithMaterial[];
    }
  });

  const createSerial = useMutation({
    mutationFn: async (serial: SerialInsert) => {
      const { data, error } = await supabase
        .from('serials')
        .insert(serial)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serials'] });
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Numéro de série ajouté');
    },
    onError: (error) => {
      console.error('Error creating serial:', error);
      toast.error('Erreur lors de l\'ajout du numéro de série');
    }
  });

  const updateSerial = useMutation({
    mutationFn: async ({ id, ...updates }: SerialUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('serials')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serials'] });
      toast.success('Numéro de série mis à jour');
    },
    onError: (error) => {
      console.error('Error updating serial:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  });

  const deleteSerial = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('serials')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serials'] });
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Numéro de série supprimé');
    },
    onError: (error) => {
      console.error('Error deleting serial:', error);
      toast.error('Erreur lors de la suppression');
    }
  });

  return {
    serials,
    isLoading,
    error,
    createSerial: createSerial.mutate,
    updateSerial: updateSerial.mutate,
    deleteSerial: deleteSerial.mutate,
    isCreating: createSerial.isPending,
    isUpdating: updateSerial.isPending,
    isDeleting: deleteSerial.isPending,
  };
};
