/**
 * Zona horaria para mostrar fechas/horas al usuario (ej. Argentina desde VPS en otro huso).
 * Configurar APP_TIMEZONE (IANA), p. ej. America/Argentina/Buenos_Aires
 */
export function getAppTimezone(): string {
  return (
    process.env.APP_TIMEZONE || 'America/Argentina/Buenos_Aires'
  ).trim();
}

const defaultDateTimeOptions: Intl.DateTimeFormatOptions = {
  timeZone: getAppTimezone(),
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

export function formatDateTimeInAppTimezone(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('es-AR', {
    ...defaultDateTimeOptions,
    timeZone: getAppTimezone(),
    ...options,
  });
}
