"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function HashScrollHandler() {
  const pathname = usePathname();

  useEffect(() => {
    // Solo manejar scroll en la página principal
    if (pathname !== "/") return;

    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.substring(1); // Remover el #
        
        // Función recursiva para intentar hacer scroll hasta que el elemento esté disponible
        const attemptScroll = (attempts = 0) => {
          const element = document.getElementById(id);
          if (element) {
            const headerOffset = 80; // Altura del header
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth",
            });
          } else if (attempts < 10) {
            // Intentar hasta 10 veces (1 segundo máximo)
            setTimeout(() => attemptScroll(attempts + 1), 100);
          }
        };

        // Esperar un poco para que el DOM se renderice
        setTimeout(() => attemptScroll(), 100);
      }
    };

    // Ejecutar al cargar
    handleHashScroll();

    // También escuchar cambios en el hash
    window.addEventListener("hashchange", handleHashScroll);

    return () => {
      window.removeEventListener("hashchange", handleHashScroll);
    };
  }, [pathname]);

  return null;
}

