import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { ProductGrid } from "@/components/product-grid";
import { CartSidebar } from "@/components/cart-sidebar";
import { Footer } from "@/components/footer";
import { HashScrollHandler } from "@/components/hash-scroll-handler";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <HashScrollHandler />
      <Header />
      <HeroSection />
      <ProductGrid />
      <CartSidebar />
    </main>
  );
}
