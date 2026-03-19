/**
 * Fechas de pedidos en zona configurable (VPS fuera de Argentina).
 * Definir NEXT_PUBLIC_APP_TIMEZONE (IANA), ej. America/Argentina/Buenos_Aires
 */
export function getAppTimezone(): string {
  return (
    process.env.NEXT_PUBLIC_APP_TIMEZONE?.trim() ||
    "America/Argentina/Buenos_Aires"
  );
}

export function formatOrderDateTime(
  dateString?: string | null,
  options?: { compactMonth?: boolean; emptyLabel?: string },
): string {
  if (!dateString) return options?.emptyLabel ?? "";
  return new Date(dateString).toLocaleString("es-AR", {
    timeZone: getAppTimezone(),
    day: "2-digit",
    month: options?.compactMonth ? "2-digit" : "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
