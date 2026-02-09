import { FileText } from 'lucide-react';
import Badge from '../ui/Badge';

export default function CasesTable({ cases }) {
  return (
    <table className="w-full text-left text-sm">
      <thead className="bg-cream-dark text-muted border-b border-border-soft">
        <tr>
          <th className="px-6 py-3 font-bold uppercase text-[10px] tracking-wider">Usuario / Radicado</th>
          <th className="px-6 py-3 font-bold uppercase text-[10px] tracking-wider">Tipo de Proceso</th>
          <th className="px-6 py-3 font-bold uppercase text-[10px] tracking-wider">Docente Tutor</th>
          <th className="px-6 py-3 font-bold uppercase text-[10px] tracking-wider text-right">Estado</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-cream-border">
        {cases.map((c) => (
          <tr key={c.id} className="hover:bg-[#FAFAF9] transition-colors cursor-pointer">
            <td className="px-6 py-4">
              <div className="font-bold text-dark">{c.client}</div>
              <div className="text-xs text-muted font-mono mt-0.5">{c.radicado || 'Sin radicar'}</div>
            </td>
            <td className="px-6 py-4">
              <span className="inline-flex items-center gap-2 bg-cream-dark px-2 py-1 rounded text-xs text-dark border border-cream-border">
                <FileText className="w-3 h-3" /> {c.type}
              </span>
            </td>
            <td className="px-6 py-4 text-muted-dark">{c.professor}</td>
            <td className="px-6 py-4 text-right">
              <Badge type={c.status}>{c.status === 'urgent' ? 'Urgente' : 'En Trámite'}</Badge>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
