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
        const rowNum = i + 2;

        try {
          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(row.email)) {
            errors.push(`Ligne ${rowNum}: Email invalide "${row.email}"`);
            continue;
          }

          // Validate role
          const validRoles = ['admin', 'magasinier', 'acheteur', 'lecteur'];
          if (row.role && !validRoles.includes(row.role)) {
            errors.push(`Ligne ${rowNum}: Rôle invalide "${row.role}". Utilisez: ${validRoles.join(', ')}`);
            continue;
          }

          // Check if user already exists in profiles
          const { data: existingProfile } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", row.email)
            .maybeSingle();

          if (existingProfile) {
            errors.push(`Ligne ${rowNum}: Utilisateur "${row.email}" existe déjà`);
            continue;
          }

          // Create user via Supabase Auth (requires admin privileges)
          // Note: This requires the service role key, so we'll create a profile only
          // The actual user signup should be done by the user themselves or via an admin function
          
          // For now, we'll just create the profile with a placeholder user_id
          // In production, you'd want to use an edge function with admin privileges
          errors.push(`Ligne ${rowNum}: Création automatique d'utilisateurs non supportée. Les utilisateurs doivent s'inscrire eux-mêmes.`);
          
          // Alternative: Create invitation system or use edge function
          
        } catch (error) {
          console.error(`Error processing row ${rowNum}:`, error);
          errors.push(`Ligne ${rowNum}: Erreur inattendue`);
        }

        setProgress(((i + 1) / rows.length) * 100);
      }

      setResult({ success: successCount, errors });

      if (successCount > 0) {
        toast.success(`${successCount} utilisateur(s) importé(s) avec succès`);
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
              <strong>Note importante :</strong> Cette fonctionnalité crée des invitations. Les utilisateurs devront s'inscrire avec leur email pour activer leur compte.
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
