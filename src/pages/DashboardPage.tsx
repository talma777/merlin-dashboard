import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { casesApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { Card, Spinner } from '@/components/ui';
import {
  getCaseStatusColor, getCaseStatusLabel, getRiskColor, getRiskLabel, formatRelative, formatDate,
} from '@/lib/utils';
import {
  FolderOpen, AlertTriangle, CheckCircle, Clock,
  ArrowRight, Users, Sparkles, Activity, ShieldCheck, FileSearch, TrendingUp
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts';
import type { Case, CaseStatus, RiskCategory } from '@/types/domain';

// --- MOCK DATA FOR TREMOR-LIKE CHART ---
const chartData = [
  { p: 'Ene', Expedientes: 40, Aprobados: 24 },
  { p: 'Feb', Expedientes: 30, Aprobados: 13 },
  { p: 'Mar', Expedientes: 20, Aprobados: 58 },
  { p: 'Abr', Expedientes: 27, Aprobados: 39 },
  { p: 'May', Expedientes: 18, Aprobados: 48 },
  { p: 'Jun', Expedientes: 23, Aprobados: 38 },
  { p: 'Jul', Expedientes: 34, Aprobados: 43 },
];

export default function DashboardPage() {
  const user = useAuthStore(s => s.user);

  const { data: cases = [], isLoading } = useQuery<Case[]>({
    queryKey: ['cases'],
    queryFn: () => casesApi.list(),
  });

  const total     = cases.length;
  const inReview  = cases.filter(c => c.status === 'IN_REVIEW').length;
  const approved  = cases.filter(c => c.status === 'APPROVED').length;
  const critical  = cases.filter(c => c.riskCategory === 'CRITICAL' || c.riskCategory === 'HIGH').length;
  const recent    = [...cases].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 6);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="p-8 lg:p-10 space-y-10 animate-in fade-in duration-700 w-full max-w-[1600px] mx-auto">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.05]">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight leading-tight mb-2">
            {greeting}, {user?.fullName?.split(' ')[0] || 'Gestor'}
          </h1>
          <p className="text-sm text-slate-400 font-light flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
            Monitoreo en tiempo real • {formatDate(new Date().toISOString(), 'short')} 
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/cases/new"
            className="group flex items-center gap-2 h-11 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium hover:from-blue-500 hover:to-indigo-500 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] border border-blue-400/20"
          >
            <Sparkles className="w-4 h-4 text-blue-200 group-hover:scale-110 transition-transform" />
            <span>Nuevo Expediente</span>
          </Link>
        </div>
      </div>

      {/* ── KPI METRICS CARDS (GLASSMORPHISM) ── */}
      {isLoading ? (
        <div className="flex items-center gap-4 text-blue-400 font-medium py-10 justify-center">
          <Spinner size="md" /> Cargando métricas en tiempo real...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard label="Total en Plataforma" value={total} sub="Expedientes activos" icon={FolderOpen} color="blue" trend="+12%" />
          <KpiCard label="En Revisión" value={inReview} sub="Requieren atención manual" icon={Clock} color="amber" trend="+4%" />
          <KpiCard label="Aprobados" value={approved} sub="Procesados automáticamente" icon={CheckCircle} color="emerald" trend="+28%" />
          <KpiCard label="Riesgo Elevado" value={critical} sub="Casos HIGH o CRITICAL" icon={AlertTriangle} color="red" trend="-2%" />
        </div>
      )}

      {/* ── MAIN CHARTS & LISTS ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* BIG CHART AREA */}
        <div className="xl:col-span-2 space-y-6">
          <div className="p-7 rounded-[24px] bg-slate-900/40 border border-slate-800/60 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
            {/* Glow effect inside card */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <h3 className="text-lg font-semibold text-slate-100 mb-1">Volumen de Procesamiento</h3>
                <p className="text-xs text-slate-500 font-medium">Histórico de expedientes analizados vs aprobados</p>
              </div>
              <button className="px-3 py-1.5 rounded-lg bg-slate-800/50 text-xs font-medium text-slate-300 border border-slate-700/50 hover:bg-slate-700 transition-colors">
                Últimos 7 meses
              </button>
            </div>
            
            <div className="h-[320px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorApr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="p" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                    itemStyle={{ color: '#e2e8f0', fontSize: '13px' }}
                  />
                  <Area type="monotone" dataKey="Expedientes" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
                  <Area type="monotone" dataKey="Aprobados" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorApr)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* RECENT FILES WIDGET */}
        <div className="xl:col-span-1 space-y-6">
          <div className="p-7 rounded-[24px] bg-slate-900/40 border border-slate-800/60 shadow-2xl backdrop-blur-xl flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-100 mb-1">Recientes</h3>
                <p className="text-xs text-slate-500 font-medium">Última actividad en la plataforma</p>
              </div>
              <Link to="/cases" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group">
                Ver todos <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {isLoading ? (
                 <div className="flex justify-center py-10"><Spinner /></div>
              ) : recent.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3 bg-slate-800/20 rounded-xl border border-dashed border-slate-700/50">
                  <FileSearch className="w-10 h-10 opacity-40 text-blue-400" />
                  <p className="text-sm font-medium">Bandeja vacía</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recent.map((c) => (
                    <Link key={c.id} to={`/cases/${c.id}`}
                      className="group flex flex-col p-4 rounded-2xl bg-slate-800/30 border border-slate-700/40 hover:bg-slate-700/40 hover:border-blue-500/30 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg hover:shadow-blue-500/5 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/[0.03] to-transparent pointer-events-none rounded-bl-3xl" />
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                            {c.subjectType === 'LEGAL_ENTITY' ? <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> : <Users className="w-3.5 h-3.5 text-blue-400" />}
                          </div>
                          <span className="text-sm font-bold font-mono text-slate-200">
                            {c.caseNumber}
                          </span>
                        </div>
                        {c.riskCategory && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRiskColor(c.riskCategory)}`}>
                            {getRiskLabel(c.riskCategory)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md border ${getCaseStatusColor(c.status)}`}>
                          {getCaseStatusLabel(c.status)}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 group-hover:text-blue-400 transition-colors">
                          <Clock className="w-3 h-3" />
                          {formatRelative(c.updatedAt)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── COMPONENT: VIP KPI CARD
function KpiCard({ label, value, sub, icon: Icon, color, trend }: any) {
  const colorMap: any = {
    blue: "from-blue-500/20 to-indigo-600/5 text-blue-400 group-hover:from-blue-500/30 group-hover:to-indigo-600/10 border-blue-500/20 group-hover:border-blue-500/40 bg-blue-500/10",
    emerald: "from-emerald-500/20 to-teal-600/5 text-emerald-400 group-hover:from-emerald-500/30 group-hover:to-teal-600/10 border-emerald-500/20 group-hover:border-emerald-500/40 bg-emerald-500/10",
    amber: "from-amber-500/20 to-orange-600/5 text-amber-400 group-hover:from-amber-500/30 group-hover:to-orange-600/10 border-amber-500/20 group-hover:border-amber-500/40 bg-amber-500/10",
    red: "from-rose-500/20 to-red-600/5 text-rose-400 group-hover:from-rose-500/30 group-hover:to-red-600/10 border-rose-500/20 group-hover:border-rose-500/40 bg-rose-500/10",
  };
  
  const isPositive = trend.startsWith('+');

  return (
    <div className="p-6 rounded-[24px] bg-slate-900/40 border border-slate-800/60 shadow-xl backdrop-blur-xl hover:bg-slate-800/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer overflow-hidden relative">
      <div className={`absolute -right-4 -top-4 w-32 h-32 rounded-full blur-[50px] pointer-events-none transition-opacity duration-500 opacity-20 group-hover:opacity-40 bg-gradient-to-br ${colorMap[color].split(' ')[0]}`} />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <p className="text-sm font-semibold text-slate-400 group-hover:text-slate-200 transition-colors uppercase tracking-wider">{label}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 shadow-inner ${colorMap[color]}`}>
          <Icon className="w-5 h-5 drop-shadow-md" />
        </div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-end gap-3 mb-2">
          <span className="text-4xl font-black text-white tracking-tight leading-none drop-shadow-sm">{value}</span>
          {trend && (
            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 mb-1 ${isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-500'}`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend}
            </span>
          )}
        </div>
        <p className="text-[13px] font-medium text-slate-500">{sub}</p>
      </div>
    </div>
  );
}

// Minimal missing lucide icon locally implemented
function TrendingDown(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>
  );
}
