"use client";

import { ArrowDown, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  animate,
} from "motion/react";
import Image from "next/image";
import { useEffect, useRef } from "react";

export function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const scrollToProducts = () => {
    document
      .getElementById("productos")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  // Valores para el drag del oso
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const springX = useSpring(dragX, { stiffness: 300, damping: 30 });
  const springY = useSpring(dragY, { stiffness: 300, damping: 30 });

  // Valor para la animación de flotación del oso
  const floatY = useMotionValue(0);

  // Combinar la animación de flotación con el drag del oso
  const y = useTransform(
    [floatY, springY],
    ([float, drag]: number[]) => float + drag
  );

  // Valores para el drag del rayo
  const dragX2 = useMotionValue(0);
  const dragY2 = useMotionValue(0);
  const springX2 = useSpring(dragX2, { stiffness: 300, damping: 30 });
  const springY2 = useSpring(dragY2, { stiffness: 300, damping: 30 });

  // Valor para la animación de flotación del rayo
  const floatY2 = useMotionValue(0);

  // Combinar la animación de flotación con el drag del rayo
  const y2 = useTransform(
    [floatY2, springY2],
    ([float, drag]: number[]) => float + drag
  );

  // Iniciar la animación de flotación del oso al montar
  useEffect(() => {
    const floatAnimation = animate(floatY, [0, -10, 0], {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    });

    return () => {
      floatAnimation.stop();
    };
  }, [floatY]);

  // Iniciar la animación de flotación del rayo al montar
  useEffect(() => {
    const floatAnimation2 = animate(floatY2, [0, -10, 0], {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    });

    return () => {
      floatAnimation2.stop();
    };
  }, [floatY2]);

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-[85vh] items-center justify-center overflow-hidden pt-16 sm:min-h-[90vh] sm:pt-20"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[80px] sm:h-[400px] sm:w-[400px] sm:blur-[100px] lg:h-[500px] lg:w-[500px] lg:blur-[120px]" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(oklch(0.75 0.2 145) 1px, transparent 1px), linear-gradient(90deg, oklch(0.75 0.2 145) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          className="absolute right-0 top-1/2 z-20 hidden -translate-y-1/2 translate-x-4 md:block md:translate-x-8 lg:translate-x-12 xl:translate-x-24"
          style={{
            x: springX,
            y: y,
            rotate: 12,
          }}
          drag
          dragConstraints={heroRef}
          dragElastic={0.1}
          dragMomentum={false}
          onDrag={(event, info) => {
            dragX.set(info.offset.x);
            dragY.set(info.offset.y);
          }}
          onDragEnd={() => {
            dragX.set(0);
            dragY.set(0);
          }}
        >
          <Image
            src="/oso.png"
            alt="oso logo"
            width={250}
            height={280}
            className="h-auto w-[120px] cursor-grab active:cursor-grabbing opacity-80 sm:w-[150px] md:w-[180px] lg:w-[220px] xl:w-[250px]"
            draggable={false}
          />
        </motion.div>
        {/* Badge */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 sm:mb-6 sm:px-4 sm:py-2">
          <Flame className="h-3 w-3 text-primary sm:h-4 sm:w-4" />
          <span className="text-xs font-medium text-primary sm:text-sm">
            Envíos a todo el país
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="mb-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:mb-6 sm:text-5xl md:text-6xl lg:text-7xl">
          Potencia tu{" "}
          <span className="text-primary text-glow">rendimiento</span>
          <br />
          al máximo nivel
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mb-6 max-w-2xl text-pretty text-base text-muted-foreground sm:mb-8 sm:text-lg md:text-xl">
          Los mejores suplementos deportivos para alcanzar tus objetivos.
          Proteínas, creatinas, pre-entrenos y más.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Button
            size="lg"
            onClick={scrollToProducts}
            className="green-glow glow-pulse w-full px-6 text-sm font-semibold cursor-pointer sm:w-auto sm:px-8 sm:text-base"
          >
            Ver productos
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={scrollToProducts}
            className="w-full border-border px-6 text-sm bg-transparent cursor-pointer sm:w-auto sm:px-8 sm:text-base"
          >
            Contacto directo
          </Button>
        </div>

        {/* Stats */}
        <div className="relative mt-12 grid grid-cols-3 gap-4 sm:mt-16 sm:gap-6 lg:gap-8">
          {/* Rayo Image - Level with stats with floating animation and drag */}
          <motion.div
            className="absolute left-0 top-1/2 z-20 hidden -translate-y-1/2 -translate-x-4 md:block md:-translate-x-8 lg:-translate-x-12 xl:-translate-x-24"
            style={{
              x: springX2,
              y: y2,
            }}
            drag
            dragConstraints={heroRef}
            dragElastic={0.1}
            dragMomentum={false}
            onDrag={(event, info) => {
              dragX2.set(info.offset.x);
              dragY2.set(info.offset.y);
            }}
            onDragEnd={() => {
              dragX2.set(0);
              dragY2.set(0);
            }}
          >
            <Image
              src="/rayo.png"
              alt="rayo logo"
              width={180}
              height={280}
              className="h-auto w-[80px] cursor-grab active:cursor-grabbing opacity-80 sm:w-[100px] md:w-[130px] lg:w-[160px] xl:w-[180px]"
              draggable={false}
            />
          </motion.div>
          {[
            { value: "+100", label: "Ventas" },
            { value: "+15", label: "Productos" },
            { value: "24hs", label: "Atencion" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-xl font-bold text-primary sm:text-2xl md:text-3xl">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground sm:text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={scrollToProducts}
          className="mt-8 inline-flex animate-bounce items-center justify-center sm:mt-12"
          aria-label="Scroll to products"
        >
          <ArrowDown className="h-5 w-5 text-muted-foreground sm:h-6 sm:w-6" />
        </button>
      </div>
    </section>
  );
}
