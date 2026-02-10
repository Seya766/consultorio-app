import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, Bell, Scale, FolderOpen, Loader2 } from 'lucide-react';

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function parseDate(str) {
  if (!str) return null;
  // "24 Feb, 2025. 10:34 AM" or "Fecha de vencimiento: ..."
  const cleaned = str.replace('Fecha de vencimiento: ', '').replace('Fecha de creacion: ', '').trim();
  const d = new Date(cleaned);
  if (!isNaN(d.getTime())) return d;

  // Try Spanish months: "24 Feb, 2025" or "06 Novi, 2025"
  const monthMap = {
    'Ene': 0, 'Feb': 1, 'Mar': 2, 'Abr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Ago': 7, 'Sep': 8, 'Oct': 9, 'Novi': 10, 'Nov': 10, 'Dic': 11,
  };
  const match = cleaned.match(/(\d{1,2})\s+(\w+),?\s*(\d{4})/);
  if (match) {
    const day = parseInt(match[1]);
    const month = monthMap[match[2]];
    const year = parseInt(match[3]);
    if (month !== undefined) return new Date(year, month, day);
  }
  return null;
}

function toKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function CalendarView({ data, loading }) {
  const { tasks = [], consultas = [], procesos = [] } = data;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // Build events map: dateKey -> [{label, type, color, icon}]
  const eventsMap = useMemo(() => {
    const map = {};
    const addEvent = (dateStr, event) => {
      const d = parseDate(dateStr);
      if (!d) return;
      const key = toKey(d);
      if (!map[key]) map[key] = [];
      map[key].push(event);
    };

    tasks.forEach((t) => {
      addEvent(t.dueDate, {
        label: t.description || t.code,
        code: t.code,
        detail: `Vence: ${t.dueDate}`,
        type: 'tarea',
        color: t.resolved ? 'bg-green-500' : 'bg-amber-500',
        resolved: t.resolved,
        createdBy: t.createdBy,
      });
    });

    consultas.forEach((c) => {
      addEvent(c.createdAt, {
        label: c.client || c.code,
        code: c.code,
        detail: c.area || 'Consulta jurídica',
        type: 'consulta',
        color: 'bg-uni-blue',
        status: c.status,
      });
    });

    procesos.forEach((p) => {
      addEvent(p.createdAt, {
        label: p.client || p.code,
        code: p.code,
        detail: p.area || 'Proceso jurídico',
        type: 'proceso',
        color: 'bg-[#4A3C88]',
        status: p.status,
      });
    });

    return map;
  }, [tasks, consultas, procesos]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calendar grid
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday-based
  const totalDays = lastDay.getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const today = toKey(new Date());
  const selectedKey = selectedDate ? toKey(selectedDate) : null;
  const selectedEvents = selectedKey ? (eventsMap[selectedKey] || []) : [];

  // Count total events
  const totalEvents = Object.values(eventsMap).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="space-y-6">
      <div className="border-b border-border-soft pb-4">
        <h2 className="text-2xl font-bold text-dark">Calendario</h2>
        <p className="text-sm text-muted">
          Tareas, consultas y procesos sincronizados.
          {totalEvents > 0 && <span className="ml-1 font-medium text-uni-blue">{totalEvents} eventos</span>}
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-3 px-4 py-3 bg-uni-blue/5 border border-uni-blue/20 rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin text-uni-blue" />
          <span className="text-sm text-uni-blue font-medium">Cargando...</span>
        </div>
      )}

      {/* Calendar Header */}
      <div className="bg-white border border-border-soft rounded-lg shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-border-soft">
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="p-1.5 hover:bg-cream-dark rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-dark" />
            </button>
            <h3 className="text-lg font-bold text-dark min-w-[200px] text-center">
              {MONTHS[month]} {year}
            </h3>
            <button onClick={nextMonth} className="p-1.5 hover:bg-cream-dark rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5 text-dark" />
            </button>
          </div>
          <button onClick={goToday} className="text-xs font-bold text-uni-blue hover:underline">
            Hoy
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border-soft">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs font-bold text-muted uppercase py-3">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {/* Empty cells before first day */}
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-border-soft/50 bg-cream/30" />
          ))}

          {/* Day cells */}
          {Array.from({ length: totalDays }).map((_, i) => {
            const day = i + 1;
            const dateKey = toKey(new Date(year, month, day));
            const dayEvents = eventsMap[dateKey] || [];
            const isToday = dateKey === today;
            const isSelected = dateKey === selectedKey;

            return (
              <div
                key={day}
                onClick={() => setSelectedDate(new Date(year, month, day))}
                className={`min-h-[80px] border-b border-r border-border-soft/50 p-1.5 cursor-pointer transition-colors ${
                  isSelected ? 'bg-uni-blue/5 ring-2 ring-uni-blue ring-inset' : 'hover:bg-cream-dark/50'
                }`}
              >
                <span className={`inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full ${
                  isToday ? 'bg-uni-blue text-white font-bold' : 'text-dark'
                }`}>
                  {day}
                </span>
                <div className="mt-0.5 space-y-0.5">
                  {dayEvents.slice(0, 3).map((ev, j) => (
                    <div key={j} className={`${ev.color} text-white text-[10px] font-medium px-1.5 py-0.5 rounded truncate`}>
                      {ev.code}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-[10px] text-muted font-medium">+{dayEvents.length - 3} más</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 flex-wrap text-xs">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-500" /> Tarea pendiente</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-500" /> Tarea resuelta</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-uni-blue" /> Consulta</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#4A3C88]" /> Proceso</span>
      </div>

      {/* Selected day events */}
      {selectedDate && (
        <div className="bg-white border border-border-soft rounded-lg p-5">
          <h4 className="font-bold text-dark mb-3">
            {selectedDate.getDate()} de {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
          </h4>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-muted">Sin eventos para este día.</p>
          ) : (
            <div className="space-y-3">
              {selectedEvents.map((ev, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-cream rounded-lg">
                  <div className={`w-1 self-stretch rounded-full ${ev.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {ev.type === 'tarea' && <Bell className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                      {ev.type === 'consulta' && <FolderOpen className="w-3.5 h-3.5 text-uni-blue flex-shrink-0" />}
                      {ev.type === 'proceso' && <Scale className="w-3.5 h-3.5 text-[#4A3C88] flex-shrink-0" />}
                      <span className="font-mono text-xs text-muted">{ev.code}</span>
                      <span className="text-[10px] uppercase font-bold text-muted bg-cream-dark px-1.5 py-0.5 rounded">{ev.type}</span>
                    </div>
                    <p className="text-sm font-medium text-dark truncate">{ev.label}</p>
                    <p className="text-xs text-muted">{ev.detail}</p>
                    {ev.createdBy && <p className="text-xs text-muted">Por: {ev.createdBy}</p>}
                    {ev.status && <p className="text-xs text-muted">Estado: {ev.status}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
