import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { db } from '@/lib/db';
import { toast } from 'sonner';
import { Order } from '@/lib/mockData';
import { useEffect, useState } from 'react';
import { Supplier } from '@/lib/db';
import { Upload, Loader2, X, Plus, FileDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import * as pdfjsLib from 'pdfjs-dist';

const orderSchema = z.object({
  reference: z.string().min(2, 'La référence est requise'),
  supplier: z.string().min(1, 'Le fournisseur est requis'),
  amount: z.number().min(0, 'Le montant doit être positif'),
  status: z.enum(['Demandé', 'Circuit interne', 'Commande fournisseur faite', 'Livré']),
  notes: z.string().optional(),
  description: z.string().optional()
});

type OrderFormValues = z.infer<typeof orderSchema>;

interface OrderFormProps {
  order?: Order;
  onSuccess: () => void;
  onCancel: () => void;
}

interface OrderLine {
  materialName: string;
  quantity: number;
  unitPrice: number;
}

export function OrderForm({ order, onSuccess, onCancel }: OrderFormProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [orderLines, setOrderLines] = useState<OrderLine[]>([]);
  const [showNewSupplierDialog, setShowNewSupplierDialog] = useState(false);
  const [extractedSupplier, setExtractedSupplier] = useState<string>('');
  const [newSupplierForm, setNewSupplierForm] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    db.suppliers.toArray().then(setSuppliers);
  }, []);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: order ? {
      reference: order.reference,
      supplier: order.supplier,
      amount: order.amount,
      status: order.status,
      notes: '',
      description: order.description || ''
    } : {
      reference: '',
      supplier: '',
      amount: 0,
      status: 'Demandé',
      notes: '',
      description: ''
    }
  });

  const handlePdfUpload = async (file: File) => {
    setPdfFile(file);
    setIsExtracting(true);
    
    try {
      // Configure PDF.js worker using jsdelivr CDN which works better with Vite
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      // Read PDF file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      // Extract text from all pages
      let pdfText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        pdfText += pageText + '\n';
      }

      // Call edge function with extracted text
      const { data, error } = await supabase.functions.invoke('extract-quote', {
        body: { pdfText }
      });
      
      if (error) throw error;
      
      if (data && data.lines && data.totalAmount) {
        setOrderLines(data.lines);
        form.setValue('amount', data.totalAmount);
        
        // Set reference if extracted
        if (data.reference) {
          form.setValue('reference', data.reference);
        }
        
        // Handle supplier
        if (data.supplier) {
          const existingSupplier = suppliers.find(s => 
            s.name.toLowerCase() === data.supplier.toLowerCase()
          );
          
          if (existingSupplier) {
            form.setValue('supplier', existingSupplier.name);
            toast.success(`${data.lines.length} ligne(s) extraite(s) du PDF`);
          } else {
            // Supplier doesn't exist, prompt to create
            setExtractedSupplier(data.supplier);
            setNewSupplierForm(prev => ({ ...prev, name: data.supplier }));
            setShowNewSupplierDialog(true);
            toast.info(`Fournisseur "${data.supplier}" non trouvé. Créez-le pour continuer.`);
          }
        } else {
          toast.success(`${data.lines.length} ligne(s) extraite(s) du PDF`);
        }
      } else {
        toast.error('Impossible d\'extraire les données du PDF');
      }
    } catch (error) {
      console.error('Error extracting PDF:', error);
      toast.error('Erreur lors de l\'analyse du PDF');
    } finally {
      setIsExtracting(false);
    }
  };

  const calculateTotal = () => {
    const total = orderLines.reduce((sum, line) => sum + (line.quantity * line.unitPrice), 0);
    form.setValue('amount', total);
  };

  const addOrderLine = () => {
    setOrderLines([...orderLines, { materialName: '', quantity: 1, unitPrice: 0 }]);
  };

  const updateOrderLine = (index: number, field: keyof OrderLine, value: string | number) => {
    const updated = [...orderLines];
    updated[index] = { ...updated[index], [field]: value };
    setOrderLines(updated);
    calculateTotal();
  };

  const removeOrderLine = (index: number) => {
    setOrderLines(orderLines.filter((_, i) => i !== index));
    setTimeout(calculateTotal, 0);
  };

  const handleCreateSupplier = async () => {
    try {
      await db.suppliers.add({
        id: crypto.randomUUID(),
        name: newSupplierForm.name,
        contact: newSupplierForm.contact || null,
        email: newSupplierForm.email || null,
        phone: newSupplierForm.phone || null,
        address: newSupplierForm.address || null,
        createdAt: new Date()
      });
      
      const updatedSuppliers = await db.suppliers.toArray();
      setSuppliers(updatedSuppliers);
      form.setValue('supplier', newSupplierForm.name);
      setShowNewSupplierDialog(false);
      toast.success(`Fournisseur "${newSupplierForm.name}" créé avec succès`);
      
      // Reset form
      setNewSupplierForm({
        name: '',
        contact: '',
        email: '',
        phone: '',
        address: ''
      });
    } catch (error) {
      console.error('Error creating supplier:', error);
      toast.error('Erreur lors de la création du fournisseur');
    }
  };

  const handleGeneratePdf = async () => {
    const values = form.getValues();
    
    if (!values.reference || !values.supplier || orderLines.length === 0) {
      toast.error('Veuillez remplir la référence, le fournisseur et ajouter au moins une ligne de commande');
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-quote-pdf', {
        body: {
          reference: values.reference,
          supplier: values.supplier,
          amount: values.amount,
          description: values.description,
          lines: orderLines,
          date: new Date().toISOString()
        }
      });

      if (error) throw error;

      // Open PDF in new window
      const blob = new Blob([data], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      toast.success('PDF généré avec succès');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const onSubmit = async (values: OrderFormValues) => {
    try {
      const orderData: Order = {
        id: order?.id || crypto.randomUUID(),
        reference: values.reference,
        supplier: values.supplier,
        amount: values.amount,
        status: values.status,
        createdAt: order?.createdAt instanceof Date ? order.createdAt : new Date(order?.createdAt || Date.now()),
        currency: 'EUR',
        site: order?.site || '',
        requestedBy: order?.requestedBy || '',
        description: values.description || '',
        tags: order?.tags || [],
        lines: order?.lines || [],
        deliveries: order?.deliveries || [],
        history: order?.history || [],
        files: order?.files || []
      };

      if (order?.id) {
        await db.orders.update(order.id, {
          reference: orderData.reference,
          supplier: orderData.supplier,
          amount: orderData.amount,
          status: orderData.status,
          description: orderData.description
        });
        toast.success('Commande mise à jour');
      } else {
        await db.orders.add(orderData);
        toast.success('Commande créée');
      }
      
      onSuccess();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <FormLabel>Document PDF de devis</FormLabel>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePdfUpload(file);
                }}
                className="flex-1"
                disabled={isExtracting}
              />
              {isExtracting && (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              )}
              {pdfFile && !isExtracting && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Upload className="h-4 w-4" />
                  {pdfFile.name}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Téléchargez un devis PDF pour extraire automatiquement les informations
            </p>
          </div>

          <FormField
            control={form.control}
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Référence de commande</FormLabel>
                <FormControl>
                  <Input placeholder="CMD-2024-001" {...field} />
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
              <div className="flex gap-2">
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Sélectionner un fournisseur" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {suppliers.map(supplier => (
                      <SelectItem key={supplier.id} value={supplier.name}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setNewSupplierForm({
                      name: '',
                      contact: '',
                      email: '',
                      phone: '',
                      address: ''
                    });
                    setShowNewSupplierDialog(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Montant total (€)</FormLabel>
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
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Statut</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Demandé">Demandé</SelectItem>
                  <SelectItem value="Circuit interne">Circuit interne</SelectItem>
                  <SelectItem value="Commande fournisseur faite">Commande fournisseur faite</SelectItem>
                  <SelectItem value="Livré">Livré</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Description du devis..." {...field} />
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
                <Textarea placeholder="Informations complémentaires..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <FormLabel>Lignes de commande</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOrderLine}
            >
              <Plus className="h-4 w-4 mr-1" />
              Ajouter une ligne
            </Button>
          </div>
          {orderLines.length > 0 ? (
            <ScrollArea className="h-[250px] border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Matériel</TableHead>
                    <TableHead className="w-24">Quantité</TableHead>
                    <TableHead className="w-32">Prix unitaire</TableHead>
                    <TableHead className="w-32">Total</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderLines.map((line, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          value={line.materialName}
                          onChange={(e) => updateOrderLine(index, 'materialName', e.target.value)}
                          placeholder="Nom du matériel"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={line.quantity}
                          onChange={(e) => updateOrderLine(index, 'quantity', parseInt(e.target.value) || 0)}
                          min="1"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={line.unitPrice}
                          onChange={(e) => updateOrderLine(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          min="0"
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {(line.quantity * line.unitPrice).toFixed(2)} €
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOrderLine(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <div className="border rounded-md p-8 text-center text-muted-foreground">
              <p>Aucune ligne de commande. Cliquez sur "Ajouter une ligne" pour commencer.</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleGeneratePdf}
            disabled={isGeneratingPdf || orderLines.length === 0}
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4 mr-2" />
                Générer PDF
              </>
            )}
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit">
              {order ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </div>
      </form>
    </Form>

    <Dialog open={showNewSupplierDialog} onOpenChange={setShowNewSupplierDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un nouveau fournisseur</DialogTitle>
          <DialogDescription>
            Le fournisseur "{extractedSupplier}" n'existe pas dans votre base. Créez-le maintenant.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nom du fournisseur *</Label>
            <Input
              value={newSupplierForm.name}
              onChange={(e) => setNewSupplierForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nom du fournisseur"
            />
          </div>
          <div>
            <Label>Contact</Label>
            <Input
              value={newSupplierForm.contact}
              onChange={(e) => setNewSupplierForm(prev => ({ ...prev, contact: e.target.value }))}
              placeholder="Nom du contact"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={newSupplierForm.email}
              onChange={(e) => setNewSupplierForm(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@fournisseur.fr"
            />
          </div>
          <div>
            <Label>Téléphone</Label>
            <Input
              value={newSupplierForm.phone}
              onChange={(e) => setNewSupplierForm(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="01 23 45 67 89"
            />
          </div>
          <div>
            <Label>Adresse</Label>
            <Textarea
              value={newSupplierForm.address}
              onChange={(e) => setNewSupplierForm(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Adresse complète"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowNewSupplierDialog(false)}
          >
            Annuler
          </Button>
          <Button
            onClick={handleCreateSupplier}
            disabled={!newSupplierForm.name}
          >
            Créer le fournisseur
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
