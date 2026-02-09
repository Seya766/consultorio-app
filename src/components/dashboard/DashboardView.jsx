import { FolderOpen, Clock, Bell, BookOpen } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import CasesTable from '../cases/CasesTable';

export default function DashboardView({ user, cases, onOpenModal }) {
  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="border-b border-border-soft pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <span className="text-uni-blue text-xs font-bold uppercase tracking-widest mb-1 block">
            Panel de Control
          </span>
          <h2 className="text-3xl font-bold text-dark">Hola, {user.name.split(' ')[0]}</h2>
          <p className="text-muted mt-1">Aquí tienes el resumen de tu práctica jurídica.</p>
        </div>
        <div className="flex gap-3 text-sm font-medium text-dark">
          <div className="bg-[#EAEAE5] px-4 py-2 rounded flex flex-col items-center">
            <span className="text-[10px] text-muted uppercase tracking-wide">Nivel</span>
            <span className="font-bold text-lg leading-none">{user.semester}º</span>
          </div>
          <div className="bg-[#EAEAE5] px-4 py-2 rounded flex flex-col items-center min-w-[100px]">
            <span className="text-[10px] text-muted uppercase tracking-wide">Área</span>
            <span className="font-bold text-lg leading-none">{user.clinic}</span>
          </div>
        </div>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-dark">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-muted text-xs font-bold uppercase tracking-wide">Casos Asignados</h3>
            <FolderOpen className="w-5 h-5 text-dark" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-dark">{cases.length}</span>
            <span className="text-sm text-muted">Activos</span>
          </div>
        </Card>

        <Card className="border-l-4 border-l-uni-blue">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-uni-blue text-xs font-bold uppercase tracking-wide">Próximos Vencimientos</h3>
            <Clock className="w-5 h-5 text-uni-blue" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-uni-blue">0</span>
            <span className="text-sm text-uni-blue font-medium">Esta semana</span>
          </div>
        </Card>

        <Card className="bg-dark border-none text-white">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-muted-light text-xs font-bold uppercase tracking-wide">Mensajes del Docente</h3>
            <Bell className="w-5 h-5 text-white" />
          </div>
          <p className="text-sm italic leading-relaxed text-muted-light">
            No tienes mensajes nuevos de tus tutores.
          </p>
        </Card>
      </div>

      {/* Tabla de casos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-dark">Mis Asignaciones</h3>
        </div>

        <div className="bg-white border border-border-soft rounded-lg overflow-hidden">
          {cases.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-cream-dark rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-muted-light" />
              </div>
              <h3 className="text-lg font-bold text-dark">Sin casos asignados</h3>
              <p className="text-muted max-w-sm mx-auto mb-6">
                Aún no has registrado ningún caso para este consultorio.
              </p>
              <Button onClick={onOpenModal}>Registrar Caso</Button>
            </div>
          ) : (
            <CasesTable cases={cases} />
          )}
        </div>
      </div>
    </div>
  );
}
