import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { casesApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { StatCard, Card, CardContent, CardHeader, CardTitle, Badge, Spinner } from '@/components/ui';
import {
  getCaseStatusColor, getCaseStatusLabel, getRiskColor, getRiskLabel,
  formatRelative, formatDate,
} from '@/lib/utils';
import {
  FolderOpen, AlertTriangle, CheckCircle, Clock,
  TrendingUp, ArrowRight, CircleDot, Users, Activity,
} from 'lucide-react';
import type { Case, CaseStatus, RiskCategory } from '@/types/domain';

export default function DashboardPage() {
  const user = useAuthStore(s => s.user);

  const { data: cases = [], isLoading } = useQuery<Case[]>({
    queryKey: ['cases'],
    queryFn: () => casesApi.list(),
  });

  // Derived stats
  const total     = cases.length;
  const inReview  = cases.filter(c => c.status === 'IN_REVIEW').length;
  const approved  = cases.filter(c => c.status === 'APPROVED').length;
  const critical  = cases.filter(c => c.riskCategory === 'CRITICAL' || c.riskCategory === 'HIGH').length;
  const recent    = [...cases].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 8);

  const byStatus: Record<string, number> = {};
  cases.forEach(c => { byStatus[c.status] = (byStatus[c.status] ?? 0) + 1; });

  const byRisk: Record<string, number> = {};
  cases.forEach(c => { if (c.riskCategory) byRisk[c.riskCategory] = (byRisk[c.riskCategory] ?? 0) + 1; });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="p-7 space-y-7 animate-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">
            {greeting}, {user?.firstName} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {formatDate(new Date().toISOString(), 'short')} — Panel de control de compliance
          </p>
        </div>
        <Link
          to="/cases/new"
          className="flex items-center gap-2 h-9 px-4 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors"
        >
          + Nuevo expediente
        </Link>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Spinner size="sm" /> Cargando estadísticas...
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total expedientes"
            value={total}
            sub="En la plataforma"
            icon={<FolderOpen className="w-5 h-5" />}
            color="blue"
          />
          <StatCard
            label="En revisión"
            value={inReview}
            sub="Pendientes de análisis"
            icon={<Clock className="w-5 h-5" />}
            color="amber"
          />
          <StatCard
            label="Aprobados"
            value={approved}
            sub="Este período"
            icon={<CheckCircle className="w-5 h-5" />}
            color="emerald"
          />
          <StatCard
            label="Alto / Crítico riesgo"
            value={critical}
            sub="Requieren atención"
            icon={<AlertTriangle className="w-5 h-5" />}
            color="red"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Cases */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Expedientes recientes</CardTitle>
                <Link to="/cases" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                  Ver todos <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner />
                </div>
              ) : recent.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-2">
                  <FolderOpen className="w-8 h-8 opacity-30" />
                  <p className="text-sm">Sin expedientes aún</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-700/40">
                  {recent.map((c) => (
                    <Link key={c.id} to={`/cases/${c.id}`}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-700/20 transition-colors group">
                      {/* Icon */}
                      <div className="w-8 h-8 rounded-lg bg-slate-700/60 flex items-center justify-center shrink-0">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-400">{c.caseNumber}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${getCaseStatusColor(c.status)}`}>
                            {getCaseStatusLabel(c.status)}
                          </span>
                          {c.subjectType === 'LEGAL_ENTITY' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded border border-purple-500/30 bg-purple-500/10 text-purple-400 font-medium">PJ</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{formatRelative(c.updatedAt)}</p>
                      </div>
                      {/* Risk */}
                      {c.riskCategory && (
                        <span className={`text-xs font-semibold ${getRiskColor(c.riskCategory)}`}>
                          {getRiskLabel(c.riskCategory)}
                        </span>
                      )}
                      <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar stats */}
        <div className="space-y-4">
          {/* By status */}
          <Card>
            <CardHeader><CardTitle>Por estado</CardTitle></CardHeader>
            <CardContent className="space-y-2.5">
              {Object.entries(byStatus).length === 0 ? (
                <p className="text-xs text-slate-500">Sin datos</p>
              ) : (
                Object.entries(byStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className={`text-[11px] px-1.5 py-0.5 rounded border font-medium ${getCaseStatusColor(status as CaseStatus)}`}>
                      {getCaseStatusLabel(status as CaseStatus)}
                    </span>
                    <span className="text-sm font-semibold text-slate-200">{count}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* By risk */}
          <Card>
            <CardHeader><CardTitle>Por riesgo</CardTitle></CardHeader>
            <CardContent className="space-y-2.5">
              {Object.entries(byRisk).length === 0 ? (
                <p className="text-xs text-slate-500">Sin scores calculados aún</p>
              ) : (
                (['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as RiskCategory[])
                  .filter(r => byRisk[r])
                  .map(r => (
                    <div key={r} className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${getRiskColor(r)}`}>
                        {getRiskLabel(r)}
                      </span>
                      <span className="text-sm font-semibold text-slate-200">{byRisk[r]}</span>
                    </div>
                  ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
