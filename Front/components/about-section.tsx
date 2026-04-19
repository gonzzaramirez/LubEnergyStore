"use client";

import { motion } from "motion/react";
import { ShieldCheck, Store, Truck, Heart } from "lucide-react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const trustBadges = [
  {
    icon: <Store className="h-5 w-5 text-primary" aria-hidden="true" />,
    title: "Negocio establecido",
    description: "Local físico en Junín 2183, Corrientes capital",
  },
  {
    icon: <Truck className="h-5 w-5 text-primary" aria-hidden="true" />,
    title: "Envíos a todo el país",
    description: "Entregamos en tu puerta, a cualquier rincón de Argentina",
  },
  {
    icon: <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />,
    title: "Productos originales",
    description: "Solo trabajamos con marcas reconocidas y de calidad",
  },
  {
    icon: <Heart className="h-5 w-5 text-primary" aria-hidden="true" />,
    title: "Atención personalizada",
    description: "Te asesoramos para que elijas el suplemento ideal",
  },
];

// Imágenes del carrusel — reemplazá las rutas por fotos reales del negocio
const carouselImages = [
  {
    src: "/about/1.jpeg",
    alt: "Frente del local LUB ENERGY en Junín 2183, Corrientes capital",
  },
  {
    src: "/about/2.jpeg",
    alt: "Interior del local LUB ENERGY con productos exhibidos en Corrientes",
  },
  {
    src: "/about/3.jpeg",
    alt: "Variedad de suplementos deportivos disponibles en LUB ENERGY Corrientes",
  },
];

export function AboutSection() {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!api) return;
    setSelectedIndex(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api, onSelect]);

  const scrollTo = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api],
  );

  return (
    <section
      id="nosotros"
      className="relative overflow-hidden py-16 sm:py-20 md:py-24"
      aria-labelledby="about-heading"
    >
      {/* Background Effects — coherente con el resto del sitio */}
      <div
        className="absolute inset-0 bg-linear-to-b from-transparent via-primary/3 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute -left-24 top-1/2 h-[300px] w-[300px] -translate-y-1/2 rounded-full bg-primary/5 blur-[100px]"
        aria-hidden="true"
      />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(oklch(0.75 0.2 145) 1px, transparent 1px), linear-gradient(90deg, oklch(0.75 0.2 145) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Encabezado de sección */}
        <div className="mb-12 text-center sm:mb-16">
          <motion.h2
            id="about-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl"
          >
            Quiénes <span className="text-primary text-glow">somos</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="mx-auto mt-4 max-w-3xl text-pretty text-base text-muted-foreground sm:text-lg"
          >
            Somos <strong className="text-foreground">LUB ENERGY</strong>, una
            tienda de suplementos deportivos ubicada en{" "}
            <strong className="text-foreground">
              Corrientes capital
            </strong>
            . Nacimos con una misión clara: acercar los mejores productos de
            nutrición deportiva a quienes buscan <em>superarse día a día</em>.
            Creemos que el rendimiento se construye con constancia, buena
            alimentación y los suplementos adecuados. Por eso seleccionamos cada
            producto con el mismo compromiso que ponemos al atender a cada
            cliente.
          </motion.p>
        </div>

        {/* Layout: Carrusel + Trust Badges */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Carrusel de fotos */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Carousel
              setApi={setApi}
              opts={{
                loop: true,
                align: "center",
              }}
              plugins={[
                Autoplay({
                  delay: 3500,
                  stopOnInteraction: false,
                  stopOnMouseEnter: true,
                }),
              ]}
              className="w-full"
            >
              <CarouselContent>
                {carouselImages.map((img, idx) => (
                  <CarouselItem key={idx}>
                    <div className="relative aspect-4/3 overflow-hidden rounded-3xl border border-border/50 bg-card shadow-lg">
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      {/* Overlay sutil en la parte inferior */}
                      <div className="absolute inset-0 bg-linear-to-t from-background/60 via-transparent to-transparent" />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {/* Indicadores de slide (dots) */}
              <div
                className="mt-4 flex justify-center gap-2"
                role="tablist"
                aria-label="Indicadores del carrusel de fotos"
              >
                {carouselImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => scrollTo(idx)}
                    role="tab"
                    aria-selected={selectedIndex === idx}
                    aria-label={`Ver imagen ${idx + 1} de ${carouselImages.length}`}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300 cursor-pointer",
                      selectedIndex === idx
                        ? "w-6 bg-primary"
                        : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50",
                    )}
                  />
                ))}
              </div>
            </Carousel>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="space-y-5"
          >
            <h3 className="mb-6 text-xl font-semibold text-foreground sm:text-2xl">
              ¿Por qué elegir <span className="text-primary">LUB ENERGY</span>?
            </h3>

            {trustBadges.map((badge, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * idx + 0.3 }}
                viewport={{ once: true }}
                className="group flex items-start gap-4 rounded-2xl border border-border/50 bg-card/50 p-4 transition-all hover:border-primary/30 hover:bg-card/80 sm:p-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 transition-colors group-hover:bg-primary/20">
                  {badge.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground sm:text-base">
                    {badge.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                    {badge.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
