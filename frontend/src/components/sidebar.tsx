import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  Users, 
  Settings
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Contratos', href: '/contracts', icon: FileText },
    { name: 'Estadísticas', href: '/statistics', icon: BarChart3 },
    { name: 'Usuarios', href: '/users', icon: Users },
    { name: 'Configuración', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border h-screen overflow-y-auto sticky top-0 hidden md:block">
      <div className="p-6">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="bg-primary p-2 rounded-md">
            <span className="text-primary-foreground font-bold">P</span>
          </div>
          <h1 className="text-2xl font-bold">PACTA</h1>
        </Link>
      </div>
      
      <nav className="px-4 pb-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
                           (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;