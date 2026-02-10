import { FolderOpen, Scale, Loader2, FileText, MessageSquare } from 'lucide-react';

export default function CasesView({ data, loading }) {
  const { tasks = [], consultas = [], procesos = [] } = data;

  return (
    <div className="space-y-8">
      <div className="border-b border-border-soft pb-4">
        <h2 className="text-2xl font-bold text-dark">Mis Casos</h2>
        <p className="text-sm text-muted">Consultas, procesos y tareas de Gestión Jurídica.</p>
      </div>

      {loading && (
        <div className="flex items-center gap-3 px-4 py-3 bg-uni-blue/5 border border-uni-blue/20 rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin text-uni-blue" />
          <span className="text-sm text-uni-blue font-medium">Cargando...</span>
        </div>
      )}

      {/* Consultas */}
      <Section title="Consultas jurídicas" icon={FolderOpen} count={consultas.length}>
        {consultas.map((c) => (
          <ItemCard key={c.id} code={c.code} type="Consulta" status={c.status} statusDetail={c.statusDetail} client={c.client} area={c.area} asesor={c.asesor} createdAt={c.createdAt} updatedAt={c.updatedAt} />
        ))}
      </Section>

      {/* Procesos */}
      <Section title="Procesos jurídicos" icon={Scale} count={procesos.length}>
        {procesos.map((p) => (
          <ItemCard key={p.id} code={p.code} type="Proceso" status={p.status} statusDetail={p.statusDetail} client={p.client} area={p.area} asesor={p.asesor} createdAt={p.createdAt} updatedAt={p.updatedAt} contraparte={p.contraparte} />
        ))}
      </Section>

      {/* Tareas */}
      <Section title="Tareas / Notificaciones" icon={MessageSquare} count={tasks.length}>
        {tasks.map((t, i) => (
          <div key={t.code + '-' + i} className="bg-white border border-border-soft rounded-lg p-5 hover:border-uni-blue transition-colors">
            <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
              <span className="font-mono text-xs bg-cream-dark px-2 py-1 rounded text-muted">{t.code}</span>
              <div className="flex gap-2 flex-wrap">
                <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded border ${
                  t.resolved
                    ? 'bg-[#E8F5E9] text-[#1B5E20] border-[#C8E6C9]'
                    : 'bg-[#FFF8E1] text-[#F57F17] border-[#FFE082]'
                }`}>
                  {t.status}
                </span>
              </div>
            </div>
            <p className="text-sm text-dark font-medium mb-2">{t.description}</p>
            <div className="flex justify-between text-xs text-muted flex-wrap gap-1">
              <span>Creado por: {t.createdBy}</span>
              <span>Vence: {t.dueDate}</span>
            </div>
            {t.responses.length > 0 && (
              <div className="mt-3 pt-3 border-t border-cream-border space-y-2">
                <p className="text-xs font-bold text-muted uppercase">Respuestas ({t.responses.length})</p>
                {t.responses.map((r, j) => (
                  <div key={j} className="bg-cream-dark rounded p-3 text-xs">
                    <span className="font-bold text-dark">{r.author}</span>
                    <span className="text-muted ml-2">{r.date}</span>
                    <p className="mt-1 text-dark">{r.detail}</p>
                    {r.files.map((f, k) => (
                      <a key={k} href={f.url} target="_blank" rel="noopener noreferrer" className="text-uni-blue hover:underline flex items-center gap-1 mt-1">
                        <FileText className="w-3 h-3" /> {f.name}
                      </a>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </Section>
    </div>
  );
}

function Section({ title, icon: Icon, count, children }) {
  return (
    <div>
      <h3 className="text-lg font-bold text-dark mb-3 flex items-center gap-2">
        <Icon className="w-5 h-5 text-muted" />
        {title}
        <span className="text-sm font-normal text-muted">({count})</span>
      </h3>
      {count === 0 ? (
        <div className="text-center py-10 border border-dashed border-border-soft rounded-lg">
          <p className="text-muted text-sm">Sin {title.toLowerCase()} registrados</p>
        </div>
      ) : (
        <div className="space-y-3">{children}</div>
      )}
    </div>
  );
}

function ItemCard({ code, type, status, statusDetail, client, area, asesor, createdAt, updatedAt, contraparte }) {
  const isActive = status?.toLowerCase() === 'activo';
  return (
    <div className="bg-white border border-border-soft rounded-lg p-5 hover:border-uni-blue transition-colors">
      <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs bg-cream-dark px-2 py-1 rounded text-muted">{code}</span>
          <span className="text-[10px] font-bold uppercase text-[#4A3C88] bg-[#4A3C88]/10 px-2 py-0.5 rounded">{type}</span>
        </div>
        {status && (
          <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded border ${
            isActive
              ? 'bg-[#E8F5E9] text-[#1B5E20] border-[#C8E6C9]'
              : 'bg-gray-100 text-gray-600 border-gray-200'
          }`}>
            {statusDetail || status}
          </span>
        )}
      </div>
      {client && <p className="text-sm font-medium text-dark">{client}</p>}
      {contraparte && <p className="text-xs text-muted">vs. {contraparte}</p>}
      {area && <p className="text-xs text-uni-blue mt-1">{area}</p>}
      <div className="flex justify-between text-xs text-muted mt-2 flex-wrap gap-1">
        {asesor && <span>Asesor: {asesor}</span>}
        {createdAt && <span>{createdAt}</span>}
      </div>
    </div>
  );
}
