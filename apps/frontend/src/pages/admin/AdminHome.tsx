import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getClasses, getSubjects } from '../../api';

export default function AdminHome() {
  const [classCount, setClassCount] = useState(0);
  const [subjectCount, setSubjectCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getClasses(), getSubjects()])
      .then(([classes, subjects]) => {
        setClassCount(classes.length);
        setSubjectCount(subjects.length);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Cargando...</div>;

  const sections = [
    {
      index: '01',
      to: '/admin/classes',
      title: 'Clases',
      description: 'Cada clase de la semana, su enlace de Drive y los archivos adjuntos.',
      count: classCount,
      unit: 'clases',
    },
    {
      index: '02',
      to: '/admin/subjects',
      title: 'Asignaturas',
      description: 'Las fichas del catálogo: portada, carpeta de materiales y adjuntos.',
      count: subjectCount,
      unit: 'asignaturas',
    },
  ];

  return (
    <section className="adm-page">
      <header className="adm-page-head">
        <div>
          <span className="adm-eyebrow">Índice general</span>
          <h2 className="adm-page-title">Catálogo</h2>
          <p className="adm-page-sub">Elegí una sección para administrar sus registros.</p>
        </div>
      </header>

      <div className="adm-home-grid">
        {sections.map((section) => (
          <Link key={section.to} to={section.to} className="adm-home-card">
            <span className="adm-home-index" aria-hidden="true">
              {section.index}
            </span>
            <h3 className="adm-home-title">{section.title}</h3>
            <p className="adm-home-desc">{section.description}</p>
            <div className="adm-home-foot">
              <span className="adm-home-count">
                {section.count}
                <span className="adm-home-unit">{section.unit}</span>
              </span>
              <span className="adm-home-cta">
                Abrir<span aria-hidden="true"> →</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
