import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import {
  DOCS_INTRO,
  DOCS_RESOURCES,
  DOCS_TITLE,
  SITE_NAME,
} from "@/lib/site-content";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lubenergy.com.ar";

export const metadata: Metadata = {
  title: "Recursos para Agentes y Desarrolladores | LUB ENERGY",
  description:
    "Índice de recursos legibles por máquina de lubenergy.com.ar: llms.txt, sitemap.xml, robots.txt, variante Markdown vía Accept: text/markdown y patrones de URL públicos.",
  alternates: {
    canonical: `${BASE_URL}/docs`,
  },
};

export default function DocsPage() {
  return (
    <main id="main-content" className="min-h-screen bg-background">
      <Header />
      <article className="mx-auto max-w-3xl px-4 pb-20 pt-32 sm:px-6">
        <p className="text-sm font-bold tracking-widest text-primary">
          {SITE_NAME}
        </p>
        <h1 className="mt-2 text-balance text-3xl font-bold text-foreground sm:text-4xl">
          {DOCS_TITLE}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          {DOCS_INTRO}
        </p>

        <section className="mt-10" aria-label="Recursos disponibles">
          <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
            Recursos
          </h2>
          <ul className="mt-4 space-y-3">
            {DOCS_RESOURCES.map((resource) => {
              const href = resource.url.startsWith("/")
                ? `${BASE_URL}${resource.url}`
                : resource.url;
              return (
                <li
                  key={resource.name}
                  className="rounded-2xl border border-border/50 bg-card/50 p-5"
                >
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      href.startsWith("http") ? "noopener noreferrer" : undefined
                    }
                    className="font-mono text-sm font-semibold text-primary hover:underline"
                  >
                    {resource.url}
                  </a>
                  <p className="mt-2 leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {resource.name}.
                    </span>{" "}
                    {resource.description}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
            Pedir la versión en Markdown
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Todas las páginas públicas responden con{" "}
            <code>Content-Type: text/markdown; charset=utf-8</code> cuando el
            pedido incluye el header{" "}
            <code>Accept: text/markdown</code>. Las respuestas declaran{" "}
            <code>Vary: Accept, Accept-Encoding</code>. Ejemplo:
          </p>
          <pre className="mt-4 overflow-x-auto rounded-xl border border-border bg-secondary/50 p-4 text-xs sm:text-sm">
            <code>{`curl -sH "Accept: text/markdown" ${BASE_URL}/productos`}</code>
          </pre>
        </section>

        <p className="mt-12 text-sm text-muted-foreground">
          ¿Necesitás algo más específico? Escribinos desde la{" "}
          <Link href="/contact" className="text-primary hover:underline">
            página de contacto
          </Link>
          .
        </p>
      </article>
    </main>
  );
}
