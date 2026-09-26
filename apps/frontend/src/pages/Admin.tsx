import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  getSubjects,
  getClasses,
  createSubject,
  deleteSubject,
  createClass,
  deleteClass,
} from '../api';
import type { Subject, ClassItem } from '../types';

export default function Admin() {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [tab, setTab] = useState<'subjects' | 'classes'>('subjects');

  const [subjectName, setSubjectName] = useState('');
  const [subjectImg, setSubjectImg] = useState('');

  const [classTitle, setClassTitle] = useState('');
  const [classUrl, setClassUrl] = useState('');
  const [classDate, setClassDate] = useState('');
  const [classSubjectIds, setClassSubjectIds] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user) loadData();
  }, [user, authLoading, navigate]);

  const loadData = () => {
    Promise.all([getSubjects(), getClasses()]).then(([s, c]) => {
      setSubjects(s);
      setClasses(c);
    });
  };

  const handleCreateSubject = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createSubject(subjectName, subjectImg || undefined);
      setSubjectName('');
      setSubjectImg('');
      setMsg('Asignatura creada correctamente');
      loadData();
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('¿Eliminar esta asignatura?')) return;
    await deleteSubject(id);
    loadData();
  };

  const handleCreateClass = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createClass({
        title: classTitle,
        url: classUrl,
        date: classDate,
        subjectIds: classSubjectIds,
      });
      setClassTitle('');
      setClassUrl('');
      setClassDate('');
      setClassSubjectIds([]);
      setMsg('Clase creada correctamente');
      loadData();
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm('¿Eliminar esta clase?')) return;
    await deleteClass(id);
    loadData();
  };

  const toggleSubjectId = (id: string) => {
    setClassSubjectIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (authLoading) return <div className="loading">Cargando...</div>;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Panel de Control</h1>
        <button onClick={handleLogout} className="btn-secondary">
          Cerrar sesión
        </button>
      </div>

      {msg && <p className="admin-msg">{msg}</p>}

      <div className="admin-tabs">
        <button
          className={`tab ${tab === 'subjects' ? 'active' : ''}`}
          onClick={() => setTab('subjects')}
        >
          Asignaturas ({subjects.length})
        </button>
        <button
          className={`tab ${tab === 'classes' ? 'active' : ''}`}
          onClick={() => setTab('classes')}
        >
          Clases ({classes.length})
        </button>
      </div>

      {tab === 'subjects' && (
        <div className="admin-section">
          <form onSubmit={handleCreateSubject} className="admin-form">
            <h2>Nueva Asignatura</h2>
            <input
              type="text"
              placeholder="Nombre de la asignatura"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              required
            />
            <input
              type="url"
              placeholder="URL de imagen (opcional)"
              value={subjectImg}
              onChange={(e) => setSubjectImg(e.target.value)}
            />
            <button type="submit" disabled={loading}>
              Crear asignatura
            </button>
          </form>

          <div className="admin-list">
            {subjects.map((s) => (
              <div key={s.id} className="admin-list-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                  {s.img && <img src={s.img} alt="" className="admin-list-img" />}
                  <span style={{ fontWeight: 500 }}>{s.name}</span>
                </div>
                <button onClick={() => handleDeleteSubject(s.id)} className="btn-danger">
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'classes' && (
        <div className="admin-section">
          <form onSubmit={handleCreateClass} className="admin-form">
            <h2>Nueva Clase</h2>
            <input
              type="text"
              placeholder="Título (opcional)"
              value={classTitle}
              onChange={(e) => setClassTitle(e.target.value)}
            />
            <input
              type="url"
              placeholder="URL de Google Drive"
              value={classUrl}
              onChange={(e) => setClassUrl(e.target.value)}
              required
            />
            <input
              type="date"
              value={classDate}
              onChange={(e) => setClassDate(e.target.value)}
              required
            />
            <div className="checkbox-group">
              <label>Asignaturas:</label>
              {subjects.map((s) => (
                <label key={s.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={classSubjectIds.includes(s.id)}
                    onChange={() => toggleSubjectId(s.id)}
                  />
                  {s.name}
                </label>
              ))}
            </div>
            <button type="submit" disabled={loading}>
              Crear clase
            </button>
          </form>

          <div className="admin-list">
            {classes.map((c) => (
              <div key={c.id} className="admin-list-item">
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--gold)' }}>
                    Semana {c.week}
                  </div>
                  <div style={{ fontWeight: 500 }}>{c.title || `Clase Semana ${c.week}`}</div>
                  <div className="admin-list-date">
                    {new Date(c.date + 'T00:00:00').toLocaleDateString('es-PE', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </div>
                </div>
                <button onClick={() => handleDeleteClass(c.id)} className="btn-danger">
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
