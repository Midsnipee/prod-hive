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

const discardFormSchema = z.object({
  serialId: z.string().min(1, "Veuillez sélectionner un numéro de série"),
  notes: z.string().optional(),
});

type DiscardFormValues = z.infer<typeof discardFormSchema>;

interface DiscardFormProps {
  onSuccess: () => void;
}

export function DiscardForm({ onSuccess }: DiscardFormProps) {
  const [serials, setSerials] = useState<Array<{ id: string; serial_number: string; material_name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<DiscardFormValues>({
    resolver: zodResolver(discardFormSchema),
    defaultValues: {
      serialId: "",
      notes: "",
    },
  });

  useEffect(() => {
    loadSerials();
  }, []);

  const loadSerials = async () => {
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
      .in("status", ["En stock", "Attribué", "En réparation"]);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les numéros de série",
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

  const onSubmit = async (values: DiscardFormValues) => {
    setIsLoading(true);

    const { error } = await supabase
      .from("serials")
      .update({
        status: "Retiré",
        notes: values.notes || null,
      })
      .eq("id", values.serialId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre au rebut le matériel",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: "Succès",
      description: "Le matériel a été mis au rebut",
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
                    <SelectValue placeholder="Sélectionner un numéro de série" />
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
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Raison (optionnel)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Raison de la mise au rebut..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "En cours..." : "Mettre au rebut"}
        </Button>
      </form>
    </Form>
  );
}
