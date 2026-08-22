import Link from "next/link";

const recoveryLinks = [
  { href: "/", label: "Inicio", internal: true },
  { href: "/productos", label: "Catálogo de productos", internal: true },
  { href: "/about", label: "Quiénes somos", internal: true },
  { href: "/contact", label: "Contacto", internal: true },
  { href: "/sitemap.xml", label: "Mapa del sitio (sitemap.xml)", internal: false },
  { href: "/llms.txt", label: "Índice para agentes (llms.txt)", internal: false },
  { href: "/docs", label: "Recursos para desarrolladores (/docs)", internal: true },
];

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16 text-center">
      <p className="text-sm font-bold tracking-widest text-primary">ERROR 404</p>
      <h1 className="mt-3 text-balance text-3xl font-bold text-foreground sm:text-4xl">
        Esta página no existe
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        La ruta que buscás no está disponible o cambió de dirección. Seguí
        desde cualquiera de estos enlaces:
      </p>
      <nav
        className="mt-8 flex flex-col gap-3 text-sm sm:text-base"
        aria-label="Enlaces sugeridos"
      >
        {recoveryLinks.map((link) =>
          link.internal ? (
            <Link
              key={link.href}
              href={link.href}
              className="font-medium text-primary hover:underline"
            >
              {link.label}
            </Link>
          ) : (
            <a
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground hover:underline"
            >
              {link.label}
            </a>
          ),
        )}
      </nav>
      <p className="mt-10 text-xs text-muted-foreground">
        Tip para agentes: todas las páginas sirven Markdown con el header{" "}
        <code>Accept: text/markdown</code>.
      </p>
    </main>
  );
}
