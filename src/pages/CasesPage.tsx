import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { casesApi } from '@/lib/api';
import { Button, Input, Select, Card, CardContent, Spinner, EmptyState } from '@/components/ui';
import {
  getCaseStatusColor, getCaseStatusLabel, getRiskColor, getRiskLabel,
  formatRelative, formatDate,
} from '@/lib/utils';
import { FolderOpen, Plus, Search, Users, ArrowRight, Filter } from 'lucide-react';
import type { Case, CaseStatus, SubjectType } from '@/types/domain';

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: 'Todos los estados', value: '' },
  { label: 'Borrador', value: 'DRAFT' },
  { label: 'Docs. incompletos', value: 'DOCS_INCOMPLETE' },
  { label: 'En revisión', value: 'IN_REVIEW' },
  { label: 'En subsanación', value: 'IN_REMEDIATION' },
  { label: 'Aprobado', value: 'APPROVED' },
  { label: 'Rechazado', value: 'REJECTED' },
];

export default function CasesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newType, setNewType] = useState<SubjectType>('NATURAL_PERSON');
  const [newName, setNewName] = useState('');
  const [newIdentifier, setNewIdentifier] = useState('');

  const { data: cases = [], isLoading } = useQuery<Case[]>({
    queryKey: ['cases'],
    queryFn: () => casesApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: () => casesApi.create({ subjectType: newType, clientName: newName, clientIdentifier: newIdentifier }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cases'] });
      setShowNew(false);
      setNewName('');
      setNewIdentifier('');
    },
  });

  const filtered = cases.filter(c => {
    const matchStatus = !statusFilter || c.status === statusFilter;
    const matchSearch = !search || c.caseNumber.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="p-7 space-y-5 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Expedientes</h1>
          <p className="text-xs text-slate-500">{cases.length} expediente{cases.length !== 1 ? 's' : ''} en total</p>
        </div>
        <Button onClick={() => setShowNew(true)}>
          <Plus className="w-3.5 h-3.5" />
          Nuevo expediente
        </Button>
      </div>

      {/* New Case modal inline */}
      {showNew && (
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">Nuevo expediente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nombre / Razón Social *</label>
                <Input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Ej: Juan Pérez SA"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Tipo de sujeto</label>
                <Select value={newType} onChange={e => setNewType(e.target.value as SubjectType)}>
                  <option value="NATURAL_PERSON">Persona Humana (PH)</option>
                  <option value="LEGAL_ENTITY">Persona Jurídica (PJ)</option>
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Identificador (DNI / CUIT) - Opcional</label>
                <Input
                  value={newIdentifier}
                  onChange={e => setNewIdentifier(e.target.value)}
                  placeholder="Ej: 30123456"
                />
              </div>
            </div>
            {createMutation.isError && (
              <p className="text-xs text-red-400 mt-2">Error al crear. Asegurate de completar el Nombre.</p>
            )}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => createMutation.mutate()}
                loading={createMutation.isPending}
                disabled={newName.trim().length < 2}
              >
                Crear expediente
              </Button>
              <Button variant="ghost" onClick={() => setShowNew(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <Input
            placeholder="Buscar por número..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-48">
          {STATUS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
        {(search || statusFilter) && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setStatusFilter(''); }}>
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Table */}
      <Card>
        {/* Header row */}
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_40px] gap-4 px-5 py-2.5 border-b border-slate-700/50">
          {['Expediente', 'Tipo', 'Estado', 'Riesgo', 'Actualizado', ''].map(h => (
            <span key={h} className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">{h}</span>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<FolderOpen />}
            title="Sin expedientes"
            description="Creá el primer expediente para comenzar"
          />
        ) : (
          <div className="divide-y divide-slate-700/30">
            {filtered.map((c) => (
              <Link
                key={c.id}
                to={`/cases/${c.id}`}
                className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_40px] gap-4 items-center px-5 py-3.5 hover:bg-slate-700/15 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-slate-700/60 flex items-center justify-center shrink-0">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <span className="text-xs font-mono text-slate-300">{c.caseNumber}</span>
                </div>
                <span className="text-xs text-slate-400">
                  {c.subjectType === 'NATURAL_PERSON' ? '🧑 Persona Humana' : '🏢 Persona Jurídica'}
                </span>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded border w-fit ${getCaseStatusColor(c.status)}`}>
                  {getCaseStatusLabel(c.status)}
                </span>
                <span className={`text-xs font-medium ${getRiskColor(c.riskCategory)}`}>
                  {getRiskLabel(c.riskCategory)}
                </span>
                <span className="text-xs text-slate-500">{formatRelative(c.updatedAt)}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 justify-self-end" />
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
