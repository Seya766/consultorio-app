import { FolderOpen, Clock, Bell, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import Card from '../ui/Card';

export default function DashboardView({ user, data, loading }) {
  const { tasks = [], consultas = [], procesos = [] } = data;
  const pendingTasks = tasks.filter((t) => !t.resolved);
  const resolvedTasks = tasks.filter((t) => t.resolved);

  return (
    <div className="space-y-8">
      <div className="border-b border-border-soft pb-6">
        <span className="text-uni-blue text-xs font-bold uppercase tracking-widest mb-1 block">
          Panel de Control
        </span>
        <h2 className="text-3xl font-bold text-dark">Hola, {user.name.split(' ')[0]}</h2>
        <p className="text-muted mt-1">Resumen de tu práctica jurídica.</p>
      </div>

      {loading && (
        <div className="flex items-center gap-3 px-4 py-3 bg-uni-blue/5 border border-uni-blue/20 rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin text-uni-blue" />
          <span className="text-sm text-uni-blue font-medium">Cargando datos de Gestión Jurídica...</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-dark">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-muted text-xs font-bold uppercase tracking-wide">Tareas</h3>
            <Bell className="w-4 h-4 text-dark" />
          </div>
          <span className="text-3xl font-bold text-dark">{tasks.length}</span>
          <span className="text-xs text-muted ml-2">{pendingTasks.length} pendientes</span>
        </Card>

        <Card className="border-l-4 border-l-uni-blue">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-uni-blue text-xs font-bold uppercase tracking-wide">Consultas</h3>
            <FolderOpen className="w-4 h-4 text-uni-blue" />
          </div>
          <span className="text-3xl font-bold text-uni-blue">{consultas.length}</span>
        </Card>

        <Card className="border-l-4 border-l-[#4A3C88]">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-[#4A3C88] text-xs font-bold uppercase tracking-wide">Procesos</h3>
            <Clock className="w-4 h-4 text-[#4A3C88]" />
          </div>
          <span className="text-3xl font-bold text-[#4A3C88]">{procesos.length}</span>
        </Card>

        <Card className="border-l-4 border-l-green-600">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-green-700 text-xs font-bold uppercase tracking-wide">Resueltas</h3>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <span className="text-3xl font-bold text-green-700">{resolvedTasks.length}</span>
        </Card>
      </div>

      {/* Pending tasks */}
      <div>
        <h3 className="text-xl font-bold text-dark mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Tareas pendientes
        </h3>

        {pendingTasks.length === 0 && !loading ? (
          <div className="text-center py-12 border border-dashed border-border-soft rounded-lg">
            <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
            <p className="text-muted font-medium">No tienes tareas pendientes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingTasks.map((task, i) => (
              <div key={task.code + '-' + i} className="bg-white border border-border-soft rounded-lg p-4 hover:border-uni-blue transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono text-xs bg-cream-dark px-2 py-1 rounded text-muted">{task.code}</span>
                  <span className="text-xs text-red-600 font-semibold">{task.dueDate}</span>
                </div>
                <p className="text-sm text-dark font-medium mb-2">{task.description}</p>
                <p className="text-xs text-muted">Creado por: {task.createdBy} &middot; {task.creationDate}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
