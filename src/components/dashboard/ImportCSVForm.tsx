import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Download, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ImportCSVFormProps {
  onSuccess: () => void;
}

interface CSVRow {
  materialName: string;
  category: string;
  serialNumber: string;
  purchaseDate?: string;
  warrantyEnd?: string;
  renewalDate?: string;
  location?: string;
  notes?: string;
}

interface ImportResult {
  success: number;
  errors: string[];
}

export function ImportCSVForm({ onSuccess }: ImportCSVFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const headers = [
      "materialName",
      "category",
      "serialNumber",
      "purchaseDate",
      "warrantyEnd",
      "renewalDate",
      "location",
      "notes"
    ];
    
    const exampleRows = [
      [
        "MacBook Pro 14",
        "Ordinateur",
        "SN123456789",
        "2025-01-15",
        "2028-01-15",
        "2027-12-01",
        "Bureau Paris",
        "Modèle M3 Pro"
      ],
      [
        "iPhone 15 Pro",
        "Téléphone",
        "IMEI987654321",
        "2025-02-01",
        "2026-02-01",
        "",
        "Stock",
        "128 GB"
      ]
    ];

    const csv = [
      headers.join(","),
      ...exampleRows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "modele_import_materiels.csv";
    link.click();
    
    toast.success("Modèle CSV téléchargé");
  };

  const parseCSV = (content: string): CSVRow[] => {
    const lines = content.split("\n").filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
    const rows: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
      const cleanValues = values.map(v => v.trim().replace(/^"|"$/g, ""));

      if (cleanValues.length < 3) continue; // Skip incomplete rows

      const row: CSVRow = {
        materialName: cleanValues[0] || "",
        category: cleanValues[1] || "Autre",
        serialNumber: cleanValues[2] || "",
        purchaseDate: cleanValues[3] || undefined,
        warrantyEnd: cleanValues[4] || undefined,
        renewalDate: cleanValues[5] || undefined,
        location: cleanValues[6] || undefined,
        notes: cleanValues[7] || undefined,
      };

      if (row.materialName && row.serialNumber) {
        rows.push(row);
      }
    }

    return rows;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".csv")) {
        toast.error("Veuillez sélectionner un fichier CSV");
        return;
      }
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Veuillez sélectionner un fichier");
      return;
    }

    setImporting(true);
    setProgress(0);
    const errors: string[] = [];
    let successCount = 0;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Utilisateur non connecté");
        setImporting(false);
        return;
      }

      const content = await file.text();
      const rows = parseCSV(content);

      if (rows.length === 0) {
        toast.error("Aucune donnée valide trouvée dans le fichier");
        setImporting(false);
        return;
      }

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNum = i + 2; // +2 because of header and 0-index

        try {
          // Check if serial number already exists
          const { data: existingSerial } = await supabase
            .from("serials")
            .select("id")
            .eq("serial_number", row.serialNumber)
            .maybeSingle();

          if (existingSerial) {
            errors.push(`Ligne ${rowNum}: Numéro de série "${row.serialNumber}" existe déjà`);
            continue;
          }

          // Check if material exists by name
          let { data: material } = await supabase
            .from("materials")
            .select("id, stock")
            .eq("name", row.materialName)
            .maybeSingle();

          // Create material if it doesn't exist
          if (!material) {
            const { data: newMaterial, error: materialError } = await supabase
              .from("materials")
              .insert({
                name: row.materialName,
                category: row.category as any,
                stock: 0,
                min_stock: 0,
              })
              .select("id, stock")
              .single();

            if (materialError) {
              errors.push(`Ligne ${rowNum}: Erreur création matériel - ${materialError.message}`);
              continue;
            }
            material = newMaterial;
          }

          // Parse dates
          const purchaseDate = row.purchaseDate ? new Date(row.purchaseDate) : undefined;
          const warrantyEnd = row.warrantyEnd ? new Date(row.warrantyEnd) : undefined;
          const renewalDate = row.renewalDate ? new Date(row.renewalDate) : undefined;

          // Validate dates
          if (row.purchaseDate && isNaN(purchaseDate!.getTime())) {
            errors.push(`Ligne ${rowNum}: Date d'achat invalide`);
            continue;
          }
          if (row.warrantyEnd && isNaN(warrantyEnd!.getTime())) {
            errors.push(`Ligne ${rowNum}: Date de garantie invalide`);
            continue;
          }
          if (row.renewalDate && isNaN(renewalDate!.getTime())) {
            errors.push(`Ligne ${rowNum}: Date de renouvellement invalide`);
            continue;
          }

          // Create serial
          const { error: serialError } = await supabase
            .from("serials")
            .insert({
              material_id: material.id,
              serial_number: row.serialNumber,
              status: "En stock",
              purchase_date: purchaseDate?.toISOString(),
              warranty_end: warrantyEnd?.toISOString(),
              renewal_date: renewalDate?.toISOString(),
              location: row.location || null,
              notes: row.notes || null,
            });

          if (serialError) {
            errors.push(`Ligne ${rowNum}: Erreur création série - ${serialError.message}`);
            continue;
          }

          // Update material stock
          await supabase
            .from("materials")
            .update({ stock: material.stock + 1 })
            .eq("id", material.id);

          successCount++;
        } catch (error) {
          console.error(`Error processing row ${rowNum}:`, error);
          errors.push(`Ligne ${rowNum}: Erreur inattendue`);
        }

        setProgress(((i + 1) / rows.length) * 100);
      }

      setResult({ success: successCount, errors });

      if (successCount > 0) {
        toast.success(`${successCount} matériel(s) importé(s) avec succès`);
        if (errors.length === 0) {
          setTimeout(() => {
            onSuccess();
          }, 2000);
        }
      }

      if (errors.length > 0) {
        toast.error(`${errors.length} erreur(s) lors de l'import`);
      }

    } catch (error) {
      console.error("Import error:", error);
      toast.error("Erreur lors de l'import du fichier");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Importez un fichier CSV pour ajouter plusieurs matériels avec leurs numéros de série en une seule fois.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label>Fichier CSV</Label>
        <div className="flex gap-2">
          <Input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={importing}
          />
          <Button
            type="button"
            variant="outline"
            onClick={downloadTemplate}
            disabled={importing}
          >
            <Download className="h-4 w-4 mr-2" />
            Modèle
          </Button>
        </div>
        {file && (
          <p className="text-sm text-muted-foreground">
            Fichier sélectionné: {file.name}
          </p>
        )}
      </div>

      <div className="bg-muted/50 p-4 rounded-lg space-y-2">
        <h4 className="font-medium text-sm">Format attendu:</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• <strong>materialName</strong>: Nom du matériel (requis)</li>
          <li>• <strong>category</strong>: Catégorie (requis)</li>
          <li>• <strong>serialNumber</strong>: Numéro de série (requis, unique)</li>
          <li>• <strong>purchaseDate</strong>: Date d'achat (format: YYYY-MM-DD)</li>
          <li>• <strong>warrantyEnd</strong>: Fin de garantie (format: YYYY-MM-DD)</li>
          <li>• <strong>renewalDate</strong>: Renouvellement prévu (format: YYYY-MM-DD)</li>
          <li>• <strong>location</strong>: Emplacement</li>
          <li>• <strong>notes</strong>: Notes</li>
        </ul>
      </div>

      {importing && (
        <div className="space-y-2">
          <Label>Progression</Label>
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground text-center">
            Import en cours... {Math.round(progress)}%
          </p>
        </div>
      )}

      {result && (
        <div className="space-y-2">
          <Alert variant={result.errors.length > 0 ? "destructive" : "default"}>
            {result.errors.length === 0 ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              <strong>{result.success}</strong> matériel(s) importé(s) avec succès
              {result.errors.length > 0 && (
                <span>, <strong>{result.errors.length}</strong> erreur(s)</span>
              )}
            </AlertDescription>
          </Alert>

          {result.errors.length > 0 && (
            <div className="space-y-2">
              <Label>Erreurs détaillées:</Label>
              <ScrollArea className="h-32 rounded-md border border-border p-3">
                <ul className="text-xs space-y-1">
                  {result.errors.map((error, index) => (
                    <li key={index} className="text-destructive">
                      {error}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          )}
        </div>
      )}

      <Button
        onClick={handleImport}
        disabled={!file || importing}
        className="w-full"
      >
        <Upload className="h-4 w-4 mr-2" />
        {importing ? "Import en cours..." : "Importer"}
      </Button>
    </div>
  );
}
