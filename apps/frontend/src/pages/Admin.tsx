import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  getSubjects,
  getClasses,
  createSubject,
  updateSubject,
  deleteSubject,
  createClass,
  updateClass,
  deleteClass,
} from '../api';
import type { Subject, ClassItem } from '../types';
import { formatClassDate, subjectNamesOf } from '../lib/classFormat';

export default function Admin() {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [tab, setTab] = useState<'subjects' | 'classes'>('subjects');

  const [subjectName, setSubjectName] = useState('');
  const [subjectImg, setSubjectImg] = useState('');
  const [subjectMaterials, setSubjectMaterials] = useState('');

  const [classTitle, setClassTitle] = useState('');
  const [classUrl, setClassUrl] = useState('');
  const [classDate, setClassDate] = useState('');
  const [classSubjectIds, setClassSubjectIds] = useState<string[]>([]);

  const [filterSubject, setFilterSubject] = useState('all');
  const [filterWeek, setFilterWeek] = useState('all');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editSubjectIds, setEditSubjectIds] = useState<string[]>([]);
  const [savingClassId, setSavingClassId] = useState<string | null>(null);

  const [editMaterials, setEditMaterials] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

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
      setEditMaterials(
        Object.fromEntries(s.map((sub) => [sub.id, sub.materialsUrl ?? ''])),
      );
    });
  };

  const weeks = Array.from(new Set(classes.map((c) => c.week))).sort(
    (a, b) => a - b,
  );

  const filteredClasses = classes.filter((c) => {
    const ids = c.subjects.map((s) => s.subject.id);
    const okSubject =
      filterSubject === 'all' ||
      (filterSubject === 'none'
        ? ids.length === 0
        : ids.includes(filterSubject));
    const okWeek = filterWeek === 'all' || String(c.week) === filterWeek;
    return okSubject && okWeek;
  });

  const handleCreateSubject = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createSubject({
        name: subjectName,
        img: subjectImg.trim() || undefined,
        materialsUrl: subjectMaterials.trim() || undefined,
      });
      setSubjectName('');
      setSubjectImg('');
      setSubjectMaterials('');
      setMsg('Asignatura creada correctamente');
      loadData();
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMaterials = async (id: string) => {
    setSavingId(id);
    try {
      const value = (editMaterials[id] ?? '').trim();
      await updateSubject(id, { materialsUrl: value || null });
      setMsg('Materiales actualizados');
      loadData();
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setSavingId(null);
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
      setFilterSubject('all');
      setFilterWeek('all');
      setMsg('Clase creada correctamente');
      loadData();
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEditClass = (c: ClassItem) => {
    setEditingId(c.id);
    setEditTitle(c.title ?? '');
    setEditUrl(c.url);
    setEditDate(c.date.slice(0, 10));
    setEditSubjectIds(c.subjects.map((s) => s.subject.id));
  };

  const cancelEditClass = () => setEditingId(null);

  const toggleEditSubjectId = (id: string) => {
    setEditSubjectIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleUpdateClass = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setSavingClassId(editingId);
    try {
      await updateClass(editingId, {
        title: editTitle.trim(),
        url: editUrl.trim(),
        date: editDate,
        subjectIds: editSubjectIds,
      });
      setEditingId(null);
      setMsg('Clase actualizada correctamente');
      loadData();
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setSavingClassId(null);
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm('¿Eliminar esta clase?')) return;
    await deleteClass(id);
    if (editingId === id) setEditingId(null);
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
            <input
              type="url"
              placeholder="Carpeta de materiales en Drive (opcional)"
              value={subjectMaterials}
              onChange={(e) => setSubjectMaterials(e.target.value)}
            />
            <button type="submit" disabled={loading}>
              Crear asignatura
            </button>
          </form>

          <div className="admin-list">
            {subjects.map((s) => (
              <div key={s.id} className="admin-list-item admin-list-item--edit">
                <div className="admin-list-top">
                  <div className="admin-list-name">
                    {s.img && <img src={s.img} alt="" className="admin-list-img" />}
                    <span style={{ fontWeight: 500 }}>{s.name}</span>
                  </div>
                  <button onClick={() => handleDeleteSubject(s.id)} className="btn-danger">
                    Eliminar
                  </button>
                </div>
                <div className="admin-materials-row">
                  <input
                    type="url"
                    placeholder="Carpeta de materiales en Drive"
                    value={editMaterials[s.id] ?? ''}
                    onChange={(e) =>
                      setEditMaterials((prev) => ({ ...prev, [s.id]: e.target.value }))
                    }
                  />
                  <button
                    type="button"
                    className="btn-save"
                    disabled={savingId === s.id}
                    onClick={() => handleUpdateMaterials(s.id)}
                  >
                    {savingId === s.id ? 'Guardando…' : 'Guardar'}
                  </button>
                </div>
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

          <div className="admin-filters">
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              aria-label="Filtrar por asignatura"
            >
              <option value="all">Todas las asignaturas</option>
              <option value="none">Sin asignatura</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <select
              value={filterWeek}
              onChange={(e) => setFilterWeek(e.target.value)}
              aria-label="Filtrar por semana"
            >
              <option value="all">Todas las semanas</option>
              {weeks.map((w) => (
                <option key={w} value={String(w)}>
                  Semana {w}
                </option>
              ))}
            </select>
            {(filterSubject !== 'all' || filterWeek !== 'all') && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setFilterSubject('all');
                  setFilterWeek('all');
                }}
              >
                Limpiar
              </button>
            )}
            <span className="admin-filters-count">
              {filteredClasses.length} de {classes.length} clases
            </span>
          </div>

          <div className="admin-list">
            {filteredClasses.length === 0 && (
              <p className="empty">No hay clases con estos filtros.</p>
            )}
            {filteredClasses.map((c) =>
              editingId === c.id ? (
                <form
                  key={c.id}
                  className="admin-list-item admin-edit-form"
                  onSubmit={handleUpdateClass}
                >
                  <div className="admin-list-top">
                    <strong className="admin-edit-title">
                      Editando · Semana {c.week} · {formatClassDate(c.date)}
                    </strong>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={cancelEditClass}
                    >
                      Cancelar
                    </button>
                  </div>
                  <div className="admin-edit-grid">
                    <input
                      type="text"
                      placeholder="Título (opcional)"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <input
                      type="url"
                      placeholder="URL de Google Drive"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      required
                    />
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="checkbox-group">
                    <label>Asignaturas:</label>
                    {subjects.map((s) => (
                      <label key={s.id} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={editSubjectIds.includes(s.id)}
                          onChange={() => toggleEditSubjectId(s.id)}
                        />
                        {s.name}
                      </label>
                    ))}
                  </div>
                  <div className="admin-edit-actions">
                    <span className="admin-edit-note">
                      La semana se recalcula según la fecha.
                    </span>
                    <button
                      type="submit"
                      className="btn-save"
                      disabled={savingClassId === c.id}
                    >
                      {savingClassId === c.id ? 'Guardando…' : 'Guardar cambios'}
                    </button>
                  </div>
                </form>
              ) : (
                <div key={c.id} className="admin-list-item admin-list-item--class">
                  <div className="admin-list-info">
                    <div className="admin-list-meta">
                      <span className="admin-list-week">Semana {c.week}</span>
                      <span className="admin-list-date">{formatClassDate(c.date)}</span>
                    </div>
                    <div className="admin-list-title">
                      {c.title || `Clase · Semana ${c.week}`}
                    </div>
                    <div className="admin-subject-tags">
                      {c.subjects.length === 0 ? (
                        <span className="admin-subject-tag admin-subject-tag--none">
                          Sin asignatura
                        </span>
                      ) : (
                        subjectNamesOf(c)
                          .split(' / ')
                          .map((name) => (
                            <span key={name} className="admin-subject-tag">
                              {name}
                            </span>
                          ))
                      )}
                    </div>
                  </div>
                  <div className="admin-list-actions">
                    <button
                      type="button"
                      className="btn-secondary btn-edit"
                      onClick={() => startEditClass(c)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={() => handleDeleteClass(c.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
