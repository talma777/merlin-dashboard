import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { RiskCategory, RuleSeverity, CaseStatus, FindingStatus, RecommendedAction } from '@/types/domain';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = 'ARS'): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: string | Date, style: 'short' | 'long' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (style === 'long') {
    return d.toLocaleString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatRelative(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins}m`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return formatDate(date);
}

export function getRiskColor(category: RiskCategory | null): string {
  switch (category) {
    case 'LOW':      return 'text-emerald-400';
    case 'MEDIUM':   return 'text-amber-400';
    case 'HIGH':     return 'text-orange-400';
    case 'CRITICAL': return 'text-red-400';
    default:         return 'text-slate-400';
  }
}

export function getRiskLabel(category: RiskCategory | null): string {
  switch (category) {
    case 'LOW':      return 'Bajo';
    case 'MEDIUM':   return 'Medio';
    case 'HIGH':     return 'Alto';
    case 'CRITICAL': return 'Crítico';
    default:         return 'Sin calcular';
  }
}

export function getSeverityColor(severity: RuleSeverity): string {
  switch (severity) {
    case 'INFO':     return 'text-blue-400';
    case 'WARNING':  return 'text-amber-400';
    case 'CRITICAL': return 'text-orange-400';
    case 'BLOCKER':  return 'text-red-400';
  }
}

export function getSeverityLabel(severity: RuleSeverity): string {
  switch (severity) {
    case 'INFO':     return 'Informativo';
    case 'WARNING':  return 'Advertencia';
    case 'CRITICAL': return 'Crítico';
    case 'BLOCKER':  return 'Bloqueante';
  }
}

export function getCaseStatusLabel(status: CaseStatus): string {
  const map: Record<CaseStatus, string> = {
    DRAFT:            'Borrador',
    DOCS_INCOMPLETE:  'Docs. incompletos',
    IN_REVIEW:        'En revisión',
    IN_REMEDIATION:   'En subsanación',
    APPROVED:         'Aprobado',
    REJECTED:         'Rechazado',
    CLOSED:           'Cerrado',
  };
  return map[status] ?? status;
}

export function getCaseStatusColor(status: CaseStatus): string {
  switch (status) {
    case 'APPROVED':    return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
    case 'REJECTED':    return 'text-red-400 bg-red-400/10 border-red-400/30';
    case 'IN_REVIEW':   return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
    case 'IN_REMEDIATION': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
    default:            return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
  }
}

export function getActionLabel(action: RecommendedAction): string {
  const map: Record<RecommendedAction, string> = {
    APPROVE:                  '✅ Aprobar',
    APPROVE_WITH_CONDITIONS:  '✅ Aprobar con condiciones',
    MANUAL_REVIEW:            '👁️ Revisión manual',
    ENHANCED_DUE_DILIGENCE:   '🔍 Diligencia reforzada (EDD)',
    REJECT:                   '⛔ Rechazar',
  };
  return map[action];
}

export function getActionColor(action: RecommendedAction): string {
  switch (action) {
    case 'APPROVE':                 return 'text-emerald-400';
    case 'APPROVE_WITH_CONDITIONS': return 'text-teal-400';
    case 'MANUAL_REVIEW':           return 'text-amber-400';
    case 'ENHANCED_DUE_DILIGENCE':  return 'text-orange-400';
    case 'REJECT':                  return 'text-red-400';
  }
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.9) return 'text-emerald-400';
  if (confidence >= 0.7) return 'text-amber-400';
  return 'text-red-400';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function getScoreGrade(score: number): { grade: string; color: string; bg: string } {
  if (score < 25)  return { grade: 'A', color: 'text-emerald-400', bg: 'bg-emerald-400/10' };
  if (score < 50)  return { grade: 'B', color: 'text-amber-400',   bg: 'bg-amber-400/10' };
  if (score < 75)  return { grade: 'C', color: 'text-orange-400',  bg: 'bg-orange-400/10' };
  return               { grade: 'D', color: 'text-red-400',     bg: 'bg-red-400/10' };
}
