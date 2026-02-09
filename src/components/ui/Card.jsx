export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-white border border-cream-border shadow-sm rounded-lg p-6 ${className}`}>
      {children}
    </div>
  );
}
