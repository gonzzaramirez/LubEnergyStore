import { Instagram, Facebook, MessageCircleMore } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-5 md:py-3">
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          {/* Logo Text */}
          <div className="flex items-center">
            <span className="text-xs font-bold text-foreground sm:text-sm md:text-base">
              LUB <span className="text-primary">ENERGY</span>
            </span>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
            <a
              href="#"
              className="text-muted-foreground transition-colors hover:text-primary"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
            </a>
            <a
              href="#"
              className="text-muted-foreground transition-colors hover:text-primary"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
            </a>
            <a
              href="#"
              className="text-muted-foreground transition-colors hover:text-primary"
              aria-label="WhatsApp"
            >
              <MessageCircleMore className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
