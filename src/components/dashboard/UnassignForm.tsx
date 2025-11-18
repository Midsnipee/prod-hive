import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const unassignFormSchema = z.object({
  assignmentId: z.string().min(1, "Veuillez sélectionner une attribution"),
  notes: z.string().optional(),
});

type UnassignFormValues = z.infer<typeof unassignFormSchema>;

interface UnassignFormProps {
  onSuccess: () => void;
}

export function UnassignForm({ onSuccess }: UnassignFormProps) {
  const [assignments, setAssignments] = useState<Array<{
    id: string;
    serial_id: string;
    serial_number: string;
    material_name: string;
    assigned_to: string;
    start_date: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<UnassignFormValues>({
    resolver: zodResolver(unassignFormSchema),
    defaultValues: {
      assignmentId: "",
      notes: "",
    },
  });

  useEffect(() => {
    loadActiveAssignments();
  }, []);

  const loadActiveAssignments = async () => {
    const { data, error } = await supabase
      .from("assignments")
      .select(`
        id,
        serial_id,
        serial_number,
        assigned_to,
        start_date,
        serials (
          materials (
            name
          )
        )
      `)
      .is("end_date", null);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les attributions actives",
        variant: "destructive",
      });
      return;
    }

    setAssignments(
      data.map((a: any) => ({
        id: a.id,
        serial_id: a.serial_id,
        serial_number: a.serial_number,
        material_name: a.serials?.materials?.name || "Inconnu",
        assigned_to: a.assigned_to,
        start_date: a.start_date,
      }))
    );
  };

  const onSubmit = async (values: UnassignFormValues) => {
    setIsLoading(true);

    const selectedAssignment = assignments.find(a => a.id === values.assignmentId);
    if (!selectedAssignment) {
      toast({
        title: "Erreur",
        description: "Attribution introuvable",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Update assignment with end date
    const { error: assignmentError } = await supabase
      .from("assignments")
      .update({
        end_date: new Date().toISOString(),
        notes: values.notes || null,
      })
      .eq("id", values.assignmentId);

    if (assignmentError) {
      toast({
        title: "Erreur",
        description: "Impossible de terminer l'attribution",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Update serial status to "En stock"
    const { error: serialError } = await supabase
      .from("serials")
      .update({ status: "En stock" })
      .eq("id", selectedAssignment.serial_id);

    if (serialError) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut du matériel",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: "Succès",
      description: "Le matériel a été désattribué et remis en stock",
    });

    form.reset();
    setIsLoading(false);
    onSuccess();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="assignmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Attribution active</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une attribution" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {assignments.map((assignment) => (
                    <SelectItem key={assignment.id} value={assignment.id}>
                      {assignment.serial_number} - {assignment.material_name} ({assignment.assigned_to})
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
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optionnel)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Notes concernant la désattribution..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "En cours..." : "Désattribuer"}
        </Button>
      </form>
    </Form>
  );
}
