import { Plus, FolderOpen } from 'lucide-react';
import Button from '../ui/Button';
import CaseCard from './CaseCard';

export default function CasesView({ cases, onOpenModal }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-border-soft pb-4">
        <div>
          <h2 className="text-2xl font-bold text-dark">Mis Casos</h2>
          <p className="text-sm text-muted">Listado de procesos asignados.</p>
        </div>
        <Button onClick={onOpenModal}>
          <Plus className="w-4 h-4" /> Nuevo Caso
        </Button>
      </div>

      {cases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border-soft rounded-lg">
          <FolderOpen className="w-12 h-12 text-border-soft mb-4" />
          <h3 className="text-lg font-bold text-dark">No tienes casos</h3>
          <p className="text-muted mb-4">Aún no has agregado asignaciones.</p>
          <Button onClick={onOpenModal}>Agregar Caso</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cases.map((c) => (
            <CaseCard key={c.id} caseData={c} />
          ))}
        </div>
      )}
    </div>
  );
}
