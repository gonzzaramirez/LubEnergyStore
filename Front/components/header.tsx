"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { cn } from "@/lib/utils";

export function Header() {
  const { totalItems, setIsOpen, justAdded } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === "/";

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    if (!isHomePage) {
      e.preventDefault();
      router.push(`/#${hash}`);
      // El HashScrollHandler se encargará del scroll cuando la página cargue
    } else {
      // Si estamos en la home, hacer scroll suave
      e.preventDefault();
      const element = document.getElementById(hash);
      if (element) {
        const headerOffset = 80; // Altura del header
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="relative flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo - Pegado a la izquierda */}
        <div className="flex items-center">
          <Link href="/">
            <Image
              src="/LUB ENERGY_NG_.png"
              alt="LUB ENERGY"
              width={80}
              height={30}
              className="h-6 w-auto object-contain sm:h-8 md:h-10"
              priority
            />
          </Link>
        </div>

        {/* Navigation - Centrado */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 transform items-center gap-8 md:flex">
          <a
            href={isHomePage ? "#productos" : "/#productos"}
            onClick={(e) => handleNavClick(e, "productos")}
            className="text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            Productos
          </a>
          <a
            href={isHomePage ? "#categorias" : "/#categorias"}
            onClick={(e) => handleNavClick(e, "categorias")}
            className="text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            Categorías
          </a>
          <a
            href={isHomePage ? "#contacto" : "/#contacto"}
            onClick={(e) => handleNavClick(e, "contacto")}
            className="text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            Contacto
          </a>
        </nav>

        {/* Cart Button - Pegado a la derecha */}
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary transition-all hover:border-primary hover:bg-secondary/80"
        >
          <ShoppingCart className="h-5 w-5 text-foreground" />
          {totalItems > 0 && (
            <span
              className={cn(
                "absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground",
                justAdded && "cart-bounce"
              )}
            >
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
