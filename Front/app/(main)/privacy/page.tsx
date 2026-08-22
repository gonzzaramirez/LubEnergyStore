import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import {
  PRIVACY_INTRO,
  PRIVACY_SECTIONS,
  PRIVACY_TITLE,
  SITE_NAME,
} from "@/lib/site-content";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lubenergy.com.ar";

export const metadata: Metadata = {
  title: "Política de Privacidad | LUB ENERGY",
  description:
    "Política de privacidad de LUB ENERGY: qué datos personales recogemos en lubenergy.com.ar, para qué los usamos, con quién los compartimos y cómo ejercer tus derechos.",
  alternates: {
    canonical: `${BASE_URL}/privacy`,
  },
};

export default function PrivacyPage() {
  return (
    <main id="main-content" className="min-h-screen bg-background">
      <Header />
      <article className="mx-auto max-w-3xl px-4 pb-20 pt-32 sm:px-6">
        <p className="text-sm font-bold tracking-widest text-primary">
          {SITE_NAME}
        </p>
        <h1 className="mt-2 text-balance text-3xl font-bold text-foreground sm:text-4xl">
          {PRIVACY_TITLE}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          {PRIVACY_INTRO}
        </p>

        {PRIVACY_SECTIONS.map((section) => (
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

        <p className="mt-12 text-sm text-muted-foreground">
          ¿Dudas sobre esta política? Escribinos desde la{" "}
          <Link href="/contact" className="text-primary hover:underline">
            página de contacto
          </Link>
          .
        </p>
      </article>
    </main>
  );
}
