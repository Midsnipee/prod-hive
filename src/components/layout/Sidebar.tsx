import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Hash, 
  UserCheck,
  Settings
} from "lucide-react";
import logo from "@/assets/logo.png";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Matériels", href: "/materials", icon: Package },
  { name: "Commandes", href: "/orders", icon: ShoppingCart },
  { name: "Numéros de série", href: "/serials", icon: Hash },
  { name: "Attributions", href: "/assignments", icon: UserCheck },
  { name: "Paramètres", href: "/settings", icon: Settings },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <img 
          src={logo} 
          alt="Centre Jean PERRIN" 
          className="w-full h-auto"
        />
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary border-l-2 border-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground hover:translate-x-1"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">Admin</p>
            <p className="text-xs text-muted-foreground truncate">admin@exemple.fr</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
