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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface CSVRow {
  email: string;
  displayName: string;
  department?: string;
  site?: string;
  role?: string;
}

interface ImportResult {
  success: number;
  errors: string[];
}

export function ImportUsersCSV() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const headers = [
      "email",
      "displayName",
      "department",
      "site",
      "role"
    ];
    
    const exampleRows = [
      [
        "jean.dupont@exemple.fr",
        "Jean Dupont",
        "IT",
        "Paris",
        "lecteur"
      ],
      [
        "marie.martin@exemple.fr",
        "Marie Martin",
        "RH",
        "Lyon",
        "magasinier"
      ]
    ];

    const csv = [
      headers.join(","),
      ...exampleRows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "modele_import_utilisateurs.csv";
    link.click();
    
    toast.success("Modèle CSV téléchargé");
  };

  const parseCSV = (content: string): CSVRow[] => {
    const lines = content.split("\n").filter(line => line.trim());
    if (lines.length < 2) return [];

    const rows: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
      const cleanValues = values.map(v => v.trim().replace(/^"|"$/g, ""));

      if (cleanValues.length < 2) continue;

      const row: CSVRow = {
        email: cleanValues[0] || "",
        displayName: cleanValues[1] || "",
        department: cleanValues[2] || undefined,
        site: cleanValues[3] || undefined,
        role: cleanValues[4] || "lecteur",
      };

      if (row.email && row.displayName) {
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

    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
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

      // Validate all rows first
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const validRoles = ['admin', 'magasinier', 'acheteur', 'lecteur'];

      const validUsers = [];
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNum = i + 2;

        if (!emailRegex.test(row.email)) {
          errors.push(`Ligne ${rowNum}: Email invalide "${row.email}"`);
          continue;
        }

        if (row.role && !validRoles.includes(row.role)) {
          errors.push(`Ligne ${rowNum}: Rôle invalide "${row.role}". Utilisez: ${validRoles.join(', ')}`);
          continue;
        }

        validUsers.push({
          email: row.email,
          displayName: row.displayName,
          department: row.department,
          site: row.site,
          role: row.role || 'lecteur'
        });
      }

      if (validUsers.length === 0) {
        toast.error("Aucun utilisateur valide à importer");
        setImporting(false);
        setResult({ success: 0, errors });
        return;
      }

      toast.info(`Import de ${validUsers.length} utilisateur(s) en cours...`);

      // Call edge function to create users in bulk
      const { data, error } = await supabase.functions.invoke('bulk-create-users', {
        body: { users: validUsers }
      });

      if (error) {
        console.error("Edge function error:", error);
        toast.error(`Erreur lors de l'import: ${error.message}`);
        setResult({ 
          success: 0, 
          errors: [...errors, `Erreur serveur: ${error.message}`] 
        });
        setImporting(false);
        return;
      }

      // Process results from edge function
      const successCount = data.success || 0;
      const serverErrors = data.errors || [];

      // Combine local validation errors with server errors
      const allErrors = [
        ...errors,
        ...serverErrors.map((e: any) => `${e.email}: ${e.error}`)
      ];

      setProgress(100);
      setResult({ success: successCount, errors: allErrors });

      if (successCount > 0) {
        toast.success(`${successCount} utilisateur(s) créé(s) avec succès`);
      }

      if (allErrors.length > 0) {
        toast.error(`${allErrors.length} erreur(s) lors de l'import`);
      }

      // Reload users list if any were created
      if (successCount > 0) {
        // Trigger a refresh after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }

    } catch (error) {
      console.error("Import error:", error);
      toast.error("Erreur lors de l'import du fichier");
      setResult({ 
        success: 0, 
        errors: [...errors, error instanceof Error ? error.message : 'Erreur inconnue'] 
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Importer CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import CSV d'utilisateurs</DialogTitle>
          <DialogDescription>
            Importez un fichier CSV pour inviter plusieurs utilisateurs en une seule fois
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important - Import en masse optimisé :</strong>
              <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
                <li>Le fichier CSV doit contenir : email, displayName, department (opt.), site (opt.), role (opt.)</li>
                <li>Les utilisateurs seront créés avec un mot de passe temporaire généré automatiquement</li>
                <li>L'import traite jusqu'à 1000 utilisateurs par lots de 10 pour optimiser les performances</li>
                <li>Les emails des utilisateurs seront automatiquement confirmés</li>
                <li>Les utilisateurs pourront se connecter immédiatement</li>
              </ul>
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
              <li>• <strong>email</strong>: Adresse email (requis, unique)</li>
              <li>• <strong>displayName</strong>: Nom complet (requis)</li>
              <li>• <strong>department</strong>: Département (optionnel)</li>
              <li>• <strong>site</strong>: Site (optionnel)</li>
              <li>• <strong>role</strong>: Rôle (admin, magasinier, acheteur, lecteur)</li>
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
                  <strong>{result.success}</strong> utilisateur(s) importé(s) avec succès
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
      </DialogContent>
    </Dialog>
  );
}
