const COLORS = {
  active: 'bg-[#E8F5E9] text-[#1B5E20] border-[#C8E6C9]',
  pending: 'bg-[#FFF8E1] text-[#F57F17] border-[#FFE082]',
  urgent: 'bg-[#FFEBEE] text-[#B71C1C] border-[#FFCDD2]',
};

export default function Badge({ children, type = 'active' }) {
  return (
    <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${COLORS[type] || COLORS.active}`}>
      {children}
    </span>
  );
}
