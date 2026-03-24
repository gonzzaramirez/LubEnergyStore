const DEFAULT_TZ = "America/Argentina/Buenos_Aires";

function getAppTimezone(): string {
  return process.env.NEXT_PUBLIC_APP_TIMEZONE || DEFAULT_TZ;
}

/** Fecha y hora de pedidos en la zona horaria configurada. */
export function formatOrderDateTime(dateString?: string | null): string {
  if (!dateString) return "-";
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: getAppTimezone(),
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}
