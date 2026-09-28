import { useCallback, useEffect, useMemo, useState } from 'react';
import { deleteClass, getClasses, getSubjects } from '../../api';
import type { ClassItem, Subject } from '../../types';
import { formatClassDate } from '../../lib/classFormat';
import ClassFormModal from '../../components/admin/ClassFormModal';
import FilesModal, { type FilesRecord } from '../../components/admin/FilesModal';

export default function AdminClasses() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const [week, setWeek] = useState('all');
  const [subjectId, setSubjectId] = useState('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ClassItem | null>(null);
  const [filesRecord, setFilesRecord] = useState<FilesRecord | null>(null);

  const load = useCallback(() => {
    return Promise.all([getClasses(), getSubjects()])
      .then(([classList, subjectList]) => {
        setClasses(classList);
        setSubjects(subjectList);
        setError('');
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar las clases');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const weeks = useMemo(
    () => Array.from(new Set(classes.map((c) => c.week))).sort((a, b) => a - b),
    [classes],
  );

  const filtered = useMemo(() => {
    return classes.filter((c) => {
      const ids = c.subjects.map((s) => s.subject.id);
      const okSubject =
        subjectId === 'all' ||
        (subjectId === 'none' ? ids.length === 0 : ids.includes(subjectId));
      const okWeek = week === 'all' || String(c.week) === week;
      return okSubject && okWeek;
    });
  }, [classes, week, subjectId]);

  const labelOf = (c: ClassItem) => c.title || `Clase · semana ${c.week}`;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (c: ClassItem) => {
    setEditing(c);
    setFormOpen(true);
  };

  const openFiles = (c: ClassItem) =>
    setFilesRecord({
      type: 'class',
      id: c.id,
      label: labelOf(c),
      files: (c.links ?? []).map((link) => ({ id: link.id, title: link.title, url: link.url })),
    });

  const handleSaved = (message: string) => {
    setStatus(message);
    void load();
  };

  const handleDelete = async (c: ClassItem) => {
    if (!window.confirm(`¿Eliminar "${labelOf(c)}"? También se borran sus archivos.`)) return;
    try {
      await deleteClass(c.id);
      setStatus('Clase eliminada');
      if (editing?.id === c.id) setFormOpen(false);
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar la clase');
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <section className="adm-page">
      <header className="adm-page-head">
        <div>
          <span className="adm-eyebrow">Sección 01</span>
          <h2 className="adm-page-title">Clases</h2>
          <p className="adm-page-sub">
            {classes.length} registro{classes.length !== 1 ? 's' : ''} en el catálogo
          </p>
        </div>
        <button type="button" className="adm-btn adm-btn--primary" onClick={openCreate}>
          + Nueva clase
        </button>
      </header>

      <div aria-live="polite">
        {status && <p className="adm-status">{status}</p>}
        {error && <p className="adm-error" role="alert">{error}</p>}
      </div>

      <div className="adm-toolbar">
        <div className="adm-filter">
          <label htmlFor="adm-filter-week">Semana</label>
          <select
            id="adm-filter-week"
            value={week}
            onChange={(e) => setWeek(e.target.value)}
          >
            <option value="all">Todas</option>
            {weeks.map((w) => (
              <option key={w} value={String(w)}>
                Semana {w}
              </option>
            ))}
          </select>
        </div>

        <div className="adm-filter">
          <label htmlFor="adm-filter-subject">Asignatura</label>
          <select
            id="adm-filter-subject"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
          >
            <option value="all">Todas</option>
            <option value="none">Sin asignatura</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {(week !== 'all' || subjectId !== 'all') && (
          <button
            type="button"
            className="adm-btn adm-btn--ghost"
            onClick={() => {
              setWeek('all');
              setSubjectId('all');
            }}
          >
            Limpiar filtros
          </button>
        )}

        <p className="adm-result" role="status">
          {filtered.length} de {classes.length} clases
        </p>
      </div>

      {classes.length === 0 ? (
        <p className="empty">Todavía no hay clases cargadas.</p>
      ) : filtered.length === 0 ? (
        <div className="adm-empty">
          <p className="empty">Ninguna clase coincide con estos filtros.</p>
          <button
            type="button"
            className="adm-btn adm-btn--ghost"
            onClick={() => {
              setWeek('all');
              setSubjectId('all');
            }}
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <ol className="adm-ledger" role="list">
          {filtered.map((c, index) => (
            <li
              className="adm-row"
              key={c.id}
              style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
            >
              <span className="adm-row-index" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>

              <div className="adm-row-main">
                <div className="adm-row-meta">
                  <span className="adm-chip adm-chip--gold">
                    Sem {String(c.week).padStart(2, '0')}
                  </span>
                  <span className="adm-row-date">{formatClassDate(c.date)}</span>
                  {(c.links?.length ?? 0) > 0 && (
                    <span className="adm-chip adm-chip--sage">
                      {c.links!.length} archivo{c.links!.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <p className="adm-row-title">{labelOf(c)}</p>

                <div className="adm-tags">
                  {c.subjects.length === 0 ? (
                    <span className="adm-tag adm-tag--none">Sin asignatura</span>
                  ) : (
                    c.subjects.map((cs) => (
                      <span className="adm-tag" key={cs.subject.id}>
                        {cs.subject.name}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="adm-row-actions">
                <button
                  type="button"
                  className="adm-btn adm-btn--sm adm-btn--ghost"
                  onClick={() => openEdit(c)}
                  aria-label={`Editar ${labelOf(c)}`}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="adm-btn adm-btn--sm adm-btn--ghost"
                  onClick={() => openFiles(c)}
                  aria-label={`Archivos de ${labelOf(c)}`}
                >
                  Archivos ({c.links?.length ?? 0})
                </button>
                <button
                  type="button"
                  className="adm-btn adm-btn--sm adm-btn--danger"
                  onClick={() => handleDelete(c)}
                  aria-label={`Eliminar ${labelOf(c)}`}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <ClassFormModal
        open={formOpen}
        item={editing}
        subjects={subjects}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
      />

      <FilesModal
        open={filesRecord !== null}
        record={filesRecord}
        onClose={() => setFilesRecord(null)}
        onChanged={handleSaved}
      />
    </section>
  );
}
