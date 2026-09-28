import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSubject } from '../api';
import type { ClassItem, WeekGroup } from '../types';
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

export default function SubjectPage() {
  const { id } = useParams<{ id: string }>();
  const [subjectName, setSubjectName] = useState('');
  const [subjectImg, setSubjectImg] = useState<string | null>(null);
  const [materialsUrl, setMaterialsUrl] = useState<string | null>(null);
  const [weekGroups, setWeekGroups] = useState<WeekGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getSubject(id)
      .then((data) => {
        setSubjectName(data.name);
        setSubjectImg(data.img);
        setMaterialsUrl(data.materialsUrl);
        const classes = data.classes.map((c) => c.class);
        setWeekGroups(groupByWeek(classes));
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="subject-page">
      <Link to="/" className="back-link">← Volver</Link>
      <div className="subject-page-header">
        {subjectImg && <img src={subjectImg} alt={subjectName} className="subject-page-img" />}
        <div>
          <h1>{subjectName}</h1>
          <p className="home-subtitle">
            {weekGroups.length} semana{weekGroups.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
      {materialsUrl && (
        <a
          className="subject-materials"
          href={materialsUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="subject-materials-icon" aria-hidden="true">📂</span>
          <span className="subject-materials-text">
            <strong>Materiales del curso</strong>
            <span>Apuntes, guías y recursos compartidos en Google Drive</span>
          </span>
          <span className="subject-materials-arrow" aria-hidden="true">↗</span>
        </a>
      )}
      {weekGroups.length === 0 ? (
        <p className="empty">No hay clases registradas para esta asignatura.</p>
      ) : (
        <div className="subject-classes">
          {weekGroups.map((group) => (
            <WeekGroupComponent key={group.week} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
