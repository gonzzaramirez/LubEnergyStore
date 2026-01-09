import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { ProductGrid } from "../productos/components/product-grid";
import { ContactSection } from "@/components/contact-section";
import { CartSidebar } from "@/components/cart-sidebar";

import { HashScrollHandler } from "@/components/hash-scroll-handler";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main id="main-content" className="min-h-screen bg-background">
      <HashScrollHandler />
      <Header />
      <HeroSection />
      <ProductGrid featuredOnly={true} showFilters={false} />
      <div className="flex justify-center pb-12 sm:pb-16 md:pb-20">
        <Link href="/productos">
          <Button
            size="lg"
            className="rounded-full px-10 py-6 text-base font-bold green-glow transition-all hover:scale-105 cursor-pointer"
            aria-label="Ver catálogo completo de productos"
          >
            Ver Catálogo Completo
          </Button>
        </Link>
      </div>
      <ContactSection />
      <CartSidebar />
    </main>
  );
}
