import { Link, useLocation } from 'react-router-dom';
import { cn, getInitials, getRiskLabel } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import {
  LayoutDashboard, FolderOpen, ShieldCheck, Settings,
  LogOut, Bell, User, ChevronDown, Sparkles, Activity,
  FileSearch, CircleAlert, BarChart3, Gauge,
} from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'Principal',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/cases', label: 'Expedientes', icon: FolderOpen },
    ],
  },
  {
    label: 'Compliance',
    items: [
      { to: '/rules', label: 'Reglas', icon: ShieldCheck },
      { to: '/audit', label: 'Auditoría', icon: Activity },
    ],
  },
  {
    label: 'Administración',
    items: [
      { to: '/admin', label: 'Configuración', icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  return (
    <aside
      className="fixed top-0 left-0 h-full flex flex-col z-40"
      style={{ width: 'var(--sidebar-width, 260px)', background: 'hsl(222 47% 5.5%)', borderRight: '1px solid hsl(222 30% 10%)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800/80">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-900/30">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="text-sm font-bold text-slate-100 tracking-tight">Merlin</span>
          <p className="text-[10px] text-slate-500 leading-none mt-0.5">RegTech Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-1">
              {group.label}
            </p>
            {group.items.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to || location.pathname.startsWith(to + '/');
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 mb-0.5',
                    active
                      ? 'bg-blue-500/12 text-blue-400 font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60',
                  )}
                >
                  <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-blue-400' : 'text-slate-500')} />
                  {label}
                  {active && (
                    <div className="ml-auto w-1 h-4 rounded-full bg-blue-400" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Footer */}
      {user && (
        <div className="p-3 border-t border-slate-800/80">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-white">
                {getInitials(user.firstName, user.lastName)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[10px] text-slate-500 truncate">{user.role.replace(/_/g, ' ')}</p>
            </div>
            <button
              onClick={logout}
              className="p-1 rounded text-slate-600 hover:text-red-400 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
