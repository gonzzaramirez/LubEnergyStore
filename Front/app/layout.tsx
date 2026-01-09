import type React from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CartProvider } from "@/context/cart-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LUB ENERGY | Suplementos Deportivos",
  description:
    "Los mejores suplementos deportivos para potenciar tu rendimiento. Proteínas, creatinas, pre-entrenos y más. Envíos a todo el país.",
  keywords: [
    "suplementos",
    "proteínas",
    "creatina",
    "pre-entreno",
    "fitness",
    "gimnasio",
  ],
};

export const viewport: Viewport = {
  themeColor: "#00ff7f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
