import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Printer } from "lucide-react";
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
  status: z.enum(["Attribué", "Télétravail"], {
    required_error: "Veuillez sélectionner un statut",
  }),
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
  const [serials, setSerials] = useState<Array<{ id: string; serial_number: string; material_name: string; material_id: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [assignmentData, setAssignmentData] = useState<any>(null);
  const { toast } = useToast();

  const form = useForm<AssignFormValues>({
    resolver: zodResolver(assignFormSchema),
    defaultValues: {
      serialId: "",
      assignedTo: "",
      department: "",
      status: "Attribué",
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
        material_id: s.material_id,
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
    const { data: assignmentData, error: assignmentError } = await supabase
      .from("assignments")
      .insert({
        serial_id: values.serialId,
        serial_number: selectedSerial.serial_number,
        assigned_to: values.assignedTo,
        department: values.department,
        start_date: values.startDate.toISOString(),
        notes: values.notes || null,
      })
      .select()
      .single();

    if (assignmentError || !assignmentData) {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'attribution",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Update serial status
    const { error: serialError } = await supabase
      .from("serials")
      .update({ status: values.status })
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

    // If status is Télétravail, show print dialog and save document
    if (values.status === "Télétravail") {
      // Get full material details
      const { data: materialData } = await supabase
        .from("materials")
        .select("name, model, manufacturer")
        .eq("id", selectedSerial.material_id)
        .single();

      const documentData = {
        assignmentId: assignmentData.id,
        serialNumber: selectedSerial.serial_number,
        materialName: materialData?.name || selectedSerial.material_name,
        model: materialData?.model || "N/A",
        manufacturer: materialData?.manufacturer || "N/A",
        assignedTo: values.assignedTo,
        department: values.department,
        startDate: format(values.startDate, "dd/MM/yyyy"),
      };

      // Generate and save document HTML
      const documentHtml = generateDocumentHtml(documentData);
      
      const { error: docError } = await supabase
        .from("assignment_documents")
        .insert({
          assignment_id: assignmentData.id,
          document_html: documentHtml,
        });

      if (docError) {
        console.error("Error saving document:", docError);
        toast({
          title: "Avertissement",
          description: "Document généré mais non sauvegardé",
          variant: "destructive",
        });
      }

      setAssignmentData(documentData);
      setShowPrintDialog(true);
    }

    form.reset();
    setIsLoading(false);
    if (values.status !== "Télétravail") {
      onSuccess();
    }
  };

  const generateDocumentHtml = (data: any) => {
    const documentText = `Ce document certifie que le matériel ci-dessous a été confié en télétravail.
    
L'utilisateur s'engage à :
- Utiliser le matériel uniquement à des fins professionnelles
- Assurer la sécurité et la confidentialité des données
- Maintenir le matériel en bon état
- Restituer le matériel sur demande de l'entreprise

Tout dommage ou perte devra être signalé immédiatement.`;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Document d'Attribution Télétravail</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 {
              color: #1e40af;
              text-align: center;
              margin-bottom: 30px;
            }
            .info-section {
              margin: 30px 0;
              border: 1px solid #e5e7eb;
              padding: 20px;
              border-radius: 8px;
            }
            .info-row {
              display: flex;
              margin: 10px 0;
            }
            .info-label {
              font-weight: bold;
              min-width: 150px;
            }
            .info-value {
              flex: 1;
            }
            .text-section {
              margin: 30px 0;
              padding: 20px;
              background-color: #f9fafb;
              border-left: 4px solid #1e40af;
              white-space: pre-line;
              line-height: 1.6;
            }
            .signature-section {
              margin-top: 60px;
              display: flex;
              justify-content: space-between;
            }
            .signature-box {
              width: 45%;
            }
            .signature-line {
              border-top: 1px solid #000;
              margin-top: 60px;
              padding-top: 8px;
              text-align: center;
            }
            @media print {
              body {
                padding: 20px;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <h1>Document d'Attribution Télétravail</h1>
          
          <div class="info-section">
            <h2 style="margin-top: 0; color: #1e40af;">Informations du Matériel</h2>
            <div class="info-row">
              <span class="info-label">Matériel :</span>
              <span class="info-value">${data.materialName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Modèle :</span>
              <span class="info-value">${data.model}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Fabricant :</span>
              <span class="info-value">${data.manufacturer}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Numéro de série :</span>
              <span class="info-value">${data.serialNumber}</span>
            </div>
          </div>

          <div class="info-section">
            <h2 style="margin-top: 0; color: #1e40af;">Informations de l'Attribution</h2>
            <div class="info-row">
              <span class="info-label">Attribué à :</span>
              <span class="info-value">${data.assignedTo}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Département :</span>
              <span class="info-value">${data.department}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Date de début :</span>
              <span class="info-value">${data.startDate}</span>
            </div>
          </div>

          <div class="text-section">
            ${documentText}
          </div>

          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-line">
                Signature de l'employé
              </div>
            </div>
            <div class="signature-box">
              <div class="signature-line">
                Signature du responsable
              </div>
            </div>
          </div>

          <div class="no-print" style="margin-top: 40px; text-align: center;">
            <button onclick="window.print()" style="padding: 12px 24px; background-color: #1e40af; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">
              Imprimer
            </button>
            <button onclick="window.close()" style="padding: 12px 24px; background-color: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; margin-left: 10px;">
              Fermer
            </button>
          </div>
        </body>
      </html>
    `;
  };

  const handlePrint = () => {
    if (!assignmentData) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const documentHtml = generateDocumentHtml(assignmentData);
    printWindow.document.write(documentHtml);
    printWindow.document.close();
  };

  const handleSkipPrint = () => {
    setShowPrintDialog(false);
    setAssignmentData(null);
    onSuccess();
  };

  if (showPrintDialog) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Document prêt à imprimer
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            L'attribution a été créée avec succès. Voulez-vous imprimer le document de télétravail ?
          </p>
          <div className="flex gap-2">
            <Button onClick={handlePrint} className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              Imprimer le document
            </Button>
            <Button onClick={handleSkipPrint} variant="outline" className="flex-1">
              Passer
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Statut</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Attribué">Attribué</SelectItem>
                  <SelectItem value="Télétravail">Télétravail</SelectItem>
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
