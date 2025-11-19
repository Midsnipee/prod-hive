import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type MaterialCategory = Database['public']['Enums']['material_category'];

export function CategoryManagement() {
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [materialCounts, setMaterialCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data: materials, error } = await supabase
        .from('materials')
        .select('category');

      if (error) throw error;

      const uniqueCategories = Array.from(new Set(materials?.map(m => m.category) || [])) as MaterialCategory[];
      setCategories(uniqueCategories);
      
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
            Gérez les catégories utilisées pour classifier vos matériels
          </p>
        </div>
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
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Aucune catégorie définie</p>
          <p className="text-sm mt-2">Les catégories sont définies dans la base de données</p>
        </div>
      )}
    </div>
  );
}
