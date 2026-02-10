import { useState } from 'react';
import { Scale } from 'lucide-react';

const CLINICS = [
  { value: 'I', label: 'I - Civil/Familia' },
  { value: 'II', label: 'II - Penal' },
  { value: 'III', label: 'III - Público' },
  { value: 'IV', label: 'IV - Laboral' },
];

const INITIAL_FORM = { name: '', code: '', semester: '', clinic: '' };

export default function AuthScreen({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(true);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const update = (field) => (e) =>
    setFormData({ ...formData, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegistering && (!formData.name || !formData.semester || !formData.clinic)) {
      alert('Por favor completa tu perfil de estudiante.');
      return;
    }
    onLogin({
      name: formData.name || 'Estudiante',
      semester: formData.semester || '7',
      clinic: formData.clinic || 'I',
    });
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-xl overflow-hidden flex flex-col md:flex-row border border-border-soft">
        {/* Panel izquierdo */}
        <div className="md:w-2/5 bg-dark p-10 flex flex-col justify-between text-white relative">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Scale className="w-8 h-8 text-white" />
              <h1 className="text-2xl font-bold tracking-tight">Consultorio App</h1>
            </div>
            <p className="text-muted-light text-sm leading-relaxed">
              Gestión académica y seguimiento de casos para estudiantes de derecho.
            </p>
          </div>
          <div className="relative z-10 text-xs text-muted-dark">
            Portal del Estudiante
          </div>
        </div>

        {/* Panel derecho */}
        <div className="md:w-3/5 p-10 md:p-14">
          <h2 className="text-2xl font-bold text-dark mb-2">
            {isRegistering ? 'Registro de Estudiante' : 'Iniciar Sesión'}
          </h2>
          <p className="text-muted text-sm mb-8">
            {isRegistering
              ? 'Configura tus datos del semestre actual.'
              : 'Ingresa con tu código estudiantil.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegistering && (
              <Field label="Nombre Completo">
                <input
                  required
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={update('name')}
                />
              </Field>
            )}

            <Field label="Código Estudiantil / Usuario">
              <input
                required
                type="text"
                className="form-input"
                value={formData.code}
                onChange={update('code')}
              />
            </Field>

            {!isRegistering && (
              <Field label="Contraseña">
                <input type="password" className="form-input" />
              </Field>
            )}

            {isRegistering && (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Semestre">
                  <select
                    required
                    className="form-input"
                    value={formData.semester}
                    onChange={update('semester')}
                  >
                    <option value="" disabled>Seleccionar...</option>
                    {Array.from({ length: 10 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}º Semestre</option>
                    ))}
                  </select>
                </Field>
                <Field label="Consultorio">
                  <select
                    required
                    className="form-input"
                    value={formData.clinic}
                    onChange={update('clinic')}
                  >
                    <option value="" disabled>Seleccionar...</option>
                    {CLINICS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </Field>
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-3 bg-uni-blue hover:bg-uni-blue-dark text-white font-medium rounded shadow-sm transition-all"
              >
                {isRegistering ? 'Comenzar Semestre' : 'Ingresar'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center border-t border-cream-border pt-6">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm text-uni-blue hover:underline font-medium"
            >
              {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿Eres nuevo? Regístrate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-bold text-dark uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}
