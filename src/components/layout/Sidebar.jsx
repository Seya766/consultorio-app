import { Scale, LayoutDashboard, FolderOpen, CalendarDays, LogOut } from 'lucide-react';
import SidebarItem from './SidebarItem';

const NAV_ITEMS = [
  { key: 'dashboard', icon: LayoutDashboard, label: 'Inicio' },
  { key: 'cases', icon: FolderOpen, label: 'Mis Casos' },
  { key: 'calendar', icon: CalendarDays, label: 'Calendario' },
];

export default function Sidebar({ user, activeTab, onTabChange, onLogout }) {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-dark text-[#E4E4E7] sticky top-0 h-screen shadow-2xl z-20 border-r border-black">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-10">
          <Scale className="w-6 h-6 text-white" />
          <div>
            <h1 className="text-lg font-bold tracking-wide text-white">Consultorio App</h1>
            <p className="text-[10px] text-muted-light uppercase tracking-widest">U. Derecho</p>
          </div>
        </div>

        <nav className="space-y-1.5">
          {NAV_ITEMS.map((item) => (
            <SidebarItem
              key={item.key}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.key}
              onClick={() => onTabChange(item.key)}
            />
          ))}
        </nav>
      </div>

      <div className="mt-auto bg-[#18181B] p-6 border-t border-dark-light">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-dark-light rounded-full flex items-center justify-center font-bold text-white border border-dark-border">
            {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{user.name}</p>
            <p className="text-xs text-muted-lighter truncate">Estudiante</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 text-muted-light hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
        >
          <LogOut className="w-4 h-4" /> Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
