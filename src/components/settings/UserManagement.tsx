import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { db, User } from "@/lib/db";
import { toast } from "sonner";
import { Edit, Plus, Trash2, Upload } from "lucide-react";
import * as XLSX from 'xlsx';

const userSchema = z.object({
  displayName: z.string().min(2, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  department: z.string().optional(),
  site: z.string().optional(),
  role: z.enum(['admin', 'magasinier', 'acheteur', 'lecteur'])
});

type UserFormValues = z.infer<typeof userSchema>;

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const data = await db.users.toArray();
    setUsers(data);
  };

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      displayName: '',
      email: '',
      department: '',
      site: '',
      role: 'lecteur'
    }
  });

  const onSubmit = async (values: UserFormValues) => {
    try {
      if (editingUser) {
        await db.users.update(editingUser.id, {
          displayName: values.displayName,
          email: values.email,
          department: values.department || '',
          site: values.site || '',
          role: values.role
        });
        toast.success('Utilisateur mis à jour');
      } else {
        await db.users.add({
          id: crypto.randomUUID(),
          displayName: values.displayName,
          email: values.email,
          department: values.department || '',
          site: values.site || '',
          role: values.role,
          password: 'changeme123',
          createdAt: new Date()
        });
        toast.success('Utilisateur créé');
      }
      setShowDialog(false);
      setEditingUser(null);
      form.reset();
      loadUsers();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.reset({
      displayName: user.displayName,
      email: user.email,
      department: user.department || '',
      site: user.site || '',
      role: user.role
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await db.users.delete(id);
        toast.success('Utilisateur supprimé');
        loadUsers();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleImportExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet) as any[];

        let imported = 0;
        for (const row of jsonData) {
          if (row.displayName && row.email) {
            await db.users.add({
              id: crypto.randomUUID(),
              displayName: row.displayName,
              email: row.email,
              department: row.department || '',
              site: row.site || '',
              role: row.role || 'lecteur',
              password: 'changeme123',
              createdAt: new Date()
            });
            imported++;
          }
        }

        toast.success(`${imported} utilisateurs importés`);
        setShowImportDialog(false);
        loadUsers();
      } catch (error) {
        toast.error('Erreur lors de l\'import');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'acheteur': 
      case 'magasinier': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Utilisateurs</h3>
          <p className="text-sm text-muted-foreground">
            Gérez les utilisateurs et leurs rôles d'accès
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowImportDialog(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Importer Excel
          </Button>
          <Button onClick={() => {
            setEditingUser(null);
            form.reset();
            setShowDialog(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel utilisateur
          </Button>
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Département</TableHead>
              <TableHead>Site</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.displayName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.department || '-'}</TableCell>
                <TableCell>{user.site || '-'}</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Modifier' : 'Nouvel'} utilisateur</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Modifiez les informations de l\'utilisateur' : 'Créez un nouvel utilisateur'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
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
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rôle</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="magasinier">Magasinier</SelectItem>
                        <SelectItem value="acheteur">Acheteur</SelectItem>
                        <SelectItem value="lecteur">Lecteur</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  {editingUser ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importer des utilisateurs depuis Excel</DialogTitle>
            <DialogDescription>
              Le fichier Excel doit contenir les colonnes : displayName, email, department, site, role
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportExcel}
            />
            <div className="text-sm text-muted-foreground">
              <p>Format attendu :</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>displayName (requis)</li>
                <li>email (requis)</li>
                <li>department (optionnel)</li>
                <li>site (optionnel)</li>
                <li>role : admin, gestionnaire ou lecteur (défaut: lecteur)</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
