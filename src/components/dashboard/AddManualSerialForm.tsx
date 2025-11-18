import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const addManualSerialFormSchema = z.object({
  materialId: z.string().min(1, "Veuillez sélectionner un matériel"),
  serialNumber: z.string().trim().min(1, "Le numéro de série est requis").max(100, "Maximum 100 caractères"),
  purchaseDate: z.date().optional(),
  warrantyEnd: z.date().optional(),
  renewalDate: z.date().optional(),
  location: z.string().max(200, "Maximum 200 caractères").optional(),
  notes: z.string().max(500, "Maximum 500 caractères").optional(),
});

type AddManualSerialFormValues = z.infer<typeof addManualSerialFormSchema>;

interface Material {
  id: string;
  name: string;
  category: string;
}

interface AddManualSerialFormProps {
  onSuccess: () => void;
}

export function AddManualSerialForm({ onSuccess }: AddManualSerialFormProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AddManualSerialFormValues>({
    resolver: zodResolver(addManualSerialFormSchema),
    defaultValues: {
      materialId: "",
      serialNumber: "",
      location: "",
      notes: "",
    },
  });

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    const { data, error } = await supabase
      .from("materials")
      .select("id, name, category")
      .order("name");

    if (error) {
      console.error("Error loading materials:", error);
      toast.error("Erreur lors du chargement des matériels");
      return;
    }

    setMaterials(data || []);
  };

  const onSubmit = async (values: AddManualSerialFormValues) => {
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Utilisateur non connecté");
        return;
      }

      // Check if serial number already exists
      const { data: existingSerial } = await supabase
        .from("serials")
        .select("id")
        .eq("serial_number", values.serialNumber)
        .maybeSingle();

      if (existingSerial) {
        toast.error("Ce numéro de série existe déjà");
        setIsLoading(false);
        return;
      }

      // Create serial
      const { error: serialError } = await supabase
        .from("serials")
        .insert({
          material_id: values.materialId,
          serial_number: values.serialNumber,
          status: "En stock",
          purchase_date: values.purchaseDate?.toISOString(),
          warranty_end: values.warrantyEnd?.toISOString(),
          renewal_date: values.renewalDate?.toISOString(),
          location: values.location || null,
          notes: values.notes || null,
        });

      if (serialError) {
        console.error("Error creating serial:", serialError);
        toast.error("Erreur lors de l'ajout du matériel");
        setIsLoading(false);
        return;
      }

      // Update material stock
      const { data: material } = await supabase
        .from("materials")
        .select("stock")
        .eq("id", values.materialId)
        .single();

      if (material) {
        await supabase
          .from("materials")
          .update({ stock: material.stock + 1 })
          .eq("id", values.materialId);
      }

      toast.success("Matériel ajouté avec succès");
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="materialId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Matériel *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un matériel" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {materials.map((material) => (
                    <SelectItem key={material.id} value={material.id}>
                      {material.name} ({material.category})
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
          name="serialNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Numéro de série *</FormLabel>
              <FormControl>
                <Input placeholder="Entrer le numéro de série" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="purchaseDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date d'achat</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: fr })
                        ) : (
                          <span>Sélectionner</span>
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
            name="warrantyEnd"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fin de garantie</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: fr })
                        ) : (
                          <span>Sélectionner</span>
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
                      disabled={(date) => date < new Date()}
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
            name="renewalDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Renouvellement prévu</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: fr })
                        ) : (
                          <span>Sélectionner</span>
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
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Emplacement</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Entrepôt A - Rayon 3" {...field} />
              </FormControl>
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
                <Textarea 
                  placeholder="Informations complémentaires..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Ajout en cours..." : "Ajouter au stock"}
        </Button>
      </form>
    </Form>
  );
}
