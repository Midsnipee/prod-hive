import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { db } from '@/lib/db';
import { toast } from 'sonner';
import { Assignment } from '@/lib/mockData';
import { useEffect, useState } from 'react';
import { User } from '@/lib/db';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const assignmentSchema = z.object({
  serialNumber: z.string().min(1, 'Le numéro de série est requis'),
  materialName: z.string().min(1, 'Le nom du matériel est requis'),
  assignedTo: z.string().min(1, 'L\'utilisateur est requis'),
  department: z.string().min(1, 'Le département est requis'),
  startDate: z.string(),
  expectedReturn: z.string().optional()
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
  const [users, setUsers] = useState<User[]>([]);
  const [serials, setSerials] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      db.users.toArray(),
      db.serials.toArray()
    ]).then(([usersData, serialsData]) => {
      setUsers(usersData);
      setSerials(serialsData.map(s => s.serialNumber));
    });
  }, []);

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: assignment || {
      serialNumber: prefilledSerial || '',
      materialName: prefilledMaterialName || '',
      assignedTo: '',
      department: '',
      startDate: new Date().toISOString().split('T')[0],
      expectedReturn: ''
    }
  });

  const onSubmit = async (values: AssignmentFormValues) => {
    try {
      const assignmentData: Assignment = {
        id: assignment?.id || crypto.randomUUID(),
        serialNumber: values.serialNumber,
        materialName: values.materialName,
        assignedTo: values.assignedTo,
        department: values.department,
        startDate: values.startDate,
        expectedReturn: values.expectedReturn
      };

      if (assignment?.id) {
        await db.assignments.update(assignment.id, assignmentData);
        toast.success('Attribution mise à jour');
      } else {
        await db.assignments.add(assignmentData);
        toast.success('Attribution créée');
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
                    <SelectItem key={serial} value={serial}>
                      {serial}
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
