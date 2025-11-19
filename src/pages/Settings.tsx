import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "@/components/settings/UserManagement";
import { SupplierManagement } from "@/components/settings/SupplierManagement";
import { CategoryManagement } from "@/components/settings/CategoryManagement";
import { Users, Package, Tag } from "lucide-react";

const Settings = () => {
  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
          <p className="text-muted-foreground mt-1">
            Configuration de l'application
          </p>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="gap-2">
              <Package className="h-4 w-4" />
              Fournisseurs
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <Tag className="h-4 w-4" />
              Catégories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <UserManagement />
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="suppliers">
            <Card>
              <CardHeader>
                <SupplierManagement />
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CategoryManagement />
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  );
};

export default Settings;
