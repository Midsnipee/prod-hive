import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Assignment = Tables<'assignments'>;
type AssignmentInsert = TablesInsert<'assignments'>;
type AssignmentUpdate = TablesUpdate<'assignments'>;

export interface AssignmentWithSerial extends Assignment {
  serial?: Tables<'serials'> & {
    material?: Tables<'materials'>;
  };
}

export const useAssignments = () => {
  const queryClient = useQueryClient();

  const { data: assignments = [], isLoading, error } = useQuery({
    queryKey: ['assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          serial:serials(
            *,
            material:materials(*)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AssignmentWithSerial[];
    }
  });

  const createAssignment = useMutation({
    mutationFn: async (assignment: AssignmentInsert) => {
      const { data, error } = await supabase
        .from('assignments')
        .insert(assignment)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['serials'] });
      toast.success('Attribution créée avec succès');
    },
    onError: (error) => {
      console.error('Error creating assignment:', error);
      toast.error('Erreur lors de la création de l\'attribution');
    }
  });

  const updateAssignment = useMutation({
    mutationFn: async ({ id, ...updates }: AssignmentUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('assignments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['serials'] });
      toast.success('Attribution mise à jour');
    },
    onError: (error) => {
      console.error('Error updating assignment:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  });

  const deleteAssignment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['serials'] });
      toast.success('Attribution supprimée');
    },
    onError: (error) => {
      console.error('Error deleting assignment:', error);
      toast.error('Erreur lors de la suppression');
    }
  });

  return {
    assignments,
    isLoading,
    error,
    createAssignment: createAssignment.mutate,
    updateAssignment: updateAssignment.mutate,
    deleteAssignment: deleteAssignment.mutate,
    isCreating: createAssignment.isPending,
    isUpdating: updateAssignment.isPending,
    isDeleting: deleteAssignment.isPending,
  };
};
