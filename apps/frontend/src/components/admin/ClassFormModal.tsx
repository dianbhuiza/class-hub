import { useState, type FormEvent } from 'react';
import Modal from '../Modal';
import { createClass, updateClass } from '../../api';
import type { ClassItem, Subject } from '../../types';

interface ClassFormModalProps {
  open: boolean;
  item: ClassItem | null;
  subjects: Subject[];
  onClose: () => void;
  onSaved: (message: string) => void;
}

interface ClassFormProps {
  item: ClassItem | null;
  subjects: Subject[];
  onClose: () => void;
  onSaved: (message: string) => void;
}

function ClassForm({ item, subjects, onClose, onSaved }: ClassFormProps) {
  const [title, setTitle] = useState(item?.title ?? '');
  const [url, setUrl] = useState(item?.url ?? '');
  const [date, setDate] = useState(item ? item.date.slice(0, 10) : '');
  const [subjectIds, setSubjectIds] = useState<string[]>(
    item ? item.subjects.map((s) => s.subject.id) : [],
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleSubject = (id: string) =>
    setSubjectIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (item) {
        await updateClass(item.id, {
          title: title.trim(),
          url: url.trim(),
          date,
          subjectIds,
        });
        onSaved('Clase actualizada correctamente');
      } else {
        await createClass({ title: title.trim(), url: url.trim(), date, subjectIds });
        onSaved('Clase creada correctamente');
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la clase');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="adm-form" onSubmit={handleSubmit}>
      <div className="adm-field">
        <label htmlFor="adm-class-title">Título</label>
        <input
          id="adm-class-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Opcional"
          autoComplete="off"
        />
        <span className="adm-hint">
          Si lo dejás vacío se muestra la asignatura y la semana.
        </span>
      </div>

      <div className="adm-field">
        <label htmlFor="adm-class-url">
          Enlace de Google Drive <span className="adm-required">*</span>
        </label>
        <input
          id="adm-class-url"
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://drive.google.com/…"
          autoComplete="off"
        />
      </div>

      <div className="adm-field">
        <label htmlFor="adm-class-date">
          Fecha <span className="adm-required">*</span>
        </label>
        <input
          id="adm-class-date"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <span className="adm-hint">La semana se recalcula según esta fecha.</span>
      </div>

      <fieldset className="adm-fieldset">
        <legend>Asignaturas</legend>
        {subjects.length === 0 ? (
          <p className="adm-hint">Todavía no hay asignaturas cargadas.</p>
        ) : (
          <div className="adm-pills">
            {subjects.map((s) => (
              <label
                key={s.id}
                className={`adm-pill${subjectIds.includes(s.id) ? ' is-on' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={subjectIds.includes(s.id)}
                  onChange={() => toggleSubject(s.id)}
                />
                <span>{s.name}</span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      {error && (
        <p className="adm-error" role="alert">
          {error}
        </p>
      )}

      <div className="adm-actions">
        <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose}>
          Cancelar
        </button>
        <button type="submit" className="adm-btn adm-btn--primary" disabled={saving}>
          {saving ? 'Guardando…' : item ? 'Guardar cambios' : 'Crear clase'}
        </button>
      </div>
    </form>
  );
}

export default function ClassFormModal({
  open,
  item,
  subjects,
  onClose,
  onSaved,
}: ClassFormModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={item ? `Registro · semana ${item.week}` : 'Nuevo registro'}
      title={item ? 'Editar clase' : 'Nueva clase'}
    >
      {open && (
        <ClassForm item={item} subjects={subjects} onClose={onClose} onSaved={onSaved} />
      )}
    </Modal>
  );
}
