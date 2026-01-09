import { Header } from "@/components/header";
import { ProductGrid } from "./components/product-grid";
import { CartSidebar } from "@/components/cart-sidebar";
import { Footer } from "@/components/footer";

export default function ProductosPage() {
  return (
    <main className="">
      <Header />
      <div className="">
        <ProductGrid featuredOnly={false} showFilters={true} showTitle={true} />
      </div>
      <CartSidebar />
      <Footer />
    </main>
  );
}
