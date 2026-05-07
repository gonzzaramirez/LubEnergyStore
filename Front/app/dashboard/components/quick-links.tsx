import Link from "next/link";
import {
  ShoppingCart,
  Store,
  Package,
  TrendingUp,
  BarChart3,
  Ticket,
  Tags,
  Smartphone,
} from "lucide-react";

interface QuickLink {
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
}

const LINKS: QuickLink[] = [
  {
    href: "/dashboard/pedidos",
    label: "Pedidos",
    description: "Gestionar pedidos online",
    icon: <ShoppingCart className="w-5 h-5" />,
    accent: "bg-blue-50 text-blue-600",
  },
  {
    href: "/dashboard/ventas",
    label: "Ventas",
    description: "Registrar ventas presenciales",
    icon: <Store className="w-5 h-5" />,
    accent: "bg-emerald-50 text-emerald-600",
  },
  {
    href: "/dashboard/productos",
    label: "Productos",
    description: "Administrar catálogo y stock",
    icon: <Package className="w-5 h-5" />,
    accent: "bg-violet-50 text-violet-600",
  },
  {
    href: "/dashboard/categorias",
    label: "Categorías",
    description: "Organizar el catálogo",
    icon: <Tags className="w-5 h-5" />,
    accent: "bg-slate-100 text-slate-600",
  },
  {
    href: "/dashboard/precios",
    label: "Ajustar Precios",
    description: "Actualización masiva de precios",
    icon: <TrendingUp className="w-5 h-5" />,
    accent: "bg-amber-50 text-amber-600",
  },
  {
    href: "/dashboard/reports",
    label: "Reportes",
    description: "Métricas de ventas",
    icon: <BarChart3 className="w-5 h-5" />,
    accent: "bg-rose-50 text-rose-600",
  },
  {
    href: "/dashboard/descuentos",
    label: "Descuentos",
    description: "Códigos promocionales",
    icon: <Ticket className="w-5 h-5" />,
    accent: "bg-orange-50 text-orange-600",
  },
  {
    href: "/dashboard/whatsapp",
    label: "WhatsApp",
    description: "Notificaciones automáticas",
    icon: <Smartphone className="w-5 h-5" />,
    accent: "bg-green-50 text-green-600",
  },
];

export default function QuickLinks() {
  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
        Accesos rápidos
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 hover:border-slate-300 hover:shadow-sm transition-all group"
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${link.accent}`}>
              {link.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 group-hover:text-black transition-colors">
                {link.label}
              </p>
              <p className="text-xs text-slate-400 mt-0.5 leading-snug">{link.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
