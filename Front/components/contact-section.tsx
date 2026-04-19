"use client";

import { motion } from "motion/react";
import {
  Phone,
  Mail,
  MapPin,
  Instagram,
  MessageCircleMore,
} from "lucide-react";

export function ContactSection() {
  const contactInfo = [
    {
      icon: <Phone className="h-5 w-5 text-primary" aria-hidden="true" />,
      label: "Teléfono",
      value: "+54 379 505-6878",
      href: "tel:+543795056878",
    },
    {
      icon: <Mail className="h-5 w-5 text-primary" aria-hidden="true" />,
      label: "Email",
      value: "Lubenergy1324@gmail.com",
      href: "mailto:Lubenergy1324@gmail.com",
    },
    {
      icon: <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />,
      label: "Dirección",
      value: "Junín 2183, Corrientes capital",
      href: "https://maps.app.goo.gl/t9xvJ8Hc1tGEebCu7",
    },
  ];

  const socialLinks = [
    {
      icon: <Instagram className="h-6 w-6" aria-hidden="true" />,
      label: "Síguenos en Instagram",
      href: "https://www.instagram.com/lub_energy/",
      target: "_blank",
    },
    {
      icon: <MessageCircleMore className="h-6 w-6" aria-hidden="true" />,
      label: "Contactanos por WhatsApp",
      href: "https://wa.me/543795056878",
      target: "_blank",
    },
  ];

  return (
    <section 
      id="contacto" 
      className="relative overflow-hidden py-12 sm:py-16"
      aria-labelledby="contact-heading"
    >
      {/* Background Effects similar to Hero */}
      <div className="absolute inset-0 bg-linear-to-t from-primary/5 via-transparent to-transparent" aria-hidden="true" />
      <div className="absolute -right-24 bottom-0 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[80px]" aria-hidden="true" />

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
        <div className="text-center mb-12 sm:mb-16">
          <motion.h2
            id="contact-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Contacto
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="mt-4 text-muted-foreground"
          >
            Estamos aquí para ayudarte. Encuéntranos o escríbenos.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left: Google Maps */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg aspect-square lg:aspect-auto"
          >
            <iframe
              src="https://maps.google.com/maps?q=Junín+2183,+Corrientes,+Argentina&t=&z=17&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "350px" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale contrast-125 transition-all hover:grayscale-0 h-full"
              title="Ubicación de LUB ENERGY en Junín 2183, Corrientes"
            />
          </motion.div>

          {/* Right: Contact Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="flex flex-col justify-center space-y-8"
          >
            <div className="space-y-6">
              {contactInfo.map((info, idx) => (
                <a
                  key={idx}
                  href={info.href}
                  target={info.label === "Dirección" ? "_blank" : undefined}
                  rel={
                    info.label === "Dirección"
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="flex items-start gap-4 group"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 transition-colors group-hover:bg-primary/20">
                    {info.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {info.label}
                    </p>
                    <p className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {info.value}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            <div className="pt-6 border-t border-border">
              <p className="text-sm font-medium text-muted-foreground mb-4">
                Síguenos en nuestras redes
              </p>
              <div className="flex gap-4">
                {socialLinks.map((social, idx) => (
                  <a
                    key={idx}
                    href={social.href}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-all hover:border-primary hover:text-primary hover:shadow-[0_0_15px_rgba(var(--primary),0.2)]"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
