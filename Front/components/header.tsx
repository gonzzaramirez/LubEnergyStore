"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { cn } from "@/lib/utils";

export function Header() {
  const { totalItems, setIsOpen, justAdded } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === "/";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Cerrar menú móvil cuando cambia la ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    hash: string
  ) => {
    setIsMobileMenuOpen(false);
    if (!isHomePage) {
      e.preventDefault();
      router.push(`/#${hash}`);
    } else {
      e.preventDefault();
      const element = document.getElementById(hash);
      if (element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
      role="banner"
    >
      <div className="relative flex h-14 items-center justify-between px-3 sm:h-16 sm:px-4 md:px-6">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary transition-all hover:border-primary md:hidden"
          aria-expanded={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5 text-foreground" />
          ) : (
            <Menu className="h-5 w-5 text-foreground" />
          )}
        </button>

        {/* Logo - Centrado en móvil, izquierda en desktop */}
        <div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
          <Link href="/" aria-label="LUB ENERGY - Ir al inicio">
            <Image
              src="/LUB ENERGY_NG_.png"
              alt="LUB ENERGY"
              width={160}
              height={60}
              className="h-6 w-auto object-contain sm:h-7 md:h-9 lg:h-10"
              priority
            />
          </Link>
        </div>

        {/* Desktop Navigation - Centrado */}
        <nav
          className="absolute left-1/2 hidden -translate-x-1/2 transform items-center gap-6 md:flex md:gap-8 lg:gap-10"
          aria-label="Navegación principal"
        >
          <Link
            href="/productos"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/productos"
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            Productos
          </Link>
          <a
            href={isHomePage ? "#productos" : "/#productos"}
            onClick={(e) => handleNavClick(e, "productos")}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Destacados
          </a>
          <a
            href={isHomePage ? "#contacto" : "/#contacto"}
            onClick={(e) => handleNavClick(e, "contacto")}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Contacto
          </a>
        </nav>

        {/* Cart Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary transition-all hover:border-primary hover:bg-secondary/80 sm:h-10 sm:w-10"
          aria-label={`Carrito${totalItems > 0 ? `, ${totalItems} productos` : ""}`}
        >
          <ShoppingCart className="h-4 w-4 text-foreground sm:h-5 sm:w-5" />
          {totalItems > 0 && (
            <span
              className={cn(
                "absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground sm:-right-2 sm:-top-2 sm:h-5 sm:w-5 sm:text-xs",
                justAdded && "cart-bounce"
              )}
            >
              {totalItems}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Menu - Simplificado */}
      {isMobileMenuOpen && (
        <div className="absolute left-0 right-0 top-14 border-b border-border bg-background p-4 shadow-lg md:hidden">
          <nav className="flex flex-col gap-4">
            <Link
              href="/productos"
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "text-lg font-medium py-2 transition-colors",
                pathname === "/productos"
                  ? "text-primary"
                  : "text-foreground hover:text-primary"
              )}
            >
              Productos
            </Link>
            <a
              href={isHomePage ? "#productos" : "/#productos"}
              onClick={(e) => handleNavClick(e, "productos")}
              className="text-lg font-medium py-2 text-foreground transition-colors hover:text-primary"
            >
              Destacados
            </a>
            <a
              href={isHomePage ? "#contacto" : "/#contacto"}
              onClick={(e) => handleNavClick(e, "contacto")}
              className="text-lg font-medium py-2 text-foreground transition-colors hover:text-primary"
            >
              Contacto
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
