import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { authApi } from '@/lib/api';
import { Button, Input, Label } from '@/components/ui';
import { Sparkles, Eye, EyeOff, ShieldCheck, Zap, Lock } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('admin@merlin.com');
  const [password, setPassword] = useState('Admin1234!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { accessToken, refreshToken, user } = await authApi.login(email, password);
      setAuth(user, accessToken, refreshToken);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Credenciales inválidas. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'hsl(222 47% 4%)' }}>
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, hsl(222 47% 7%) 0%, hsl(240 40% 9%) 100%)' }}>
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-blue-600/8 blur-3xl" />
          <div className="absolute bottom-20 right-0 w-64 h-64 rounded-full bg-purple-600/8 blur-3xl" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl shadow-blue-900/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Merlin</span>
          </div>

          <h1 className="text-3xl font-bold text-white leading-tight mb-4">
            Compliance normativo<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              inteligente y trazable
            </span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Plataforma RegTech para automatizar, estructurar y auditar procesos de compliance KYC/KYB según normativa UIF, BCRA y GAFI.
          </p>
        </div>

        <div className="relative space-y-4">
          {[
            { icon: ShieldCheck, title: 'Normativa argentina', desc: 'UIF Res. 30/2017, BCRA COM A 6859, GAFI' },
            { icon: Zap, title: 'Extracción con IA', desc: 'Gemini Vision para DNI, CUIT, estados contables' },
            { icon: Lock, title: 'Auditoría inmutable', desc: 'Log completo de cada acción del sistema' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-700/60 border border-slate-600/30 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-200">{title}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[380px] animate-in">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-white">Merlin</span>
          </div>

          <h2 className="text-xl font-semibold text-white mb-1">Iniciar sesión</h2>
          <p className="text-sm text-slate-500 mb-8">Ingresá con tus credenciales institucionales</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@empresa.com"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full mt-2" loading={loading}>
              Ingresar
            </Button>
          </form>

          {/* Hint */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-xs text-slate-600 text-center">
              Demo: admin@merlin.com / <span className="font-mono">Admin1234!</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
