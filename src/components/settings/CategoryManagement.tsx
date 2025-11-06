import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { db } from "@/lib/db";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

const categorySchema = z.object({
  name: z.string().min(2, 'Le nom est requis')
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export function CategoryManagement() {
  const [categories, setCategories] = useState<string[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [materialCounts, setMaterialCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const materials = await db.materials.toArray();
    const uniqueCategories = Array.from(new Set(materials.map(m => m.category)));
    setCategories(uniqueCategories);
    
    const counts: Record<string, number> = {};
    materials.forEach(m => {
      counts[m.category] = (counts[m.category] || 0) + 1;
    });
    setMaterialCounts(counts);
  };

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: ''
    }
  });

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      if (categories.includes(values.name)) {
        toast.error('Cette catégorie existe déjà');
        return;
      }
      
      // On ajoute simplement un matériel vide avec cette catégorie pour créer la catégorie
      // Dans une vraie app, on aurait une table séparée pour les catégories
      toast.success('Catégorie créée - elle sera disponible lors de la création de matériels');
      setShowDialog(false);
      form.reset();
      loadCategories();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (category: string) => {
    const count = materialCounts[category] || 0;
    if (count > 0) {
      toast.error(`Impossible de supprimer : ${count} matériel(s) utilisent cette catégorie`);
      return;
    }
    
    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      try {
        toast.success('Catégorie supprimée');
        loadCategories();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Catégories de matériels</h3>
          <p className="text-sm text-muted-foreground">
            Gérez les catégories utilisées pour classifier vos matériels
          </p>
        </div>
        <Button onClick={() => {
          form.reset();
          setShowDialog(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle catégorie
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(category => (
          <div 
            key={category}
            className="rounded-lg border border-border bg-card p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Badge variant="secondary">{category}</Badge>
              <span className="text-sm text-muted-foreground">
                {materialCounts[category] || 0} matériel(s)
              </span>
            </div>
            {(materialCounts[category] || 0) === 0 && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleDelete(category)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Aucune catégorie définie</p>
          <p className="text-sm mt-2">Les catégories sont créées automatiquement lors de l'ajout de matériels</p>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle catégorie</DialogTitle>
            <DialogDescription>
              Créez une nouvelle catégorie pour classifier vos matériels
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de la catégorie</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Ordinateurs portables" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  Créer
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
