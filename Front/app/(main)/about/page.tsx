import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import {
  ABOUT_INTRO,
  ABOUT_SECTIONS,
  ABOUT_TITLE,
  SITE_NAME,
} from "@/lib/site-content";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lubenergy.com.ar";

export const metadata: Metadata = {
  title: "Quiénes Somos | LUB ENERGY",
  description:
    "Conocé LUB ENERGY: tienda de suplementos deportivos con local físico en Junín 2183, Corrientes capital, y envíos a toda Argentina. Productos originales de marcas reconocidas.",
  alternates: {
    canonical: `${BASE_URL}/about`,
  },
};

export default function AboutPage() {
  return (
    <main id="main-content" className="min-h-screen bg-background">
      <Header />
      <article className="mx-auto max-w-3xl px-4 pb-20 pt-32 sm:px-6">
        <p className="text-sm font-bold tracking-widest text-primary">
          {SITE_NAME}
        </p>
        <h1 className="mt-2 text-balance text-3xl font-bold text-foreground sm:text-4xl">
          {ABOUT_TITLE}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          {ABOUT_INTRO}
        </p>

        {ABOUT_SECTIONS.map((section) => (
          <section key={section.heading} className="mt-10">
            <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="mt-3 leading-relaxed text-muted-foreground"
              >
                {paragraph}
              </p>
            ))}
          </section>
        ))}

        <div className="mt-12 rounded-2xl border border-border/50 bg-card/50 p-6">
          <h2 className="text-lg font-semibold text-foreground">
            ¿Listo para empezar?
          </h2>
          <p className="mt-2 text-muted-foreground">
            Mirá el catálogo completo o escribinos por WhatsApp para que te
            asesoremos.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/productos"
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:scale-105"
            >
              Ver catálogo
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary"
            >
              Contacto
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
