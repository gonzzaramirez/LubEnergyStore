import type React from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CartProvider } from "@/context/cart-context";
import "./globals.css";
import Script from "next/script";

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

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lubenergy.com.ar";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "LUB ENERGY | Suplementos Deportivos en Corrientes",
    template: "%s | LUB ENERGY",
  },
  description:
    "Tienda de suplementos deportivos en Corrientes capital, Argentina. Local físico en Junín 2183. Proteínas, creatinas, pre-entrenos, aminoácidos y vitaminas. Envíos a todo el país.",
  keywords: [
    "suplementos deportivos corrientes",
    "tienda suplementos corrientes",
    "proteína whey corrientes",
    "creatina corrientes",
    "pre entreno corrientes",
    "suplementos gym corrientes capital",
    "nutrición deportiva corrientes",
    "donde comprar suplementos corrientes",
    "LUB ENERGY corrientes",
  ],
  authors: [{ name: "LUB ENERGY" }],
  creator: "LUB ENERGY",
  publisher: "LUB ENERGY",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      {
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: BASE_URL,
    siteName: "LUB ENERGY",
    title: "LUB ENERGY | Suplementos Deportivos en Corrientes Capital",
    description:
      "Tienda de suplementos deportivos en Corrientes capital. Local físico en Junín 2183. Proteínas, creatinas, pre-entrenos y más. Envíos a toda Argentina.",
    images: [
      {
        url: "/lub-energy-ng.png",
        width: 1200,
        height: 630,
        alt: "LUB ENERGY - Suplementos Deportivos en Corrientes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LUB ENERGY | Suplementos Deportivos en Corrientes",
    description:
      "Tienda de suplementos deportivos en Corrientes capital. Local físico en Junín 2183. Proteínas, creatinas, pre-entrenos y más.",
    images: ["/lub-energy-ng.png"],
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
  category: "ecommerce",
};

export const viewport: Viewport = {
  themeColor: "#00ff7f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// Site-wide JSON-LD schema: WebSite + LocalBusiness + Organization.
// FAQPage lives on the home page, next to the visible FAQ section.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: "LUB ENERGY",
      description:
        "Tienda de suplementos deportivos en Corrientes capital, Argentina. Local físico en Junín 2183.",
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
        "LUB ENERGY es una tienda de suplementos deportivos ubicada en Junín 2183, Corrientes capital, Argentina. Vende proteínas, creatinas, pre-entrenos, aminoácidos y vitaminas de las mejores marcas. Realiza envíos a todo el país.",
      url: BASE_URL,
      telephone: "+54 379 505-6878",
      email: "Lubenergy1324@gmail.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Junín 2183",
        addressLocality: "Corrientes",
        addressRegion: "Corrientes",
        postalCode: "W3400",
        addressCountry: "AR",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: -27.474,
        longitude: -58.832,
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
        "https://maps.app.goo.gl/t9xvJ8Hc1tGEebCu7",
      ],
      priceRange: "$$",
      image: `${BASE_URL}/lub-energy-ng.png`,
      areaServed: [
        {
          "@type": "City",
          name: "Corrientes",
        },
        {
          "@type": "State",
          name: "Corrientes",
        },
        {
          "@type": "Country",
          name: "Argentina",
        },
      ],
      hasMap: "https://maps.app.goo.gl/t9xvJ8Hc1tGEebCu7",
    },
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "LUB ENERGY",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/lub-energy-ng.png`,
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+54 379 505-6878",
        contactType: "customer service",
        areaServed: "AR",
        availableLanguage: "Spanish",
      },
      sameAs: [
        "https://www.instagram.com/lub_energy/",
        "https://maps.app.goo.gl/t9xvJ8Hc1tGEebCu7",
      ],
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
        <link rel="manifest" href="/site.webmanifest" />
        {/* Favicons are emitted by metadata.icons; manual duplicates removed. */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="geo.region" content="AR-W" />
        <meta name="geo.placename" content="Corrientes, Corrientes" />
        <meta name="geo.position" content="-27.474;-58.832" />
        <meta name="ICBM" content="-27.474, -58.832" />
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

        {/* --- MICROSOFT CLARITY SCRIPT --- */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "vprwcbv9d4");
          `}
        </Script>
      </body>
    </html>
  );
}
