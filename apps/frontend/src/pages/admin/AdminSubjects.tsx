import { useCallback, useEffect, useState } from 'react';
import { deleteSubject, getSubjects } from '../../api';
import type { Subject } from '../../types';
import SubjectFormModal from '../../components/admin/SubjectFormModal';
import FilesModal, { type FilesRecord } from '../../components/admin/FilesModal';

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [filesRecord, setFilesRecord] = useState<FilesRecord | null>(null);

  const load = useCallback(() => {
    return getSubjects()
      .then((list) => {
        setSubjects(list);
        setError('');
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar las asignaturas');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (s: Subject) => {
    setEditing(s);
    setFormOpen(true);
  };

  const openFiles = (s: Subject) =>
    setFilesRecord({
      type: 'subject',
      id: s.id,
      label: s.name,
      files: (s.files ?? []).map((file) => ({ id: file.id, title: file.title, url: file.url })),
    });

  const handleSaved = (message: string) => {
    setStatus(message);
    void load();
  };

  const handleDelete = async (s: Subject) => {
    if (!window.confirm(`¿Eliminar "${s.name}"? También se borran sus clases y archivos.`)) return;
    try {
      await deleteSubject(s.id);
      setStatus('Asignatura eliminada');
      if (editing?.id === s.id) setFormOpen(false);
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar la asignatura');
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <section className="adm-page">
      <header className="adm-page-head">
        <div>
          <span className="adm-eyebrow">Sección 02</span>
          <h2 className="adm-page-title">Asignaturas</h2>
          <p className="adm-page-sub">
            {subjects.length} ficha{subjects.length !== 1 ? 's' : ''} en el catálogo
          </p>
        </div>
        <button type="button" className="adm-btn adm-btn--primary" onClick={openCreate}>
          + Nueva asignatura
        </button>
      </header>

      <div aria-live="polite">
        {status && <p className="adm-status">{status}</p>}
        {error && (
          <p className="adm-error" role="alert">
            {error}
          </p>
        )}
      </div>

      {subjects.length === 0 ? (
        <p className="empty">Todavía no hay asignaturas cargadas.</p>
      ) : (
        <ol className="adm-ledger" role="list">
          {subjects.map((s, index) => (
            <li
              className="adm-row"
              key={s.id}
              style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
            >
              <span className="adm-row-index" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>

              <div className="adm-row-main">
                {(s.files?.length ?? 0) > 0 ? (
                  <div className="adm-row-meta">
                    <span className="adm-chip adm-chip--sage">
                      {s.files!.length} archivo{s.files!.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                ) : null}

                <div className="adm-row-identity">
                  {s.img && <img className="adm-row-thumb" src={s.img} alt="" loading="lazy" />}
                  <p className="adm-row-title">{s.name}</p>
                </div>
              </div>

              <div className="adm-row-actions">
                <button
                  type="button"
                  className="adm-btn adm-btn--sm adm-btn--ghost"
                  onClick={() => openEdit(s)}
                  aria-label={`Editar ${s.name}`}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="adm-btn adm-btn--sm adm-btn--ghost"
                  onClick={() => openFiles(s)}
                  aria-label={`Archivos de ${s.name}`}
                >
                  Archivos ({s.files?.length ?? 0})
                </button>
                <button
                  type="button"
                  className="adm-btn adm-btn--sm adm-btn--danger"
                  onClick={() => handleDelete(s)}
                  aria-label={`Eliminar ${s.name}`}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <SubjectFormModal
        open={formOpen}
        item={editing}
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
