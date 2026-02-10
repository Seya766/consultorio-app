import { Scale, LogOut } from 'lucide-react';

export default function MobileHeader({ onLogout }) {
  return (
    <header className="md:hidden flex justify-between items-center mb-8 border-b border-border-soft pb-4">
      <div className="flex items-center gap-2 font-bold text-lg">
        <Scale className="w-6 h-6 text-dark" /> Consultorio
      </div>
      <button onClick={onLogout}>
        <LogOut className="w-5 h-5 text-muted" />
      </button>
    </header>
  );
}
