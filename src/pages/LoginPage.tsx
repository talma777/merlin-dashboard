import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { authApi } from '@/lib/api';
import { Button, Input, Label } from '@/components/ui';
import { Sparkles, Eye, EyeOff, ShieldCheck, Zap, Lock, RefreshCcw } from 'lucide-react';

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
    <div className="min-h-screen flex bg-slate-950 font-sans selection:bg-blue-500/30">
      
      {/* ── BACKGROUND GLOWS ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      {/* ── LEFT PANEL (Branding) ── */}
      <div className="hidden lg:flex flex-col justify-between w-[500px] xl:w-[600px] p-12 relative z-10 border-r border-white-[0.02] bg-slate-950/40 backdrop-blur-xl">
        <div className="relative">
          <div className="flex items-center gap-3 mb-20 animate-in slide-in-from-left duration-500">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-white/10 relative group">
              <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">Merlin</span>
          </div>

          <div className="animate-in slide-in-from-left duration-700 delay-100 fill-mode-both">
            <h1 className="text-5xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
              Compliance <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                inteligente y automatizado
              </span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-md font-light">
              Plataforma RegTech B2B de nueva generación. Automatizá, estructurá y auditá tus procesos KYC/KYB en tiempo récord.
            </p>
          </div>
        </div>

        <div className="relative space-y-6 animate-in slide-in-from-left duration-1000 delay-200 fill-mode-both">
          {[
            { icon: ShieldCheck, title: 'Normativa UIF & GAFI', desc: 'Reglas de debida diligencia pre-configuradas' },
            { icon: Zap, title: 'Extracción con IA Multimodal', desc: 'Lectura inteligente de DNIs y balances societarios' },
            { icon: RefreshCcw, title: 'Sincronización Continua', desc: 'Monitoreo dinámico de riesgo operativo' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">{title}</p>
                <p className="text-sm text-slate-500 mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL (Auth Form) ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full">
        <div className="w-full max-w-[420px] animate-in fade-in duration-700">
          
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-3 mb-12 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-white/10">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Merlin</span>
          </div>

          <div className="glass p-8 sm:p-10 rounded-3xl relative overflow-hidden shadow-2xl shadow-black/50">
            {/* Subtle glass reflection */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Iniciar sesión</h2>
            <p className="text-slate-400 text-sm mb-8 font-light">Bienvenido de vuelta. Ingresá tus credenciales.</p>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-300 font-medium text-xs uppercase tracking-wider">Email institucional</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@empresa.com"
                  autoComplete="email"
                  required
                  className="bg-slate-900/50 border-slate-700/50 focus:border-blue-500/50 focus:ring-blue-500/20 h-11 transition-all"
                />
              </div>
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-300 font-medium text-xs uppercase tracking-wider">Contraseña</Label>
                  <a href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">¿Olvidaste tu contraseña?</a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="bg-slate-900/50 border-slate-700/50 focus:border-blue-500/50 focus:ring-blue-500/20 h-11 transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 flex items-center gap-2 animate-in fade-in">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-11 text-base font-medium bg-white text-slate-900 hover:bg-slate-200 transition-all rounded-xl mt-2 relative overflow-hidden group" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                    <span>Verificando...</span>
                  </div>
                ) : (
                  <span>Ingresar a la plataforma</span>
                )}
                <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/[0.05]">
              <div className="flex flex-col items-center justify-center gap-2 text-xs text-slate-500">
                <p>Credenciales de Demo</p>
                <div className="px-3 py-1.5 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center gap-2 font-mono text-slate-400">
                  <span>admin@merlin.com</span>
                  <span className="text-slate-600">|</span>
                  <span>Admin1234!</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500 font-light">&copy; {new Date().getFullYear()} Merlin RegTech. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
