import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Material, MaterialCategory } from '@/lib/mockData';
import { useMaterials } from '@/hooks/useMaterials';
import { Enums } from '@/integrations/supabase/types';

const materialSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
  category: z.string().min(1, 'La catégorie est requise'),
  internalRef: z.string().min(1, 'La référence interne est requise'),
  supplier: z.string().min(1, 'Le fournisseur est requis'),
  price: z.number().min(0, 'Le prix doit être positif'),
  stock: z.number().int().min(0, 'Le stock doit être un nombre entier positif'),
  threshold: z.number().int().min(0, 'Le seuil doit être un nombre entier positif'),
  site: z.string().min(1, 'Le site est requis')
});

type MaterialFormValues = z.infer<typeof materialSchema>;

interface MaterialFormProps {
  material?: Material;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MaterialForm({ material, onSuccess, onCancel }: MaterialFormProps) {
  const { createMaterial, updateMaterial } = useMaterials();
  
  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: material ? {
      name: material.name,
      category: material.category,
      internalRef: material.internalRef,
      supplier: material.defaultSupplier,
      price: material.defaultUnitPrice,
      stock: material.stock,
      threshold: material.lowStockThreshold,
      site: material.site
    } : {
      name: '',
      category: 'PC Portable',
      internalRef: '',
      supplier: '',
      price: 0,
      stock: 0,
      threshold: 10,
      site: ''
    }
  });

  const onSubmit = async (values: MaterialFormValues) => {
    const materialData = {
      name: values.name,
      category: 'PC Portable' as Enums<'material_category'>,
      manufacturer: values.supplier,
      unit_price: values.price,
      stock: values.stock,
      min_stock: values.threshold,
      description: ''
    };

    if (material?.id) {
      updateMaterial({ id: material.id, ...materialData });
    } else {
      createMaterial(materialData);
    }
    onSuccess();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du matériel</FormLabel>
              <FormControl>
                <Input placeholder="MacBook Pro 16" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PC Portable">PC Portable</SelectItem>
                  <SelectItem value="Écran">Écran</SelectItem>
                  <SelectItem value="Dock">Dock</SelectItem>
                  <SelectItem value="Smartphone">Smartphone</SelectItem>
                  <SelectItem value="Accessoires">Accessoires</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="internalRef"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Référence interne</FormLabel>
              <FormControl>
                <Input placeholder="REF-2024-001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="supplier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fournisseur</FormLabel>
              <FormControl>
                <Input placeholder="ACME Corp" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix unitaire (€)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    onChange={e => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock actuel</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="threshold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Seuil d'alerte</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={e => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="site"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site</FormLabel>
              <FormControl>
                <Input placeholder="Paris" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit">
            {material ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
