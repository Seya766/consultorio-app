export default function Modal({ title, open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-cream w-full max-w-lg shadow-2xl rounded-none border-t-4 border-uni-blue p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-dark"
        >
          Cerrar X
        </button>

        <h3 className="text-xl font-bold text-dark mb-6 border-b border-border-soft pb-2">
          {title}
        </h3>

        {children}
      </div>
    </div>
  );
}
