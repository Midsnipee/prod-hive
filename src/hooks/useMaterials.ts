import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Material = Tables<'materials'>;
type MaterialInsert = TablesInsert<'materials'>;
type MaterialUpdate = TablesUpdate<'materials'>;

export const useMaterials = () => {
  const queryClient = useQueryClient();

  const { data: materials = [], isLoading, error } = useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Material[];
    }
  });

  const createMaterial = useMutation({
    mutationFn: async (material: MaterialInsert) => {
      const { data, error } = await supabase
        .from('materials')
        .insert(material)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Matériel créé avec succès');
    },
    onError: (error) => {
      console.error('Error creating material:', error);
      toast.error('Erreur lors de la création du matériel');
    }
  });

  const updateMaterial = useMutation({
    mutationFn: async ({ id, ...updates }: MaterialUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('materials')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Matériel mis à jour');
    },
    onError: (error) => {
      console.error('Error updating material:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  });

  const deleteMaterial = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Matériel supprimé');
    },
    onError: (error) => {
      console.error('Error deleting material:', error);
      toast.error('Erreur lors de la suppression');
    }
  });

  return {
    materials,
    isLoading,
    error,
    createMaterial: createMaterial.mutate,
    updateMaterial: updateMaterial.mutate,
    deleteMaterial: deleteMaterial.mutate,
    isCreating: createMaterial.isPending,
    isUpdating: updateMaterial.isPending,
    isDeleting: deleteMaterial.isPending,
  };
};
