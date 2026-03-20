import { Link, useLocation } from 'react-router-dom';
import { cn, getInitials } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import {
  LayoutDashboard, FolderOpen, ShieldCheck, Settings,
  LogOut, Activity, Users, Sparkles, Navigation2
} from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'Workspace',
    items: [
      { to: '/dashboard', label: 'Panorama', icon: LayoutDashboard },
      { to: '/cases', label: 'Lista de Expedientes', icon: FolderOpen },
    ],
  },
  {
    label: 'Risk & Compliance',
    items: [
      { to: '/rules', label: 'Matrices de Riesgo', icon: ShieldCheck },
      { to: '/audit', label: 'Logs Analíticos', icon: Activity },
    ],
  },
  {
    label: 'Team Administration',
    items: [
      { to: '/admin', label: 'Configuración General', icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  return (
    <aside
      className="fixed top-0 left-0 h-full flex flex-col z-40 bg-slate-950/80 backdrop-blur-3xl border-r border-slate-800/60 shadow-2xl transition-all duration-300"
      style={{ width: 'var(--sidebar-width, 280px)' }}
    >
      {/* ── LOGO & BRANDING ── */}
      <div className="flex flex-col gap-2 p-6 border-b border-slate-800/40 relative overflow-hidden">
        {/* Subtle glass glow in the corner */}
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-blue-500/20 blur-2xl rounded-full pointer-events-none" />
        
        <div className="flex items-center gap-3 relative z-10 w-full">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-white/10 shrink-0">
            <Sparkles className="w-5 h-5 text-white animate-pulse-slow" />
          </div>
          <div className="min-w-0">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300 tracking-tight leading-none block truncate">
              Merlin
            </span>
            <span className="text-[11px] font-medium text-blue-400 uppercase tracking-widest mt-1 block truncate">
              RegTech Platform
            </span>
          </div>
        </div>
      </div>

      {/* ── NAVIGATION BLOCKS ── */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-8">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-3 flex items-center gap-2">
              <span className="w-2 h-px bg-slate-700" />
              {group.label}
            </p>
            <div className="flex flex-col gap-1">
              {group.items.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to || location.pathname.startsWith(to + '/');
                return (
                  <Link
                    key={to}
                    to={to}
                    className={cn(
                      'group flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 relative overflow-hidden',
                      active
                        ? 'text-blue-50 bg-blue-500/15 border border-blue-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent hover:border-slate-800/60'
                    )}
                  >
                    <Icon className={cn(
                      'w-[18px] h-[18px] shrink-0 transition-all duration-300', 
                      active ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300 group-hover:scale-110'
                    )} />
                    
                    <span className="flex-1 min-w-0 truncate">{label}</span>
                    
                    {active && (
                      <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-l-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── USER PROFILE WIDGET ── */}
      {user && (
        <div className="p-4 border-t border-slate-800/40 bg-slate-900/10">
          <div className="relative p-0.5 rounded-2xl overflow-hidden group">
            {/* Animated hover gradient border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
            
            <div className="relative flex items-center gap-3 p-3 rounded-[14px] bg-slate-950/50 hover:bg-slate-900/80 transition-all duration-300 border border-slate-800/60 group-hover:border-slate-700/80">
              
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-inner overflow-hidden relative">
                <span className="text-xs font-bold text-white z-10 shadow-black/50 drop-shadow-md">
                  {getInitials(user?.fullName?.split(' ')[0] || 'A', user?.fullName?.split(' ')[1] || 'M')}
                </span>
                <div className="absolute bottom-0 w-full h-1/2 bg-black/20" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-200 truncate group-hover:text-white transition-colors">
                  {user?.fullName?.split(' ')[0] || 'Usuario'}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 truncate mt-0.5 font-medium">
                  {user.role.replace(/_/g, ' ')}
                </p>
              </div>
              
              <button
                onClick={logout}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-800/50 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
