import { useState, type FormEvent } from 'react';
import Modal from '../Modal';
import { createSubject, updateSubject } from '../../api';
import type { Subject } from '../../types';

interface SubjectFormModalProps {
  open: boolean;
  item: Subject | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}

interface SubjectFormProps {
  item: Subject | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}

function SubjectForm({ item, onClose, onSaved }: SubjectFormProps) {
  const [name, setName] = useState(item?.name ?? '');
  const [img, setImg] = useState(item?.img ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (item) {
        await updateSubject(item.id, {
          name: name.trim(),
          img: img.trim() || null,
        });
        onSaved('Asignatura actualizada correctamente');
      } else {
        await createSubject({
          name: name.trim(),
          img: img.trim() || undefined,
        });
        onSaved('Asignatura creada correctamente');
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la asignatura');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="adm-form" onSubmit={handleSubmit}>
      <div className="adm-field">
        <label htmlFor="adm-subject-name">
          Nombre <span className="adm-required">*</span>
        </label>
        <input
          id="adm-subject-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Física"
          autoComplete="off"
        />
      </div>

      <div className="adm-field">
        <label htmlFor="adm-subject-img">Imagen de portada</label>
        <input
          id="adm-subject-img"
          type="url"
          value={img}
          onChange={(e) => setImg(e.target.value)}
          placeholder="https://… (opcional)"
          autoComplete="off"
        />
      </div>

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
          {saving ? 'Guardando…' : item ? 'Guardar cambios' : 'Crear asignatura'}
        </button>
      </div>
    </form>
  );
}

export default function SubjectFormModal({ open, item, onClose, onSaved }: SubjectFormModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={item ? 'Ficha de asignatura' : 'Nueva ficha'}
      title={item ? 'Editar asignatura' : 'Nueva asignatura'}
    >
      {open && <SubjectForm item={item} onClose={onClose} onSaved={onSaved} />}
    </Modal>
  );
}
