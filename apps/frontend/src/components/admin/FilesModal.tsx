import { useState, type FormEvent } from 'react';
import Modal from '../Modal';
import {
  createClassLink,
  createSubjectFile,
  deleteClassLink,
  deleteSubjectFile,
} from '../../api';
import type { Subject } from '../../types';

export interface FileEntry {
  id: string;
  title: string;
  url: string;
  subjectId?: string | null;
}

export interface FilesRecord {
  type: 'class' | 'subject';
  id: string;
  label: string;
  files: FileEntry[];
  subjects?: Subject[];
}

interface FilesModalProps {
  open: boolean;
  record: FilesRecord | null;
  onClose: () => void;
  onChanged: (message: string) => void;
}

interface FilesPanelProps {
  record: FilesRecord;
  onClose: () => void;
  onChanged: (message: string) => void;
}

interface DraftRow {
  title: string;
  url: string;
  subjectId: string;
}

const emptyRow = (subjectId = ''): DraftRow => ({ title: '', url: '', subjectId });

function FilesPanel({ record, onClose, onChanged }: FilesPanelProps) {
  const classSubjects = record.type === 'class' ? (record.subjects ?? []) : [];
  const pickSubject = classSubjects.length > 1;
  const defaultSubjectId = classSubjects[0]?.id ?? '';
  const subjectNameOf = (subjectId?: string | null) =>
    classSubjects.find((subject) => subject.id === subjectId)?.name ?? 'Sin asignatura';

  const [files, setFiles] = useState<FileEntry[]>(record.files);
  const [rows, setRows] = useState<DraftRow[]>([emptyRow(defaultSubjectId)]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const updateRow = (index: number, patch: Partial<DraftRow>) =>
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const pending = rows.filter((row) => row.url.trim());

    if (pending.length === 0) {
      setError('Agregá al menos una URL para guardar.');
      return;
    }

    setError('');
    setNotice('');
    setSaving(true);

    try {
      const created: FileEntry[] = [];
      for (const row of pending) {
        const data = {
          title: row.title.trim() || undefined,
          url: row.url.trim(),
          ...(record.type === 'class' && row.subjectId ? { subjectId: row.subjectId } : {}),
        };
        const file =
          record.type === 'class'
            ? await createClassLink(record.id, data)
            : await createSubjectFile(record.id, data);
        created.push(file);
      }

      setFiles((prev) => [...prev, ...created]);
      setRows([emptyRow(defaultSubjectId)]);
      const message = `${created.length} archivo${created.length !== 1 ? 's' : ''} agregado${created.length !== 1 ? 's' : ''}`;
      setNotice(message);
      onChanged(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron agregar los archivos');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (fileId: string) => {
    if (!window.confirm('¿Eliminar este archivo del registro?')) return;

    setError('');
    setRemovingId(fileId);
    try {
      if (record.type === 'class') {
        await deleteClassLink(record.id, fileId);
      } else {
        await deleteSubjectFile(record.id, fileId);
      }
      setFiles((prev) => prev.filter((file) => file.id !== fileId));
      setNotice('Archivo eliminado');
      onChanged('Archivo eliminado');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el archivo');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <>
      <section className="adm-files" aria-labelledby="adm-files-current">
        <h3 id="adm-files-current" className="adm-subtitle">
          Adjuntos
          <span className="adm-count">{files.length}</span>
        </h3>

        {files.length === 0 ? (
          <p className="adm-hint">Este registro todavía no tiene archivos.</p>
        ) : (
          <ul className="adm-files-list" role="list">
            {files.map((file) => (
              <li key={file.id} className="adm-file">
                <a href={file.url} target="_blank" rel="noopener noreferrer" title={file.url}>
                  <span className="adm-file-title">{file.title}</span>
                  {pickSubject && (
                    <span className="adm-file-subject">{subjectNameOf(file.subjectId)}</span>
                  )}
                  <span className="adm-file-arrow" aria-hidden="true">
                    ↗
                  </span>
                </a>
                <button
                  type="button"
                  className="adm-remove"
                  onClick={() => handleRemove(file.id)}
                  disabled={removingId === file.id}
                  aria-label={`Eliminar archivo ${file.title}`}
                >
                  {removingId === file.id ? '…' : '✕'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form className="adm-form" onSubmit={handleSubmit}>
        <h3 className="adm-subtitle">Agregar archivos</h3>

        <div className="adm-drafts">
          {rows.map((row, index) => (
            <div className="adm-draft" key={index}>
              <div className="adm-draft-fields">
                <div className="adm-field">
                  <label htmlFor={`adm-file-title-${index}`}>Título</label>
                  <input
                    id={`adm-file-title-${index}`}
                    type="text"
                    value={row.title}
                    onChange={(e) => updateRow(index, { title: e.target.value })}
                    placeholder="Ej. Programa del curso"
                    autoComplete="off"
                  />
                </div>
                <div className="adm-field">
                  <label htmlFor={`adm-file-url-${index}`}>
                    URL <span className="adm-required">*</span>
                  </label>
                  <input
                    id={`adm-file-url-${index}`}
                    type="url"
                    required
                    value={row.url}
                    onChange={(e) => updateRow(index, { url: e.target.value })}
                    placeholder="https://…"
                    autoComplete="off"
                  />
                </div>
                {pickSubject && (
                  <div className="adm-field">
                    <label htmlFor={`adm-file-subject-${index}`}>Asignatura</label>
                    <select
                      id={`adm-file-subject-${index}`}
                      value={row.subjectId}
                      onChange={(e) => updateRow(index, { subjectId: e.target.value })}
                    >
                      {classSubjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              {rows.length > 1 && (
                <button
                  type="button"
                  className="adm-remove adm-remove--row"
                  onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
                  aria-label={`Quitar fila ${index + 1}`}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          className="adm-btn adm-btn--dashed"
          onClick={() => setRows((prev) => [...prev, emptyRow(defaultSubjectId)])}
        >
          + Agregar otro archivo
        </button>

        <div aria-live="polite" className="adm-live">
          {notice && <p className="adm-status adm-status--ok">{notice}</p>}
          {error && (
            <p className="adm-error" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="adm-actions">
          <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose}>
            Cerrar
          </button>
          <button
            type="submit"
            className="adm-btn adm-btn--primary"
            disabled={saving || rows.every((row) => !row.url.trim())}
          >
            {saving ? 'Agregando…' : 'Agregar'}
          </button>
        </div>
      </form>
    </>
  );
}

export default function FilesModal({ open, record, onClose, onChanged }: FilesModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={record ? `Archivos de ${record.type === 'class' ? 'la clase' : 'la asignatura'}` : ''}
      title={record?.label ?? 'Archivos'}
    >
      {open && record && (
        <FilesPanel record={record} onClose={onClose} onChanged={onChanged} />
      )}
    </Modal>
  );
}
