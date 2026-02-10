import { useState } from 'react';
import { Scale, ArrowRight, User, KeyRound, Hash, BookOpen, Building2 } from 'lucide-react';

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
    <div className="min-h-screen bg-dark flex font-sans">
      {/* Lado izquierdo - Branding */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-12">
        {/* Fondo con patrón */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-[#0a0a0b] to-uni-blue/30" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }} />

        {/* Logo y título */}
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-16">
            <div className="w-12 h-12 bg-uni-blue rounded-xl flex items-center justify-center">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Consultorio</h1>
              <p className="text-[11px] text-muted-light uppercase tracking-[0.2em]">Jurídico</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mb-6">
            Tu práctica jurídica,<br />
            <span className="text-uni-blue">organizada.</span>
          </h2>
          <p className="text-muted-light text-base leading-relaxed max-w-sm">
            Gestiona tus casos, cumple tus plazos y lleva el control de tu consultorio desde un solo lugar.
          </p>
        </div>

        {/* Stats decorativas */}
        <div className="relative z-10 flex gap-8">
          <div>
            <div className="text-2xl font-bold text-white">4</div>
            <div className="text-xs text-muted-light">Consultorios</div>
          </div>
          <div className="w-px bg-dark-border" />
          <div>
            <div className="text-2xl font-bold text-white">10</div>
            <div className="text-xs text-muted-light">Semestres</div>
          </div>
          <div className="w-px bg-dark-border" />
          <div>
            <div className="text-2xl font-bold text-white">100%</div>
            <div className="text-xs text-muted-light">Digital</div>
          </div>
        </div>
      </div>

      {/* Lado derecho - Formulario */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-cream">
        <div className="w-full max-w-md">
          {/* Logo móvil */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-uni-blue rounded-lg flex items-center justify-center">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-dark">Consultorio Jurídico</span>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white rounded-lg p-1 mb-8 border border-border-soft">
            <button
              onClick={() => setIsRegistering(true)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all ${
                isRegistering
                  ? 'bg-uni-blue text-white shadow-sm'
                  : 'text-muted hover:text-dark'
              }`}
            >
              Registro
            </button>
            <button
              onClick={() => setIsRegistering(false)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all ${
                !isRegistering
                  ? 'bg-uni-blue text-white shadow-sm'
                  : 'text-muted hover:text-dark'
              }`}
            >
              Iniciar sesión
            </button>
          </div>

          {/* Título del form */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-dark mb-1">
              {isRegistering ? 'Crea tu perfil' : 'Bienvenido de vuelta'}
            </h2>
            <p className="text-muted text-sm">
              {isRegistering
                ? 'Completa tus datos para acceder al sistema.'
                : 'Ingresa tus credenciales para continuar.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <InputField
                icon={User}
                label="Nombre completo"
                required
                type="text"
                value={formData.name}
                onChange={update('name')}
              />
            )}

            <InputField
              icon={Hash}
              label="Código estudiantil"
              required
              type="text"
              value={formData.code}
              onChange={update('code')}
            />

            {!isRegistering && (
              <InputField
                icon={KeyRound}
                label="Contraseña"
                type="password"
              />
            )}

            {isRegistering && (
              <div className="grid grid-cols-2 gap-3">
                <SelectField
                  icon={BookOpen}
                  label="Semestre"
                  required
                  value={formData.semester}
                  onChange={update('semester')}
                >
                  <option value="" disabled>Elegir...</option>
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}º</option>
                  ))}
                </SelectField>

                <SelectField
                  icon={Building2}
                  label="Consultorio"
                  required
                  value={formData.clinic}
                  onChange={update('clinic')}
                >
                  <option value="" disabled>Elegir...</option>
                  {CLINICS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </SelectField>
              </div>
            )}

            <button
              type="submit"
              className="w-full mt-6 py-3.5 bg-uni-blue hover:bg-uni-blue-dark text-white font-semibold rounded-lg shadow-lg shadow-uni-blue/20 hover:shadow-uni-blue/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              {isRegistering ? 'Crear cuenta' : 'Ingresar'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>

          <p className="text-center text-xs text-muted mt-8">
            Consultorio Jurídico &middot; Facultad de Derecho
          </p>
        </div>
      </div>
    </div>
  );
}

function InputField({ icon: Icon, label, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-dark mb-1.5 ml-1">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-light pointer-events-none" />
        <input
          {...props}
          className="w-full pl-11 pr-4 py-3 bg-white border border-border-soft rounded-lg text-sm text-dark placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-uni-blue/20 focus:border-uni-blue transition-all"
        />
      </div>
    </div>
  );
}

function SelectField({ icon: Icon, label, children, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-dark mb-1.5 ml-1">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-light pointer-events-none" />
        <select
          {...props}
          className="w-full pl-11 pr-4 py-3 bg-white border border-border-soft rounded-lg text-sm text-dark appearance-none focus:outline-none focus:ring-2 focus:ring-uni-blue/20 focus:border-uni-blue transition-all"
        >
          {children}
        </select>
      </div>
    </div>
  );
}
