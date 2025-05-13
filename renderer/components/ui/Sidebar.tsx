import React from "react";
import {
  Home,
  BarChart2,
  FileText,
  Users,
  Settings,
  LogOut,
  LogIn,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../store/auth";

const menu = [
  { label: "Dashboard", icon: <Home size={20} />, href: "/dashboard" },
  { label: "Estadísticas", icon: <BarChart2 size={20} />, href: "/statistics" },
  { label: "Contratos", icon: <FileText size={20} />, href: "/contracts" },
  { label: "Usuarios", icon: <Users size={20} />, href: "/users" },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <aside className="h-screen w-64 bg-[#001B48] flex flex-col justify-between py-6 px-4">
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
          {menu.map(({ label, icon, href }) => {
            const active = location.pathname === href;
            return (
              <Link
                key={href}
                to={href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${
                  active
                    ? "bg-[#D6E8EE] text-[#018ABE]"
                    : "text-white hover:bg-[#02457A]/60"
                }`}
              >
                {icon}
                <span>{label}</span>
              </Link>
            );
          })}
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
