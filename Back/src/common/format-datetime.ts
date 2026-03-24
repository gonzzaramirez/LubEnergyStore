const DEFAULT_TZ = 'America/Argentina/Buenos_Aires';

export function getAppTimezone(): string {
  return process.env.APP_TIMEZONE || DEFAULT_TZ;
}

/** Fecha y hora legibles en español (Argentina u otra TZ de env). */
export function formatDateTimeEsAr(isoOrDate: Date | string): string {
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: getAppTimezone(),
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/** Año en la TZ de la app (p. ej. pie de correo). */
export function formatYearInAppTimezone(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: getAppTimezone(),
    year: 'numeric',
  }).format(date);
}
