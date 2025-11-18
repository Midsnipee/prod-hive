import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const assignFormSchema = z.object({
  serialId: z.string().min(1, "Veuillez sélectionner un numéro de série"),
  assignedTo: z.string().trim().min(1, "Le nom est requis").max(100, "Maximum 100 caractères"),
  department: z.string().min(1, "Veuillez sélectionner un département"),
  startDate: z.date({
    required_error: "La date de début est requise",
  }),
  notes: z.string().max(500, "Maximum 500 caractères").optional(),
});

type AssignFormValues = z.infer<typeof assignFormSchema>;

interface AssignFormProps {
  onSuccess: () => void;
}

export function AssignForm({ onSuccess }: AssignFormProps) {
  const [serials, setSerials] = useState<Array<{ id: string; serial_number: string; material_name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<AssignFormValues>({
    resolver: zodResolver(assignFormSchema),
    defaultValues: {
      serialId: "",
      assignedTo: "",
      department: "",
      startDate: new Date(),
      notes: "",
    },
  });

  useEffect(() => {
    loadAvailableSerials();
  }, []);

  const loadAvailableSerials = async () => {
    const { data, error } = await supabase
      .from("serials")
      .select(`
        id,
        serial_number,
        material_id,
        materials (
          name
        )
      `)
      .eq("status", "En stock");

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les matériels disponibles",
        variant: "destructive",
      });
      return;
    }

    setSerials(
      data.map((s: any) => ({
        id: s.id,
        serial_number: s.serial_number,
        material_name: s.materials?.name || "Inconnu",
      }))
    );
  };

  const onSubmit = async (values: AssignFormValues) => {
    setIsLoading(true);

    const selectedSerial = serials.find(s => s.id === values.serialId);
    if (!selectedSerial) {
      toast({
        title: "Erreur",
        description: "Matériel introuvable",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Create assignment
    const { error: assignmentError } = await supabase
      .from("assignments")
      .insert({
        serial_id: values.serialId,
        serial_number: selectedSerial.serial_number,
        assigned_to: values.assignedTo,
        department: values.department,
        start_date: values.startDate.toISOString(),
        notes: values.notes || null,
      });

    if (assignmentError) {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'attribution",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Update serial status to "Attribué"
    const { error: serialError } = await supabase
      .from("serials")
      .update({ status: "Attribué" })
      .eq("id", values.serialId);

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
      description: "Le matériel a été attribué avec succès",
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
          name="serialId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Numéro de série</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un matériel" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {serials.map((serial) => (
                    <SelectItem key={serial.id} value={serial.id}>
                      {serial.serial_number} - {serial.material_name}
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
          name="assignedTo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Attribué à</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nom de l'utilisateur"
                  {...field}
                />
              </FormControl>
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
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un département" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="RH">RH</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="Production">Production</SelectItem>
                  <SelectItem value="Logistique">Logistique</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date de début</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Sélectionner une date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("2000-01-01")
                    }
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
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
                  placeholder="Notes concernant l'attribution..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "En cours..." : "Attribuer"}
        </Button>
      </form>
    </Form>
  );
}
