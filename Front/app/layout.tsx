import type React from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CartProvider } from "@/context/cart-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://lubenergy.com.ar";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "LUB ENERGY | Suplementos Deportivos",
    template: "%s | LUB ENERGY",
  },
  description:
    "Tienda online de suplementos deportivos en Argentina. Proteínas, creatinas, pre-entrenos, aminoácidos y vitaminas. Envíos a todo el país. Las mejores marcas al mejor precio.",
  keywords: [
    "suplementos deportivos Argentina",
    "proteínas Argentina",
    "creatina Argentina",
    "pre-entreno",
    "whey protein",
    "aminoácidos BCAA",
    "vitaminas deportivas",
    "fitness Argentina",
    "gimnasio suplementos",
    "tienda suplementos online",
    "envíos Argentina",
    "suplementos Corrientes",
    "nutrición deportiva",
    "masa muscular",
    "rendimiento deportivo",
  ],
  authors: [{ name: "LUB ENERGY" }],
  creator: "LUB ENERGY",
  publisher: "LUB ENERGY",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: BASE_URL,
    siteName: "LUB ENERGY",
    title: "LUB ENERGY | Suplementos Deportivos en Argentina",
    description:
      "Tienda online de suplementos deportivos en Argentina. Proteínas, creatinas, pre-entrenos y más. Envíos a todo el país.",
    images: [
      {
        url: "/LUB ENERGY_NG_.png",
        width: 1200,
        height: 630,
        alt: "LUB ENERGY - Suplementos Deportivos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LUB ENERGY | Suplementos Deportivos en Argentina",
    description:
      "Tienda online de suplementos deportivos en Argentina. Proteínas, creatinas, pre-entrenos y más.",
    images: ["/LUB ENERGY_NG_.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
  category: "ecommerce",
};

export const viewport: Viewport = {
  themeColor: "#00ff7f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// JSON-LD Schema para LocalBusiness + WebSite
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: "LUB ENERGY",
      description: "Tienda online de suplementos deportivos en Argentina",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${BASE_URL}/productos?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
      inLanguage: "es-AR",
    },
    {
      "@type": "LocalBusiness",
      "@id": `${BASE_URL}/#localbusiness`,
      name: "LUB ENERGY",
      description:
        "Tienda de suplementos deportivos. Proteínas, creatinas, pre-entrenos y más.",
      url: BASE_URL,
      telephone: "+54 379 505-6878",
      email: "Lubenergy1324@gmail.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Vicente Mendieta 453",
        addressLocality: "Monte Caseros",
        addressRegion: "Corrientes",
        postalCode: "W3220",
        addressCountry: "AR",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: -30.248566,
        longitude: -57.630734,
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "09:00",
        closes: "21:00",
      },
      sameAs: [
        "https://www.instagram.com/lub_energy/",
        "https://wa.me/543795056878",
      ],
      priceRange: "$$",
      image: `${BASE_URL}/LUB ENERGY_NG_.png`,
      areaServed: {
        "@type": "Country",
        name: "Argentina",
      },
    },
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "LUB ENERGY",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/LUB ENERGY_NG_.png`,
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+54 379 505-6878",
        contactType: "customer service",
        areaServed: "AR",
        availableLanguage: "Spanish",
      },
      sameAs: ["https://www.instagram.com/lub_energy/"],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/rayo2.png" type="image/png" />
        <link rel="apple-touch-icon" href="/rayo2.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="geo.region" content="AR" />
        <meta name="geo.placename" content="Monte Caseros, Corrientes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {/* Skip to main content - Accesibilidad */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none"
        >
          Saltar al contenido principal
        </a>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
