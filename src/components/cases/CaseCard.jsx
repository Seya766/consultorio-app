import { FileText } from 'lucide-react';
import Badge from '../ui/Badge';

export default function CaseCard({ caseData }) {
  return (
    <div className="bg-white p-6 rounded-lg border border-border-soft hover:border-uni-blue transition-colors shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <span className="font-mono text-xs bg-cream-dark px-2 py-1 rounded text-muted">
          {caseData.radicado || 'Sin radicado'}
        </span>
        <Badge type={caseData.status}>
          {caseData.status === 'urgent' ? 'Urgente' : 'En Trámite'}
        </Badge>
      </div>
      <h3 className="text-lg font-bold text-dark mb-1">{caseData.client}</h3>
      <p className="text-sm text-muted mb-4 flex items-center gap-2">
        <FileText className="w-3 h-3" /> {caseData.type}
      </p>
      <div className="border-t border-cream-border pt-3 flex justify-between items-center text-xs text-muted">
        <span>Tutor: {caseData.professor}</span>
        <span className="text-uni-blue font-bold">Ver detalles</span>
      </div>
    </div>
  );
}
