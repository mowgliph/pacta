import React, { useState } from "react";
import {
  Home,
  BarChart2,
  FileText,
  Users,
  Settings,
  LogOut,
  LogIn,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { cn } from "../../lib/utils";

interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  href: string;
  submenu?: MenuItem[];
}

interface SidebarProps {
  onClose?: () => void;
}

const menu: MenuItem[] = [
  { label: "Dashboard", icon: <Home size={20} />, href: "/dashboard" },
  { label: "Estadísticas", icon: <BarChart2 size={20} />, href: "/statistics" },
  { 
    label: "Contratos", 
    icon: <FileText size={20} />, 
    href: "/contracts",
    submenu: [
      { label: "Todos los contratos", href: "/contracts" },
      { label: "Contratos archivados", href: "/contracts/archived" },
    ]
  },
  { label: "Usuarios", icon: <Users size={20} />, href: "/admin/users" },
];

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const isActive = (href: string) => {
    return location.pathname === href || 
           (href !== '/' && location.pathname.startsWith(href + '/'));
  };

  const renderMenuItem = (item: MenuItem, index: number) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isItemActive = isActive(item.href) || 
                        (hasSubmenu && item.submenu?.some(sub => isActive(sub.href)));
    const isSubmenuOpen = openSubmenus[item.label] ?? false;

    return (
      <div key={`${item.href}-${index}`} className="mb-1">
        <div 
          className={cn(
            "flex items-center justify-between px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer",
            isItemActive 
              ? "bg-[#D6E8EE] text-[#018ABE]" 
              : "text-white hover:bg-[#02457A]/60"
          )}
          onClick={() => {
            if (hasSubmenu) {
              toggleSubmenu(item.label);
            } else {
              navigate(item.href);
              onClose?.();
            }
          }}
        >
          <div className="flex items-center gap-3">
            {item.icon}
            <span>{item.label}</span>
          </div>
          {hasSubmenu && (
            <span className="ml-2">
              {isSubmenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          )}
        </div>
        
        {hasSubmenu && isSubmenuOpen && (
          <div className="ml-6 mt-1 space-y-1">
            {item.submenu?.map((subItem, subIndex) => (
              <Link
                key={`${subItem.href}-${subIndex}`}
                to={subItem.href}
                className={cn(
                  "block px-4 py-2 text-sm rounded-lg transition-colors",
                  isActive(subItem.href)
                    ? "text-[#018ABE] font-medium"
                    : "text-white/80 hover:text-white hover:bg-[#02457A]/40"
                )}
                onClick={() => onClose?.()}
              >
                {subItem.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="h-screen w-64 bg-[#001B48] flex flex-col justify-between py-6 px-4 overflow-y-auto">
      <div>
        <div className="mb-8 flex items-center gap-2 px-2">
          <img
            src="/images/logo.png"
            alt="Logo PACTA"
            className="w-8 h-8"
            style={{ filter: "brightness(0) invert(1)" }}
          />
          <span className="text-2xl font-bold text-white tracking-wide">
            PACTA
          </span>
        </div>
        <nav className="flex flex-col gap-1">
          {menu.map(renderMenuItem)}
        </nav>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[#97CADB] flex items-center justify-center text-[#001B48] font-bold">
            {user ? user.name?.[0]?.toUpperCase() || "U" : "U"}
          </div>
          <div className="text-white text-sm">
            <div className="font-semibold">{user ? user.name : "Invitado"}</div>
            <div className="text-xs opacity-70">
              {user ? user.role : "Sin sesión"}
            </div>
          </div>
        </div>
        {user && (
          <button
            className="flex items-center gap-2 text-white/80 hover:text-[#018ABE] mt-2 text-sm"
            onClick={() => navigate("/settings")}
          >
            <Settings size={18} /> Configuración
          </button>
        )}
        {user ? (
          <button
            className="flex items-center gap-2 text-white/80 hover:text-[#F44336] mt-4 text-sm"
            onClick={logout}
          >
            <LogOut size={18} /> Cerrar sesión
          </button>
        ) : (
          <button
            className="flex items-center gap-2 text-white/80 hover:text-[#018ABE] mt-4 text-sm"
            onClick={() => navigate("/login")}
          >
            <LogIn size={18} /> Iniciar sesión
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
