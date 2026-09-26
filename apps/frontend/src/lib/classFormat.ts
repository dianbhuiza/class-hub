import type { ClassItem } from '../types';

export function subjectNamesOf(cls: ClassItem): string {
  const names = cls.subjects.map((s) => s.subject.name).filter(Boolean);
  return names.join(' / ');
}

export function primaryLabel(cls: ClassItem): string {
  const subjects = subjectNamesOf(cls);
  return `${subjects || 'Clase'} · Semana ${cls.week}`;
}

export function formatClassDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatLongDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
