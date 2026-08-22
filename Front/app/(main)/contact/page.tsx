import type { Metadata } from "next";
import { Header } from "@/components/header";
import {
  CONTACT_CHANNELS,
  CONTACT_INTRO,
  CONTACT_SECTIONS,
  CONTACT_TITLE,
  SITE_NAME,
} from "@/lib/site-content";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lubenergy.com.ar";

export const metadata: Metadata = {
  title: "Contacto | LUB ENERGY",
  description:
    "Contactá a LUB ENERGY: WhatsApp +54 379 505-6878, email Lubenergy1324@gmail.com o visitanos en Junín 2183, Corrientes capital. Atención de lunes a sábado de 9:00 a 21:00.",
  alternates: {
    canonical: `${BASE_URL}/contact`,
  },
};

export default function ContactPage() {
  return (
    <main id="main-content" className="min-h-screen bg-background">
      <Header />
      <article className="mx-auto max-w-3xl px-4 pb-20 pt-32 sm:px-6">
        <p className="text-sm font-bold tracking-widest text-primary">
          {SITE_NAME}
        </p>
        <h1 className="mt-2 text-balance text-3xl font-bold text-foreground sm:text-4xl">
          {CONTACT_TITLE}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          {CONTACT_INTRO}
        </p>

        <section className="mt-10" aria-label="Canales de contacto">
          <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
            Canales de contacto
          </h2>
          <ul className="mt-4 divide-y divide-border/50 rounded-2xl border border-border/50 bg-card/50">
            {CONTACT_CHANNELS.map((channel) => (
              <li key={channel.label}>
                <a
                  href={channel.href}
                  target={channel.external ? "_blank" : undefined}
                  rel={channel.external ? "noopener noreferrer" : undefined}
                  className="flex items-baseline justify-between gap-4 p-5 transition-colors hover:bg-card"
                >
                  <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    {channel.label}
                  </span>
                  <span className="text-right font-semibold text-foreground group-hover:text-primary">
                    {channel.value}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {CONTACT_SECTIONS.map((section) => (
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
      </article>
    </main>
  );
}
