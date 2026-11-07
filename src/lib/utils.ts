import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function safeNext(input: unknown) {
  return typeof input === 'string' &&
    /^\/(?!\/|\\)/.test(input) &&
    !input.includes('\\') &&
    !/[\u0000-\u0020\u007f]/.test(input)
    ? input
    : '/dashboard';
}
export function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
export const eventTimeZone = 'America/Argentina/Buenos_Aires';
export function eventDate(date: string, timeZone = eventTimeZone, locale = 'es-AR') {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone,
  }).format(new Date(date));
}
export function csv(rows: unknown[][]) {
  return (
    '\uFEFF' +
    rows
      .map((row) =>
        row
          .map((value) => {
            let text = String(value ?? '');
            if (/^[=+@\-\t\r]/.test(text)) text = "'" + text;
            return '"' + text.replaceAll('"', '""') + '"';
          })
          .join(','),
      )
      .join('\r\n')
  );
}
