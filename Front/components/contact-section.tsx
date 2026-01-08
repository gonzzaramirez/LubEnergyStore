"use client";

import { motion } from "motion/react";
import {
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  MessageCircleMore,
} from "lucide-react";

export function ContactSection() {
  const contactInfo = [
    {
      icon: <Phone className="h-5 w-5 text-primary" />,
      label: "Teléfono",
      value: "+54 3775 40-0000",
      href: "tel:+543775400000",
    },
    {
      icon: <Mail className="h-5 w-5 text-primary" />,
      label: "Email",
      value: "contacto@lubenergy.com",
      href: "mailto:contacto@lubenergy.com",
    },
    {
      icon: <MapPin className="h-5 w-5 text-primary" />,
      label: "Dirección",
      value: "Vicente Mendieta 453, Monte Caseros, Corrientes",
      href: "https://maps.app.goo.gl/kX8yQ1Y5Z7D2",
    },
  ];

  const socialLinks = [
    {
      icon: <Instagram className="h-6 w-6" />,
      label: "Instagram",
      href: "#",
    },
    {
      icon: <Facebook className="h-6 w-6" />,
      label: "Facebook",
      href: "#",
    },
    {
      icon: <MessageCircleMore className="h-6 w-6" />,
      label: "WhatsApp",
      href: "#",
    },
  ];

  return (
    <section id="contacto" className="relative overflow-hidden py-8 sm:py-8 ">
      {/* Background Effects similar to Hero */}
      <div className="absolute inset-0 bg-linear-to-t from-primary/5 via-transparent to-transparent" />
      <div className="absolute -right-24 bottom-0 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[80px]" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(oklch(0.75 0.2 145) 1px, transparent 1px), linear-gradient(90deg, oklch(0.75 0.2 145) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <motion.h2
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

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Left: Google Maps */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3446.5970203901875!2d-57.630734725131845!3d-30.24856624077106!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95acd63c3f1cc57b%3A0x432d01f648c3ae0b!2sVicente%20Mendieta%20453%2C%20W3232%20Monte%20Caseros%2C%20Corrientes!5e0!3m2!1ses!2sar!4v1767891632097!5m2!1ses!2sar"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale contrast-125 transition-all hover:grayscale-0"
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
