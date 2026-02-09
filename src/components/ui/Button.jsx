const VARIANTS = {
  primary: 'bg-uni-blue text-white hover:shadow-md border border-transparent',
  secondary: 'bg-white text-dark border border-border-soft hover:bg-cream-dark hover:border-uni-blue',
  ghost: 'bg-transparent text-muted hover:text-dark hover:bg-cream-border',
};

export default function Button({ children, onClick, type, variant = 'primary', className = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-5 py-2.5 rounded-md font-medium text-sm transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
