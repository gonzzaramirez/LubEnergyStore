"use client";

import { useEffect, useState } from "react";

function formatDateAR(date: Date): string {
  return date.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

export function StockUpdateBar() {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    setFormattedDate(formatDateAR(new Date()));
    // Update at midnight ART if user keeps tab open:
    // compute ms until next midnight in America/Argentina/Buenos_Aires is non-trivial
    // in local TZ, so just check every hour.
    const interval = setInterval(() => {
      setFormattedDate(formatDateAR(new Date()));
    }, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="flex h-7 w-full items-center justify-center border-t border-amber-200 bg-amber-100 px-4 sm:h-8"
    >
      <p className="text-center text-xs font-bold leading-none text-amber-950 sm:text-sm">
        Precios y stock actualizados
        {formattedDate ? (
          <>
            <span aria-hidden="true">{" \u2022 "}</span>
            <span className="font-bold">{formattedDate}</span>
          </>
        ) : (
          // Reserve space to avoid layout shift; hidden from AT until date loads
          <span aria-hidden="true">{" \u2022 "}...</span>
        )}
      </p>
    </div>
  );
}

// Lightweight spacer height reference — keep in sync with StockUpdateBar's h-7 sm:h-8
export function StockUpdateBarSpacer() {
  return <div aria-hidden="true" className="h-7 sm:h-8" />;
}
