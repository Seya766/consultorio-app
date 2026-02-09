import { useState } from 'react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

const INITIAL_STATE = { client: '', type: '', professor: '', radicado: '' };

export default function CaseForm({ open, onClose, onSubmit }) {
  const [formData, setFormData] = useState(INITIAL_STATE);

  const update = (field) => (e) =>
    setFormData({ ...formData, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData(INITIAL_STATE);
  };

  return (
    <Modal title="Registrar Nuevo Caso" open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Nombre del Usuario (Cliente)">
          <input
            required
            className="form-input"
            value={formData.client}
            onChange={update('client')}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Tipo de Proceso">
            <input
              required
              className="form-input"
              value={formData.type}
              onChange={update('type')}
            />
          </FormField>
          <FormField label="Radicado (Opcional)">
            <input
              className="form-input font-mono text-sm"
              value={formData.radicado}
              onChange={update('radicado')}
            />
          </FormField>
        </div>

        <FormField label="Docente Tutor">
          <input
            className="form-input"
            value={formData.professor}
            onChange={update('professor')}
          />
        </FormField>

        <div className="pt-6">
          <Button type="submit" variant="primary" className="w-full py-3">
            Guardar Registro
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-dark uppercase mb-1">{label}</label>
      {children}
    </div>
  );
}
