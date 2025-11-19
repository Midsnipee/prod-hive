import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Assignment } from '@/lib/mockData';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAssignments } from '@/hooks/useAssignments';
import { useSerials } from '@/hooks/useSerials';

const assignmentSchema = z.object({
  serialNumber: z.string().min(1, 'Le numéro de série est requis'),
  materialName: z.string().min(1, 'Le nom du matériel est requis'),
  assignedTo: z.string().min(1, 'L\'utilisateur est requis'),
  department: z.string().min(1, 'Le département est requis'),
  startDate: z.string(),
  expectedReturn: z.string().optional(),
  renewalDate: z.string().optional()
});

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

interface AssignmentFormProps {
  assignment?: Assignment;
  prefilledSerial?: string;
  prefilledMaterialName?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AssignmentForm({ assignment, prefilledSerial, prefilledMaterialName, onSuccess, onCancel }: AssignmentFormProps) {
  const [users, setUsers] = useState<any[]>([]);
  const { serials } = useSerials();
  const { createAssignment, updateAssignment } = useAssignments();

  useEffect(() => {
    supabase
      .from('profiles')
      .select('*')
      .then(({ data }) => setUsers(data || []));
  }, []);

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: assignment ? {
      serialNumber: assignment.serialNumber,
      materialName: assignment.materialName,
      assignedTo: assignment.assignedTo,
      department: assignment.department,
      startDate: assignment.startDate instanceof Date ? assignment.startDate.toISOString().split('T')[0] : assignment.startDate,
      expectedReturn: assignment.expectedReturn instanceof Date ? assignment.expectedReturn.toISOString().split('T')[0] : assignment.expectedReturn,
      renewalDate: assignment.renewalDate instanceof Date ? assignment.renewalDate.toISOString().split('T')[0] : assignment.renewalDate
    } : {
      serialNumber: prefilledSerial || '',
      materialName: prefilledMaterialName || '',
      assignedTo: '',
      department: '',
      startDate: new Date().toISOString().split('T')[0],
      expectedReturn: '',
      renewalDate: ''
    }
  });

  const onSubmit = async (values: AssignmentFormValues) => {
    const serial = serials.find(s => s.serial_number === values.serialNumber);
    
    if (!serial) {
      toast.error('Numéro de série introuvable');
      return;
    }

    const assignmentData = {
      serial_id: serial.id,
      serial_number: values.serialNumber,
      assigned_to: values.assignedTo,
      department: values.department,
      start_date: new Date(values.startDate).toISOString(),
      end_date: values.expectedReturn ? new Date(values.expectedReturn).toISOString() : null,
      renewal_date: values.renewalDate ? new Date(values.renewalDate).toISOString() : null,
      notes: null
    };

    if (assignment?.id) {
      updateAssignment({ id: assignment.id, ...assignmentData });
    } else {
      createAssignment(assignmentData);
    }
    
    onSuccess();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="serialNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Numéro de série</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un numéro de série" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {serials.map(serial => (
                    <SelectItem key={serial.id} value={serial.serial_number}>
                      {serial.serial_number} {serial.material?.name && `(${serial.material.name})`}
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
          name="materialName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du matériel</FormLabel>
              <FormControl>
                <Input placeholder="Dell Latitude 5420" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="assignedTo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Attribué à</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un utilisateur" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.displayName}>
                      {user.displayName} - {user.department}
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
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Département</FormLabel>
              <FormControl>
                <Input placeholder="IT" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de début</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expectedReturn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de retour prévue</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="renewalDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date de renouvellement prévue</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
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
            {assignment ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
