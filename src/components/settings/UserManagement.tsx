import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Edit, Plus, Trash2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database['public']['Enums']['app_role'];

const userSchema = z.object({
  displayName: z.string().min(2, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères').optional(),
  department: z.string().optional(),
  site: z.string().optional(),
  role: z.enum(['admin', 'magasinier', 'acheteur', 'lecteur'])
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserWithRole {
  id: string;
  email: string;
  display_name: string;
  department: string | null;
  site: string | null;
  role: AppRole;
  created_at: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Load roles for each user
      const usersWithRoles = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.id)
            .single();

          return {
            ...profile,
            role: roleData?.role || 'lecteur' as AppRole
          };
        })
      );

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    }
  };

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      department: '',
      site: '',
      role: 'lecteur'
    }
  });

  const onSubmit = async (values: UserFormValues) => {
    try {
      if (editingUser) {
        // Update profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            display_name: values.displayName,
            email: values.email,
            department: values.department || null,
            site: values.site || null
          })
          .eq('id', editingUser.id);

        if (profileError) throw profileError;

        // Update role
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({ role: values.role as AppRole })
          .eq('user_id', editingUser.id);

        if (roleError) throw roleError;

        toast.success('Utilisateur mis à jour');
      } else {
        // Create new user
        if (!values.password) {
          toast.error('Le mot de passe est requis pour créer un utilisateur');
          return;
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              display_name: values.displayName,
              department: values.department || null,
              site: values.site || null
            }
          }
        });

        if (authError) throw authError;

        // Update role if user was created
        if (authData.user && values.role !== 'lecteur') {
          const { error: roleError } = await supabase
            .from('user_roles')
            .update({ role: values.role as AppRole })
            .eq('user_id', authData.user.id);

          if (roleError) throw roleError;
        }

        toast.success('Utilisateur créé avec succès');
      }
      setShowDialog(false);
      setEditingUser(null);
      form.reset();
      loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (user: UserWithRole) => {
    setEditingUser(user);
    form.reset({
      displayName: user.display_name,
      email: user.email,
      password: '',
      department: user.department || '',
      site: user.site || '',
      role: user.role
    });
    setShowDialog(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    form.reset({
      displayName: '',
      email: '',
      password: '',
      department: '',
      site: '',
      role: 'lecteur'
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    toast.error('La suppression d\'utilisateurs n\'est pas disponible pour des raisons de sécurité');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Utilisateurs</h3>
          <p className="text-sm text-muted-foreground">
            Gérez les utilisateurs et leurs rôles
          </p>
        </div>
        <Button onClick={handleAdd} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un utilisateur
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Département</TableHead>
            <TableHead>Site</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.display_name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.department || '-'}</TableCell>
              <TableCell>{user.site || '-'}</TableCell>
              <TableCell>
                <Badge variant={
                  user.role === 'admin' ? 'default' :
                  user.role === 'magasinier' ? 'secondary' :
                  user.role === 'acheteur' ? 'outline' :
                  'secondary'
                }>
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
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

      {users.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Aucun utilisateur trouvé</p>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Modifier l\'utilisateur' : 'Créer un nouvel utilisateur'}
            </DialogTitle>
            <DialogDescription>
              {editingUser 
                ? 'Modifiez les informations de l\'utilisateur'
                : 'Créez un nouveau compte utilisateur avec email et mot de passe'
              }
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
                      <Input type="email" {...field} disabled={!!editingUser} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!editingUser && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} placeholder="Minimum 6 caractères" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
                  Enregistrer
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
