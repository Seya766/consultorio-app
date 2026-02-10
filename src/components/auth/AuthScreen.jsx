import { useState } from 'react';
import { Scale, ArrowRight, User, KeyRound, Loader2 } from 'lucide-react';
import { loginToplatform } from '../../services/api';

export default function AuthScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginToplatform(username, password);
      onLogin({
        name: data.user.name,
        username,
        password,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex font-sans">
      {/* Lado izquierdo - Branding */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-[#0a0a0b] to-uni-blue/30" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }} />

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
            Conecta con Gestión Jurídica, visualiza tus casos y no pierdas ningún plazo importante.
          </p>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-muted-light">Conectado a unimagdalena.gestionjuridica.com</span>
          </div>
        </div>
      </div>

      {/* Lado derecho - Login */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-cream">
        <div className="w-full max-w-md">
          {/* Logo móvil */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-uni-blue rounded-lg flex items-center justify-center">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-dark">Consultorio Jurídico</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-dark mb-1">Iniciar sesión</h2>
            <p className="text-muted text-sm">
              Usa tus credenciales de <span className="font-medium text-dark">Gestión Jurídica</span> para ingresar.
            </p>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              icon={User}
              label="Usuario"
              required
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />

            <InputField
              icon={KeyRound}
              label="Contraseña"
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3.5 bg-uni-blue hover:bg-uni-blue-dark text-white font-semibold rounded-lg shadow-lg shadow-uni-blue/20 hover:shadow-uni-blue/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  Ingresar
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-muted mt-8">
            Tus credenciales se usan solo para conectar con la plataforma.<br />
            No almacenamos contraseñas.
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
          className="w-full pl-11 pr-4 py-3 bg-white border border-border-soft rounded-lg text-sm text-dark placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-uni-blue/20 focus:border-uni-blue transition-all disabled:opacity-50"
        />
      </div>
    </div>
  );
}
