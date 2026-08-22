"use client";

import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "¿Dónde está ubicado LUB ENERGY?",
    answer:
      "LUB ENERGY está ubicado en Junín 2183, Corrientes capital, provincia de Corrientes, Argentina. Podés visitarnos de lunes a sábado de 9:00 a 21:00 hs. También podés encontrarnos en Google Maps.",
  },
  {
    question: "¿Venden suplementos deportivos en Corrientes capital?",
    answer:
      "Sí. LUB ENERGY es la tienda de suplementos deportivos con local físico propio en Corrientes capital. Vendemos proteínas whey, creatina monohidrato, pre-entrenos, aminoácidos BCAA, quemadores de grasa, vitaminas y más de las mejores marcas.",
  },
  {
    question: "¿Hacen envíos a toda Argentina?",
    answer:
      "Sí, LUB ENERGY realiza envíos a todo el país. Podés comprar online desde cualquier provincia y recibir tu pedido en la puerta de tu casa. Los envíos se realizan a través de correo y servicios de mensajería.",
  },
  {
    question: "¿Cuáles son los horarios de atención del local?",
    answer:
      "El local de LUB ENERGY en Corrientes atiende de lunes a sábado de 9:00 a 21:00 hs. También podés contactarnos en cualquier momento por WhatsApp al +54 379 505-6878.",
  },
  {
    question: "¿Qué suplementos puedo comprar en LUB ENERGY Corrientes?",
    answer:
      "En LUB ENERGY Corrientes encontrás proteínas whey, creatina, pre-entrenos, aminoácidos BCAA, glutamina, quemadores de grasa, vitaminas, colágeno y suplementos para rendimiento deportivo. Todos los productos son originales y de marcas reconocidas.",
  },
  {
    question: "¿Los productos son originales y de calidad?",
    answer:
      "Sí. En LUB ENERGY solo trabajamos con marcas reconocidas y productos originales. Cada suplemento que vendemos pasa por nuestra selección de calidad para garantizarte el mejor resultado en tu entrenamiento.",
  },
  {
    question: "¿Cómo puedo hacer un pedido?",
    answer:
      "Podés hacer tu pedido directamente desde nuestra tienda online en lubenergy.com.ar, visitarnos en nuestro local en Junín 2183, Corrientes capital, o contactarnos por WhatsApp al +54 379 505-6878 para asesoramiento personalizado.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="preguntas-frecuentes"
      className="relative overflow-hidden py-16 sm:py-20 md:py-24"
      aria-labelledby="faq-heading"
    >
      {/* Background Effects */}
      <div
        className="absolute inset-0 bg-linear-to-b from-primary/3 via-transparent to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute -right-24 top-1/3 h-[350px] w-[350px] rounded-full bg-primary/5 blur-[120px]"
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

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center sm:mb-16">
          <motion.h2
            id="faq-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl"
          >
            Preguntas{" "}
            <span className="text-primary text-glow">frecuentes</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg"
          >
            Todo lo que necesitás saber sobre nuestra tienda de suplementos en
            Corrientes.
          </motion.p>
        </div>

        {/* FAQ List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="space-y-3"
        >
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={cn(
                "rounded-2xl border border-border/50 bg-card/50 transition-all duration-200",
                openIndex === index &&
                  "border-primary/30 bg-card/80 shadow-[0_0_20px_rgba(var(--primary-rgb),0.05)]",
              )}
            >
              <button
                onClick={() => toggle(index)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6"
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="text-sm font-semibold text-foreground sm:text-base">
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
                    openIndex === index && "rotate-180 text-primary",
                  )}
                  aria-hidden="true"
                />
              </button>

              {/* La respuesta vive siempre en el HTML (legible sin JS);
                  la animación sólo la colapsa/expande visualmente. */}
              <motion.div
                id={`faq-answer-${index}`}
                initial={false}
                animate={{
                  height: openIndex === index ? "auto" : 0,
                  opacity: openIndex === index ? 1 : 0,
                }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground sm:px-6 sm:pb-6 sm:text-base">
                  {faq.answer}
                </p>
              </motion.div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
