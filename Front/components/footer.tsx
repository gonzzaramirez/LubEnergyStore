import { Instagram, MessageCircleMore } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50" role="contentinfo">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col items-center gap-4 sm:gap-6">
          {/* Logo Text */}
          <Link
            href="/"
            className="flex items-center"
            aria-label="LUB ENERGY - Ir al inicio"
          >
            <span className="text-sm font-bold text-foreground sm:text-base md:text-lg">
              LUB <span className="text-primary">ENERGY</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm"
            aria-label="Enlaces del sitio"
          >
            {[
              { href: "/productos", label: "Productos" },
              { href: "/about", label: "Nosotros" },
              { href: "/contact", label: "Contacto" },
              { href: "/privacy", label: "Privacidad" },
              { href: "/docs", label: "Recursos" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Social Icons */}
          <div
            className="flex items-center gap-4 sm:gap-5"
            role="list"
            aria-label="Redes sociales"
          >
            <a
              href="https://www.instagram.com/lub_energy/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:border-primary hover:text-primary hover:bg-primary/5"
              aria-label="Síguenos en Instagram"
              role="listitem"
            >
              <Instagram className="h-5 w-5" aria-hidden="true" />
            </a>
            <a
              href="https://wa.me/543795056878"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:border-primary hover:text-primary hover:bg-primary/5"
              aria-label="Contactanos por WhatsApp"
              role="listitem"
            >
              <MessageCircleMore className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>

          {/* Copyright & Info */}
          <div className="flex flex-col items-center gap-2 text-center text-xs text-muted-foreground sm:text-sm">
            <p>Envíos a toda Argentina 🇦🇷</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
