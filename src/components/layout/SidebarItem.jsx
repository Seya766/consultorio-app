export default function SidebarItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded text-sm transition-all duration-200 group ${
        active
          ? 'bg-dark-light text-white border-l-2 border-uni-blue'
          : 'text-muted-light hover:bg-dark-light hover:text-white border-l-2 border-transparent'
      }`}
    >
      <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-muted-dark group-hover:text-white transition-colors'}`} />
      <span className="font-medium tracking-wide">{label}</span>
    </button>
  );
}
