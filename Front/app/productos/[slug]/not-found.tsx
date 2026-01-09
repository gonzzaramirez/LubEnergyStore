import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PackageX } from "lucide-react";

export default function ProductNotFound() {
  return (
    <main id="main-content" className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto w-full max-w-7xl px-4 pt-32 pb-20 text-center sm:px-6">
        <div className="flex flex-col items-center gap-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
            <PackageX className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
            Producto no encontrado
          </h1>
          <p className="max-w-md text-muted-foreground">
            Lo sentimos, el producto que buscas no existe o ha sido eliminado.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/productos">
              <Button size="lg" className="green-glow">
                Ver todos los productos
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline">
                Volver al inicio
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
