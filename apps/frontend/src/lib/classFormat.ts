import type { ClassItem } from '../types';

export function subjectNamesOf(cls: ClassItem): string {
  const names = cls.subjects.map((s) => s.subject.name).filter(Boolean);
  return names.join(' / ');
}

export function primaryLabel(cls: ClassItem): string {
  const subjects = subjectNamesOf(cls);
  return `${subjects || 'Clase'} · Semana ${cls.week}`;
}

function parseDate(dateStr: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr);
  if (!m) return new Date(dateStr);
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

export function formatClassDate(dateStr: string): string {
  return parseDate(dateStr).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatLongDate(dateStr: string): string {
  return parseDate(dateStr).toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
