import type { ClassItem } from '../types';

interface PlaylistSidebarProps {
  classes: ClassItem[];
  currentClassId: string;
  onSelect: (cls: ClassItem) => void;
  subjectName: string;
}

export default function PlaylistSidebar({ classes, currentClassId, onSelect, subjectName }: PlaylistSidebarProps) {
  const byWeek = classes.reduce<Record<number, ClassItem[]>>((acc, c) => {
    (acc[c.week] ??= []).push(c);
    return acc;
  }, {});

  const weeks = Object.keys(byWeek)
    .map(Number)
    .sort((a, b) => a - b);

  let globalIndex = 0;

  return (
    <div className="playlist-sidebar">
      <div className="playlist-sidebar-header">
        <h3>{subjectName}</h3>
        <span className="playlist-sidebar-count">{classes.length} clases</span>
      </div>
      <div className="playlist-sidebar-list">
        {weeks.map((week) => (
          <div key={week} className="playlist-sidebar-week">
            <div className="playlist-sidebar-week-title">Semana {week}</div>
            {byWeek[week].map((cls) => {
              const idx = globalIndex++;
              const isActive = cls.id === currentClassId;
              const label =
                cls.title ||
                `Clase ${cls.subjects.length === 2 ? 'II' : 'I'}`;
              return (
                <button
                  key={cls.id}
                  className={`playlist-sidebar-item${isActive ? ' active' : ''}`}
                  onClick={() => onSelect(cls)}
                >
                  <span className="playlist-sidebar-num">{idx + 1}</span>
                  <div className="playlist-sidebar-info">
                    <span className="playlist-sidebar-label">{label}</span>
                    <span className="playlist-sidebar-date">
                      {new Date(cls.date).toLocaleDateString('es-PE', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                  {isActive && <span className="playlist-sidebar-playing">▶</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
