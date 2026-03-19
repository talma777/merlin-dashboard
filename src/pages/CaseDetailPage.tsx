import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  casesApi, documentsApi, extractionApi, profilingApi,
  rulesApi, screeningApi, scoringApi, capacityApi,
} from '@/lib/api';
import {
  Card, CardHeader, CardTitle, CardContent, CardFooter,
  Button, Badge, Spinner, Alert, EmptyState, ProgressBar, StatCard, Textarea,
} from '@/components/ui';
import {
  getCaseStatusColor, getCaseStatusLabel, getRiskColor, getRiskLabel,
  getActionLabel, getActionColor, getSeverityColor, getSeverityLabel,
  formatCurrency, formatDate, formatRelative, formatFileSize, getConfidenceColor,
} from '@/lib/utils';
import {
  ArrowLeft, FileUp, ChevronRight, RotateCcw, CheckCircle,
  AlertTriangle, ShieldAlert, BarChart3, Gauge, FileText,
  Users, Building2, CheckCircle2, XCircle, Clock, Zap,
  CircleAlert, Info, Activity, Upload, Eye,
} from 'lucide-react';
import type { Case, CaseDocument, FindingsSummary, RiskScore, OperationalCapacity, ScreeningReport } from '@/types/domain';

type Tab = 'overview' | 'documents' | 'extraction' | 'profile' | 'findings' | 'screening' | 'score' | 'capacity';

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'overview',   label: 'Resumen',    icon: LayoutGrid },
  { id: 'documents',  label: 'Documentos', icon: FileUp },
  { id: 'extraction', label: 'Extracción', icon: Zap },
  { id: 'profile',    label: 'Perfil',     icon: Users },
  { id: 'findings',   label: 'Hallazgos',  icon: CircleAlert },
  { id: 'screening',  label: 'Screening',  icon: ShieldAlert },
  { id: 'score',      label: 'Score',      icon: BarChart3 },
  { id: 'capacity',   label: 'Capacidad',  icon: Gauge },
];

// fix missing import
import { LayoutGrid } from 'lucide-react';

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Queries
  const { data: kase, isLoading: caseLoading } = useQuery<Case>({
    queryKey: ['case', id],
    queryFn: () => casesApi.get(id!),
    enabled: !!id,
  });

  const { data: documents = [] } = useQuery<CaseDocument[]>({
    queryKey: ['documents', id],
    queryFn: () => documentsApi.list(id!),
    enabled: !!id,
  });

  const { data: findingsSummary } = useQuery<FindingsSummary>({
    queryKey: ['findings-summary', id],
    queryFn: () => rulesApi.getSummary(id!),
    enabled: !!id,
  });

  const { data: score } = useQuery<RiskScore>({
    queryKey: ['risk-score', id],
    queryFn: () => scoringApi.getLatest(id!),
    enabled: !!id,
    retry: false,
  });

  const { data: capacity } = useQuery<OperationalCapacity>({
    queryKey: ['capacity', id],
    queryFn: () => capacityApi.getLatest(id!),
    enabled: !!id,
    retry: false,
  });

  const { data: screening } = useQuery<ScreeningReport>({
    queryKey: ['screening', id],
    queryFn: () => screeningApi.getResults(id!),
    enabled: !!id,
    retry: false,
  });

  // Pipeline mutations
  const buildProfile = useMutation({
    mutationFn: () => profilingApi.buildProfile(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile', id] }),
  });

  const evalRules = useMutation({
    mutationFn: () => rulesApi.evaluate(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['findings-summary', id] }),
  });

  const runScreening = useMutation({
    mutationFn: () => screeningApi.run(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['screening', id] }),
  });

  const calcScore = useMutation({
    mutationFn: () => scoringApi.calculate(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['risk-score', id] }),
  });

  const calcCapacity = useMutation({
    mutationFn: () => capacityApi.calculate(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['capacity', id] }),
  });

  if (caseLoading) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <Spinner size="md" />
      </div>
    );
  }

  if (!kase) return null;

  return (
    <div className="animate-in">
      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
        <div className="px-7 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/cases" className="text-slate-500 hover:text-slate-300 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-slate-400">{kase.caseNumber}</span>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${getCaseStatusColor(kase.status)}`}>
                  {getCaseStatusLabel(kase.status)}
                </span>
                <span className="text-[11px] px-1.5 py-0.5 rounded border border-slate-600/40 bg-slate-700/30 text-slate-400">
                  {kase.subjectType === 'NATURAL_PERSON' ? '🧑 PH' : '🏢 PJ'}
                </span>
                {kase.riskCategory && (
                  <span className={`text-xs font-semibold ${getRiskColor(kase.riskCategory)}`}>
                    {getRiskLabel(kase.riskCategory)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">Actualizado {formatRelative(kase.updatedAt)}</p>
            </div>
          </div>

          {findingsSummary?.hasBlocker && (
            <Alert variant="danger" className="py-1.5 px-3 text-xs">
              ⛔ Hallazgo bloqueante detectado
            </Alert>
          )}
        </div>

        {/* Tabs */}
        <div className="px-7 flex items-center gap-0.5 overflow-x-auto">
          {TABS.map(({ id: tid, label, icon: Icon }) => (
            <button
              key={tid}
              onClick={() => setActiveTab(tid)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors whitespace-nowrap border-b-2 ${
                activeTab === tid
                  ? 'text-blue-400 border-blue-400'
                  : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {tid === 'findings' && findingsSummary && findingsSummary.open > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-semibold">
                  {findingsSummary.open}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="p-7">
        {activeTab === 'overview' && (
          <OverviewTab kase={kase} documents={documents} findingsSummary={findingsSummary} score={score} capacity={capacity}
            screening={screening}
            onBuildProfile={() => buildProfile.mutate()}
            onEvalRules={() => evalRules.mutate()}
            onRunScreening={() => runScreening.mutate()}
            onCalcScore={() => calcScore.mutate()}
            onCalcCapacity={() => calcCapacity.mutate()}
            loadingBuildProfile={buildProfile.isPending}
            loadingEvalRules={evalRules.isPending}
            loadingRunScreening={runScreening.isPending}
            loadingCalcScore={calcScore.isPending}
            loadingCalcCapacity={calcCapacity.isPending}
          />
        )}
        {activeTab === 'documents' && <DocumentsTab caseId={id!} documents={documents} />}
        {activeTab === 'findings' && <FindingsTab caseId={id!} summary={findingsSummary} />}
        {activeTab === 'screening' && <ScreeningTab screening={screening} onRun={() => runScreening.mutate()} loading={runScreening.isPending} />}
        {activeTab === 'score' && <ScoreTab score={score} onCalc={() => calcScore.mutate()} loading={calcScore.isPending} />}
        {activeTab === 'capacity' && <CapacityTab capacity={capacity} onCalc={() => calcCapacity.mutate()} loading={calcCapacity.isPending} />}
        {(activeTab === 'profile' || activeTab === 'extraction') && (
          <ComingSoon tab={activeTab} />
        )}
      </div>
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────

function OverviewTab({ kase, documents, findingsSummary, score, capacity, screening,
  onBuildProfile, onEvalRules, onRunScreening, onCalcScore, onCalcCapacity,
  loadingBuildProfile, loadingEvalRules, loadingRunScreening, loadingCalcScore, loadingCalcCapacity,
}: any) {
  const pipeline = [
    {
      step: 1, label: 'Documentos', icon: FileUp,
      done: documents.length > 0,
      sub: `${documents.length} documento(s) cargado(s)`,
      action: null,
    },
    {
      step: 2, label: 'Perfilamiento', icon: Users,
      done: false,
      sub: 'Consolidar datos extraídos',
      action: { label: 'Construir perfil', fn: onBuildProfile, loading: loadingBuildProfile },
    },
    {
      step: 3, label: 'Reglas', icon: CircleAlert,
      done: !!findingsSummary,
      sub: findingsSummary ? `${findingsSummary.total} hallazgo(s)` : 'Sin evaluar',
      action: { label: 'Evaluar reglas', fn: onEvalRules, loading: loadingEvalRules },
    },
    {
      step: 4, label: 'Screening AML', icon: ShieldAlert,
      done: !!screening?.summary,
      sub: screening?.summary ? (screening.summary.hasMatch ? '⚠️ Match detectado' : '✅ Sin matches') : 'Sin ejecutar',
      action: { label: 'Ejecutar screening', fn: onRunScreening, loading: loadingRunScreening },
    },
    {
      step: 5, label: 'Score de riesgo', icon: BarChart3,
      done: !!score,
      sub: score ? `${score.numericScore}/100 — ${getRiskLabel(score.riskCategory)}` : 'Sin calcular',
      action: { label: 'Calcular score', fn: onCalcScore, loading: loadingCalcScore },
    },
    {
      step: 6, label: 'Capacidad operativa', icon: Gauge,
      done: !!capacity,
      sub: capacity ? formatCurrency(capacity.monthlyLimit) + '/mes' : 'Sin calcular',
      action: { label: 'Calcular límites', fn: onCalcCapacity, loading: loadingCalcCapacity },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Info básica */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-lg border border-slate-700/50 bg-slate-800/20 p-3">
          <p className="text-[11px] text-slate-500">Número</p>
          <p className="text-sm font-mono text-slate-200 mt-0.5">{kase.caseNumber}</p>
        </div>
        <div className="rounded-lg border border-slate-700/50 bg-slate-800/20 p-3">
          <p className="text-[11px] text-slate-500">Tipo de sujeto</p>
          <p className="text-sm text-slate-200 mt-0.5">
            {kase.subjectType === 'NATURAL_PERSON' ? 'Persona Humana' : 'Persona Jurídica'}
          </p>
        </div>
        <div className="rounded-lg border border-slate-700/50 bg-slate-800/20 p-3">
          <p className="text-[11px] text-slate-500">Creado</p>
          <p className="text-sm text-slate-200 mt-0.5">{formatDate(kase.createdAt)}</p>
        </div>
        <div className="rounded-lg border border-slate-700/50 bg-slate-800/20 p-3">
          <p className="text-[11px] text-slate-500">Categoría de riesgo</p>
          <p className={`text-sm font-semibold mt-0.5 ${getRiskColor(kase.riskCategory)}`}>
            {getRiskLabel(kase.riskCategory)}
          </p>
        </div>
      </div>

      {/* Pipeline de compliance */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline de compliance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pipeline.map((p) => (
              <div key={p.step}
                className="flex items-center gap-4 p-3 rounded-lg border border-slate-700/40 bg-slate-800/20">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  p.done ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                         : 'bg-slate-700/60 text-slate-500 border border-slate-600/30'
                }`}>
                  {p.done ? '✓' : p.step}
                </div>
                <p.icon className={`w-4 h-4 shrink-0 ${p.done ? 'text-emerald-400' : 'text-slate-500'}`} />
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-200">{p.label}</p>
                  <p className="text-[11px] text-slate-500">{p.sub}</p>
                </div>
                {p.action && (
                  <Button
                    size="sm"
                    variant={p.done ? 'outline' : 'secondary'}
                    onClick={p.action.fn}
                    loading={p.action.loading}
                  >
                    {p.done ? <RotateCcw className="w-3 h-3" /> : null}
                    {p.done ? 'Re-calcular' : p.action.label}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Score snippet */}
      {score && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle>Score de riesgo</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className={`text-4xl font-bold ${getRiskColor(score.riskCategory)}`}>
                  {score.numericScore}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${getRiskColor(score.riskCategory)}`}>
                    {getRiskLabel(score.riskCategory)}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{getActionLabel(score.recommendedAction)}</p>
                </div>
              </div>
              <ProgressBar
                value={score.numericScore}
                color={score.numericScore < 25 ? 'emerald' : score.numericScore < 50 ? 'amber' : 'red'}
              />
            </CardContent>
          </Card>

          {capacity && (
            <Card>
              <CardHeader><CardTitle>Límites operativos</CardTitle></CardHeader>
              <CardContent className="space-y-2.5">
                {[
                  { label: 'Por operación', value: capacity.maxPerOperation },
                  { label: 'Diario', value: capacity.dailyLimit },
                  { label: 'Mensual', value: capacity.monthlyLimit },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">{label}</span>
                    <span className="text-sm font-semibold text-slate-200">
                      {value === 0 ? <span className="text-red-400">⛔ Sin límite</span> : formatCurrency(value)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Notes */}
      {kase.internalNotes && (
        <div className="rounded-lg border border-slate-700/40 bg-slate-800/20 p-4">
          <p className="text-xs font-medium text-slate-400 mb-1">Notas internas</p>
          <p className="text-sm text-slate-300">{kase.internalNotes}</p>
        </div>
      )}
    </div>
  );
}

// ── Documents Tab ─────────────────────────────────────────────────────────

function DocumentsTab({ caseId, documents }: { caseId: string; documents: CaseDocument[] }) {
  const qc = useQueryClient();
  const [dragging, setDragging] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: (files: FileList) => {
      const fd = new FormData();
      Array.from(files).forEach(f => fd.append('files', f));
      fd.append('documentType', 'OTRO');
      return documentsApi.upload(caseId, fd);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents', caseId] }),
  });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) uploadMutation.mutate(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`rounded-xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
          dragging ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700/60 hover:border-slate-600 bg-slate-800/20'
        }`}
      >
        <Upload className="w-8 h-8 text-slate-500 mx-auto mb-3" />
        <p className="text-sm text-slate-400 font-medium">Arrastrá documentos aquí</p>
        <p className="text-xs text-slate-600 mt-1">PDF, JPG, PNG — Máx. 20MB por archivo</p>
        {uploadMutation.isPending && (
          <div className="flex items-center gap-2 justify-center mt-3 text-blue-400 text-xs">
            <Spinner size="xs" /> Subiendo...
          </div>
        )}
      </div>

      {/* List */}
      {documents.length === 0 ? (
        <EmptyState icon={<FileUp />} title="Sin documentos" description="Cargá el primer documento" />
      ) : (
        <Card>
          <div className="divide-y divide-slate-700/30">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-8 h-8 rounded-md bg-slate-700/60 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-200 truncate">{doc.originalFilename}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {doc.documentType} · {formatFileSize(doc.fileSizeBytes)} · v{doc.version}
                  </p>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded border font-medium ${
                  doc.status === 'VALIDATED' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : doc.status === 'REJECTED' ? 'border-red-500/30 bg-red-500/10 text-red-400'
                  : doc.status === 'EXTRACTION_FAILED' ? 'border-orange-500/30 bg-orange-500/10 text-orange-400'
                  : 'border-slate-600/40 bg-slate-700/30 text-slate-400'
                }`}>
                  {doc.status.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ── Findings Tab ──────────────────────────────────────────────────────────

function FindingsTab({ caseId, summary }: { caseId: string; summary: FindingsSummary | undefined }) {
  if (!summary) return (
    <EmptyState
      icon={<CircleAlert />}
      title="Sin hallazgos aún"
      description="Ejecutá el motor de reglas desde la pestaña Resumen"
    />
  );

  const { findings, bySeverity, hasBlocker, totalScoreImpact } = summary;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Bloqueantes" value={bySeverity.BLOCKER} color={bySeverity.BLOCKER > 0 ? 'red' : 'blue'} />
        <StatCard label="Críticos" value={bySeverity.CRITICAL} color={bySeverity.CRITICAL > 0 ? 'amber' : 'blue'} />
        <StatCard label="Advertencias" value={bySeverity.WARNING} color="blue" />
        <StatCard label="Informativos" value={bySeverity.INFO} color="blue" />
      </div>

      {hasBlocker && (
        <Alert variant="danger">
          ⛔ <strong>Hallazgo bloqueante detectado.</strong> No se puede aprobar el expediente hasta resolver o exceptuar todos los hallazgos bloqueantes.
        </Alert>
      )}

      {/* Findings list */}
      <Card>
        <div className="divide-y divide-slate-700/30">
          {findings.length === 0 ? (
            <div className="flex items-center gap-2 px-5 py-8 text-slate-500 text-sm justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sin hallazgos — perfil limpio
            </div>
          ) : (
            findings.map((f) => (
              <div key={f.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                      f.severity === 'BLOCKER' ? 'bg-red-400' :
                      f.severity === 'CRITICAL' ? 'bg-orange-400' :
                      f.severity === 'WARNING' ? 'bg-amber-400' : 'bg-blue-400'
                    }`} />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-mono text-slate-500">{f.ruleCode}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          f.severity === 'BLOCKER' ? 'text-red-400 bg-red-400/10'
                          : f.severity === 'CRITICAL' ? 'text-orange-400 bg-orange-400/10'
                          : f.severity === 'WARNING' ? 'text-amber-400 bg-amber-400/10'
                          : 'text-blue-400 bg-blue-400/10'
                        }`}>
                          {getSeverityLabel(f.severity)}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                          f.status === 'OPEN' ? 'border-red-500/30 text-red-400'
                          : f.status === 'ACKNOWLEDGED' ? 'border-amber-500/30 text-amber-400'
                          : 'border-emerald-500/30 text-emerald-400'
                        }`}>
                          {f.status}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-200">{f.title}</p>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{f.detail}</p>
                    </div>
                  </div>
                  {f.scoreImpact != null && (
                    <span className="text-xs text-red-400 font-medium shrink-0">+{f.scoreImpact}pts</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

// ── Screening Tab ─────────────────────────────────────────────────────────

function ScreeningTab({ screening, onRun, loading }: { screening?: ScreeningReport; onRun: () => void; loading: boolean }) {
  if (!screening) return (
    <div className="space-y-4">
      <Alert variant="info">El screening AML verifica contra listas PEP, OFAC, ONU y adverse media.</Alert>
      <Button onClick={onRun} loading={loading}>
        <ShieldAlert className="w-4 h-4" /> Ejecutar screening AML
      </Button>
    </div>
  );

  const { results, summary } = screening;

  return (
    <div className="space-y-4">
      {/* Summary badges */}
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant={summary.hasMatch ? 'danger' : 'success'}>
          {summary.hasMatch ? '⚠️ Match encontrado' : '✅ Sin matches'}
        </Badge>
        {summary.requiresEdd && <Badge variant="warning">EDD requerida</Badge>}
        <Badge variant="default">Listas: {summary.listsChecked.join(', ')}</Badge>
        <Button size="sm" variant="outline" onClick={onRun} loading={loading}>
          <RotateCcw className="w-3 h-3" /> Re-ejecutar
        </Button>
      </div>

      {/* Results */}
      <Card>
        <div className="divide-y divide-slate-700/30">
          {results.map((r) => (
            <div key={r.id} className="flex items-start gap-4 px-5 py-4">
              <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${r.matchFound ? 'bg-red-400' : 'bg-emerald-400'}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-slate-200">{r.screenedEntity}</span>
                  <Badge variant={r.matchFound ? 'danger' : 'success'}>
                    {r.matchFound ? 'Match' : 'Clear'}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500">
                  Listas: {r.listsChecked?.join(', ')} · Proveedor: {r.provider}
                </p>
                {r.matchDetails && (
                  <p className="text-xs text-amber-400 mt-1">
                    {JSON.stringify(r.matchDetails)}
                  </p>
                )}
              </div>
              {r.scoreImpact != null && r.scoreImpact > 0 && (
                <span className="text-xs text-red-400 font-medium">+{r.scoreImpact}pts</span>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Score Tab ─────────────────────────────────────────────────────────────

function ScoreTab({ score, onCalc, loading }: { score?: RiskScore; onCalc: () => void; loading: boolean }) {
  if (!score) return (
    <div className="space-y-4">
      <Alert variant="info">El score requiere hallazgos y screening calculados previamente.</Alert>
      <Button onClick={onCalc} loading={loading}>
        <BarChart3 className="w-4 h-4" /> Calcular score
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Main score */}
      <Card>
        <CardContent className="flex items-center gap-8">
          <div className="text-center">
            <div className={`text-6xl font-bold ${getRiskColor(score.riskCategory)}`}>
              {score.numericScore}
            </div>
            <p className="text-xs text-slate-500 mt-1">de 100</p>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-lg font-semibold ${getRiskColor(score.riskCategory)}`}>
                {getRiskLabel(score.riskCategory)}
              </span>
              <span className={`text-sm font-medium ${getActionColor(score.recommendedAction)}`}>
                {getActionLabel(score.recommendedAction)}
              </span>
            </div>
            <ProgressBar
              value={score.numericScore}
              color={score.numericScore < 25 ? 'emerald' : score.numericScore < 50 ? 'amber' : 'red'}
              className="mb-3"
            />
            <div className="flex gap-4 text-xs text-slate-500">
              {score.requiresEdd && <span className="text-amber-400">⚠️ EDD requerida</span>}
              {score.requiresHumanReview && <span className="text-blue-400">👁️ Revisión humana</span>}
              <span>v{score.version} · {score.scoringEngineVersion}</span>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={onCalc} loading={loading}>
            <RotateCcw className="w-3 h-3" /> Re-calcular
          </Button>
        </CardContent>
      </Card>

      {/* Dimension scores */}
      <Card>
        <CardHeader><CardTitle>Scores por dimensión</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(score.dimensionScores).map(([dim, val]) => (
            <div key={dim}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">{dim}</span>
                <span className="text-slate-300 font-medium">{Math.round(val)}</span>
              </div>
              <ProgressBar value={val} color={val < 25 ? 'emerald' : val < 50 ? 'amber' : 'red'} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Factores positivos</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {score.positiveFactors.map((f, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-300">{f.description}</p>
                  <p className="text-[11px] text-emerald-400 font-medium">{f.impact}pts</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Factores negativos</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {score.negativeFactors.map((f, i) => (
              <div key={i} className="flex items-start gap-2">
                <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-300">{f.description}</p>
                  <p className="text-[11px] text-red-400 font-medium">+{f.impact}pts</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Capacity Tab ──────────────────────────────────────────────────────────

function CapacityTab({ capacity, onCalc, loading }: { capacity?: OperationalCapacity; onCalc: () => void; loading: boolean }) {
  if (!capacity) return (
    <div className="space-y-4">
      <Alert variant="info">El cálculo de capacidad requiere el score calculado previamente.</Alert>
      <Button onClick={onCalc} loading={loading}>
        <Gauge className="w-4 h-4" /> Calcular capacidad operativa
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Limits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { label: 'Por operación', value: capacity.maxPerOperation, icon: Zap },
          { label: 'Límite diario', value: capacity.dailyLimit, icon: Clock },
          { label: 'Límite mensual', value: capacity.monthlyLimit, icon: BarChart3 },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className={`text-lg font-bold mt-0.5 ${value === 0 ? 'text-red-400' : 'text-slate-100'}`}>
                  {value === 0 ? '⛔ Bloqueado' : formatCurrency(value)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommendation */}
      <Alert variant={capacity.shouldReject ? 'danger' : capacity.requiresHumanApproval ? 'warning' : 'success'}>
        {capacity.recommendation}
      </Alert>

      {/* Justification */}
      {capacity.justification?.items?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Justificación normativa</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {capacity.justification.items.map((item: any, i: number) => (
              <div key={i} className="border-l-2 border-slate-700/60 pl-4">
                <p className="text-xs font-medium text-slate-200">{item.limitName}</p>
                <p className="text-xs text-slate-400 mt-1">{item.adjustmentReason}</p>
                <div className="flex items-center gap-4 mt-1.5 text-[11px]">
                  <span className="text-slate-500">Base: {formatCurrency(item.baseValue)}</span>
                  <span className="text-slate-300 font-medium">→ {formatCurrency(item.adjustedValue)}</span>
                </div>
                <p className="text-[10px] text-blue-400 mt-1 font-mono">{item.normativeReference}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-3">
        <Button size="sm" variant="outline" onClick={onCalc} loading={loading}>
          <RotateCcw className="w-3 h-3" /> Re-calcular
        </Button>
        <p className="text-xs text-slate-500">
          Válido hasta: {capacity.validUntil ? formatDate(capacity.validUntil) : '—'} · v{capacity.version}
        </p>
      </div>
    </div>
  );
}

// ── Coming Soon ───────────────────────────────────────────────────────────

function ComingSoon({ tab }: { tab: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
      <Activity className="w-10 h-10 opacity-20" />
      <p className="text-sm">Sección <strong className="text-slate-400">{tab}</strong> — próximamente</p>
    </div>
  );
}
