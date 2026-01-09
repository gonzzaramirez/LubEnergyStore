"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tags,
  BarChart3,
  LogOut,
  TrendingUp,
  Ticket,
  Loader2,
} from "lucide-react";
import { logout } from "@/lib/api/auth";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/dashboard/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/dashboard/productos", label: "Productos", icon: Package },
  { href: "/dashboard/categorias", label: "Categorías", icon: Tags },
  { href: "/dashboard/precios", label: "Ajustar Precios", icon: TrendingUp },
  { href: "/dashboard/descuentos", label: "Códigos Descuento", icon: Ticket },
  { href: "/dashboard/reports", label: "Reportes", icon: BarChart3 },
];

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push("/dashboard/login");
      router.refresh();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:static left-0 top-0 h-full w-64 bg-white
        border-r border-slate-200 z-40 transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        {/* Header */}
        <div className="pt-6 pb-4 px-4 border-b border-slate-200">
          <p className="font-bold text-black text-center">
            Dashboard Lub Energy
          </p>
        </div>

        {/* Navegación */}
        <nav className="px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                  transition-colors
                  ${
                    active
                      ? "bg-black text-white"
                      : "text-slate-800 hover:bg-slate-100"
                  }
                `}
              >
                <Icon className="w-5 h-5" strokeWidth={1.5} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 w-full p-3 border-t border-slate-200">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg
              text-sm text-slate-800 hover:bg-slate-100 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <LogOut className="w-5 h-5" />
            )}
            {isLoggingOut ? "Cerrando..." : "Cerrar sesión"}
          </button>
        </div>
      </aside>
    </>
  );
}
