import { useState, useEffect, useMemo } from 'react';
import { getSubjects, getClasses } from '../api';
import type { Subject, ClassItem, WeekGroup } from '../types';
import SubjectCard from '../components/SubjectCard';
import WeekGroupComponent from '../components/WeekGroup';

function groupByWeek(classes: ClassItem[]): WeekGroup[] {
  const map = new Map<number, ClassItem[]>();
  for (const cls of classes) {
    const existing = map.get(cls.week) || [];
    existing.push(cls);
    map.set(cls.week, existing);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([week, classes]) => ({
      week,
      classes: classes.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    }));
}

export default function Home() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [weekMode, setWeekMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSubjects(), getClasses()])
      .then(([s, c]) => {
        setSubjects(s);
        setClasses(c);
      })
      .finally(() => setLoading(false));
  }, []);

  const weekGroups = useMemo(() => groupByWeek(classes), [classes]);

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="home">
      <div className="home-header">
        <div>
          <h1>{weekMode ? 'Semanas' : 'Asignaturas'}</h1>
          <p className="home-subtitle">
            {weekMode
              ? `${weekGroups.length} semana${weekGroups.length !== 1 ? 's' : ''} · ${classes.length} clase${classes.length !== 1 ? 's' : ''}`
              : `${subjects.length} asignatura${subjects.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          className={`mode-toggle ${weekMode ? 'active' : ''}`}
          onClick={() => setWeekMode(!weekMode)}
        >
          {weekMode ? '🎓 Asignaturas' : '📅 Semanas'}
        </button>
      </div>

      {weekMode ? (
        <div className="week-view">
          {weekGroups.length === 0 ? (
            <p className="empty">No hay clases registradas aún.</p>
          ) : (
            weekGroups.map((group) => (
              <WeekGroupComponent key={group.week} group={group} />
            ))
          )}
        </div>
      ) : (
        <div className="subjects-grid">
          {subjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      )}
    </div>
  );
}
