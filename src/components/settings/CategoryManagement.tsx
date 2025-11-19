import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Constants } from "@/integrations/supabase/types";

type MaterialCategory = typeof Constants.public.Enums.material_category[number];

export function CategoryManagement() {
  const [materialCounts, setMaterialCounts] = useState<Record<string, number>>({});
  
  // Get all categories from the enum
  const allCategories = Constants.public.Enums.material_category;

  useEffect(() => {
    loadCategoryCounts();
  }, []);

  const loadCategoryCounts = async () => {
    try {
      const { data: materials, error } = await supabase
        .from('materials')
        .select('category');

      if (error) throw error;

      const counts: Record<string, number> = {};
      materials?.forEach(m => {
        counts[m.category] = (counts[m.category] || 0) + 1;
      });
      setMaterialCounts(counts);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Erreur lors du chargement des catégories');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Catégories de matériels</h3>
          <p className="text-sm text-muted-foreground">
            Vue d'ensemble des catégories disponibles pour classifier vos matériels
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">
          Les catégories sont définies dans la base de données. Pour ajouter de nouvelles catégories, 
          contactez votre administrateur système.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allCategories.map(category => (
          <div 
            key={category}
            className="rounded-lg border border-border bg-card p-4 flex items-center justify-between hover:bg-accent/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Badge variant={materialCounts[category] > 0 ? "default" : "secondary"}>
                {category}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {materialCounts[category] || 0} matériel(s)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
