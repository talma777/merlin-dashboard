// ── Enums (espejo del backend) ─────────────────────────────────────────────

export type UserRole = 'ADMIN' | 'COMPLIANCE_OFFICER' | 'ANALYST' | 'VIEWER';
export type SubjectType = 'NATURAL_PERSON' | 'LEGAL_ENTITY';
export type CaseStatus = 'DRAFT' | 'DOCS_INCOMPLETE' | 'IN_REVIEW' | 'IN_REMEDIATION' | 'APPROVED' | 'REJECTED' | 'CLOSED';
export type RiskCategory = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type DocumentType = string;
export type DocumentStatus = 'PENDING' | 'UPLOADED' | 'EXTRACTING' | 'EXTRACTION_COMPLETE' | 'EXTRACTION_FAILED' | 'VALIDATED' | 'REJECTED';
export type DocumentQuality = 'EXCELLENT' | 'GOOD' | 'ACCEPTABLE' | 'POOR' | 'UNUSABLE';
export type RuleSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'BLOCKER';
export type FindingStatus = 'OPEN' | 'ACKNOWLEDGED' | 'WAIVED' | 'RESOLVED';
export type ScreeningStatus = 'PENDING' | 'CLEAR' | 'POTENTIAL_MATCH' | 'CONFIRMED_MATCH';
export type RecommendedAction = 'APPROVE' | 'APPROVE_WITH_CONDITIONS' | 'MANUAL_REVIEW' | 'ENHANCED_DUE_DILIGENCE' | 'REJECT';

// ── Auth ──────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// ── Cases ─────────────────────────────────────────────────────────────────

export interface Case {
  id: string;
  caseNumber: string;
  subjectType: SubjectType;
  status: CaseStatus;
  riskCategory: RiskCategory | null;
  assignedUserId: string | null;
  internalNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCaseDto {
  subjectType: SubjectType;
  internalNotes?: string;
}

// ── Documents ─────────────────────────────────────────────────────────────

export interface CaseDocument {
  id: string;
  caseId: string;
  documentType: DocumentType;
  status: DocumentStatus;
  quality: DocumentQuality | null;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  version: number;
  isLatest: boolean;
  notes: string | null;
  extractionStartedAt: string | null;
  extractionFinishedAt: string | null;
  createdAt: string;
}

// ── Extracted Fields ──────────────────────────────────────────────────────

export interface ExtractedField {
  id: string;
  documentId: string;
  caseId: string;
  fieldName: string;
  fieldGroup: string | null;
  rawValue: string | null;
  normalizedValue: string | null;
  correctedValue: string | null;
  confidence: number;
  needsReview: boolean;
  isValid: boolean | null;
  validationNotes: string | null;
  validatedById: string | null;
  validatedAt: string | null;
  createdAt: string;
}

export interface ExtractionSummary {
  totalFields: number;
  pendingReview: number;
  validated: number;
  lowConfidence: number;
  averageConfidence: number;
  documentsSummary: Array<{
    documentId: string;
    documentType: string;
    status: string;
    fieldCount: number;
    needsReviewCount: number;
  }>;
}

// ── Profile ───────────────────────────────────────────────────────────────

export interface ClientProfile {
  id: string;
  caseId: string;
  version: number;
  isLatest: boolean;
  completenessScore: number | null;
  missingFields: string[] | null;
  consistencyAlerts: Record<string, any>[] | null;
  inconsistenciesFound: boolean;
  complexityLevel: string | null;
  complexityReasons: string[] | null;
  consolidatedData: Record<string, any> | null;
  generatedBy: string | null;
  createdAt: string;
}

export interface NaturalPersonProfile {
  id: string;
  caseId: string;
  firstName: string | null;
  lastName: string | null;
  dni: string | null;
  cuitCuil: string | null;
  birthDate: string | null;
  nationality: string | null;
  gender: string | null;
  domicilioLegal: string | null;
  domicilioReal: string | null;
  email: string | null;
  phone: string | null;
  actividadEconomica: string | null;
  ocupacion: string | null;
  empleador: string | null;
  ingresosMensuales: number | null;
  ingresosCurrency: string;
  patrimonioEstimado: number | null;
  origenFondos: string | null;
  categoriaFiscal: string | null;
}

export interface LegalEntityProfile {
  id: string;
  caseId: string;
  razonSocial: string | null;
  nombreFantasia: string | null;
  cuit: string | null;
  tipoSociedad: string | null;
  fechaConstitucion: string | null;
  jurisdiccionConstitucion: string | null;
  domicilioLegal: string | null;
  actividadPrincipal: string | null;
  capitalSocial: number | null;
  tieneBeneficiariosFinales: boolean;
  ingresosAnuales: number | null;
  ingresosCurrency: string;
  origenFondos: string | null;
  descripcionNegocio: string | null;
  categoriaFiscal: string | null;
}

// ── Findings ─────────────────────────────────────────────────────────────

export interface Finding {
  id: string;
  caseId: string;
  ruleCode: string;
  severity: RuleSeverity;
  status: FindingStatus;
  title: string;
  detail: string;
  evidence: Record<string, any> | null;
  scoreImpact: number | null;
  resolvedById: string | null;
  resolvedAt: string | null;
  resolutionNote: string | null;
  createdAt: string;
}

export interface FindingsSummary {
  total: number;
  open: number;
  bySeverity: { BLOCKER: number; CRITICAL: number; WARNING: number; INFO: number };
  hasBlocker: boolean;
  totalScoreImpact: number;
  findings: Finding[];
}

// ── Screening ─────────────────────────────────────────────────────────────

export interface ScreeningResult {
  id: string;
  caseId: string;
  screenedEntity: string;
  provider: string;
  status: ScreeningStatus;
  matchFound: boolean;
  matchDetails: Record<string, any> | null;
  listsChecked: string[] | null;
  amlFlags: Record<string, any>[] | null;
  scoreImpact: number | null;
  requiresEdd: boolean;
  checkedAt: string;
}

export interface ScreeningReport {
  results: ScreeningResult[];
  summary: {
    hasMatch: boolean;
    hasBlocker: boolean;
    requiresEdd: boolean;
    listsChecked: string[];
    totalScoreImpact: number;
  };
}

// ── Risk Score ────────────────────────────────────────────────────────────

export interface RiskScore {
  id: string;
  caseId: string;
  version: number;
  isLatest: boolean;
  numericScore: number;
  riskCategory: RiskCategory;
  recommendedAction: RecommendedAction;
  dimensionScores: Record<string, number>;
  positiveFactors: Array<{ dimension: string; description: string; impact: number; weight: number }>;
  negativeFactors: Array<{ dimension: string; description: string; impact: number; weight: number }>;
  missingVariables: string[] | null;
  criticalFindings: Record<string, any>[] | null;
  findingsCountBySeverity: Record<string, number> | null;
  requiresEdd: boolean;
  requiresHumanReview: boolean;
  manuallyOverridden: boolean;
  generatedBy: string | null;
  scoringEngineVersion: string | null;
  createdAt: string;
}

// ── Operational Capacity ──────────────────────────────────────────────────

export interface OperationalCapacity {
  id: string;
  caseId: string;
  version: number;
  isLatest: boolean;
  maxPerOperation: number;
  dailyLimit: number;
  monthlyLimit: number;
  restrictions: Record<string, any>[] | null;
  requiresManualApprovalAbove: number | null;
  requiresEdd: boolean;
  requiresHumanApproval: boolean;
  shouldReject: boolean;
  justification: { items: any[]; generatedAt: string };
  recommendation: string;
  validFrom: string;
  validUntil: string | null;
  manuallyOverridden: boolean;
  generatedBy: string | null;
  createdAt: string;
}

// ── Audit ─────────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  caseId: string | null;
  description: string;
  dataBefore: Record<string, any> | null;
  dataAfter: Record<string, any> | null;
  createdAt: string;
}
