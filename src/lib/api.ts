import axios from 'axios';
import { useAuthStore } from '@/stores/auth.store';

export const api = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — inyecta el access token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — maneja 401 y refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axios.post('/api/v1/auth/refresh', { refreshToken });
        useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

// ── API Service shortcuts ─────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then(r => r.data),
  me: () => api.get('/auth/me').then(r => r.data),
};

export const casesApi = {
  list: (params?: any)             => api.get('/cases', { params }).then(r => r.data),
  get: (id: string)                => api.get(`/cases/${id}`).then(r => r.data),
  create: (dto: any)               => api.post('/cases', dto).then(r => r.data),
  updateStatus: (id: string, dto: any) => api.patch(`/cases/${id}/status`, dto).then(r => r.data),
};

export const documentsApi = {
  list: (caseId: string)           => api.get(`/cases/${caseId}/documents`).then(r => r.data),
  summary: (caseId: string)        => api.get(`/cases/${caseId}/documents/summary`).then(r => r.data),
  get: (id: string)                => api.get(`/documents/${id}`).then(r => r.data),
  getDownloadUrl: (id: string)     => api.get(`/documents/${id}/download-url`).then(r => r.data),
  upload: (caseId: string, formData: FormData) =>
    api.post(`/cases/${caseId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),
  update: (id: string, dto: any)   => api.patch(`/documents/${id}`, dto).then(r => r.data),
  reject: (id: string, dto: any)   => api.patch(`/documents/${id}/reject`, dto).then(r => r.data),
};

export const extractionApi = {
  getFieldsByDocument: (documentId: string) =>
    api.get(`/documents/${documentId}/fields`).then(r => r.data),
  getFieldsByCase: (caseId: string) =>
    api.get(`/cases/${caseId}/extracted-fields`).then(r => r.data),
  getSummary: (caseId: string) =>
    api.get(`/cases/${caseId}/extraction-summary`).then(r => r.data),
  getPendingReview: (caseId: string) =>
    api.get(`/cases/${caseId}/fields-pending-review`).then(r => r.data),
  validateField: (fieldId: string, dto: any) =>
    api.patch(`/extracted-fields/${fieldId}/validate`, dto).then(r => r.data),
  markValidated: (documentId: string) =>
    api.post(`/documents/${documentId}/mark-validated`).then(r => r.data),
};

export const profilingApi = {
  buildProfile: (caseId: string)   => api.post(`/cases/${caseId}/build-profile`).then(r => r.data),
  getProfile: (caseId: string)     => api.get(`/cases/${caseId}/profile`).then(r => r.data),
  getPhProfile: (caseId: string)   => api.get(`/cases/${caseId}/profile/natural-person`).then(r => r.data),
  getPjProfile: (caseId: string)   => api.get(`/cases/${caseId}/profile/legal-entity`).then(r => r.data),
};

export const rulesApi = {
  evaluate: (caseId: string)       => api.post(`/cases/${caseId}/evaluate-rules`).then(r => r.data),
  getFindings: (caseId: string)    => api.get(`/cases/${caseId}/findings`).then(r => r.data),
  getSummary: (caseId: string)     => api.get(`/cases/${caseId}/findings/summary`).then(r => r.data),
  acknowledge: (id: string, dto: any) => api.patch(`/findings/${id}/acknowledge`, dto).then(r => r.data),
  waive: (id: string, dto: any)    => api.patch(`/findings/${id}/waive`, dto).then(r => r.data),
};

export const screeningApi = {
  run: (caseId: string)            => api.post(`/cases/${caseId}/run-screening`).then(r => r.data),
  getResults: (caseId: string)     => api.get(`/cases/${caseId}/screening-results`).then(r => r.data),
};

export const scoringApi = {
  calculate: (caseId: string)      => api.post(`/cases/${caseId}/calculate-score`).then(r => r.data),
  getLatest: (caseId: string)      => api.get(`/cases/${caseId}/risk-score`).then(r => r.data),
  getHistory: (caseId: string)     => api.get(`/cases/${caseId}/risk-score/history`).then(r => r.data),
};

export const capacityApi = {
  calculate: (caseId: string)      => api.post(`/cases/${caseId}/calculate-capacity`).then(r => r.data),
  getLatest: (caseId: string)      => api.get(`/cases/${caseId}/operational-capacity`).then(r => r.data),
  override: (id: string, dto: any) => api.patch(`/operational-capacity/${id}/override`, dto).then(r => r.data),
};

export const auditApi = {
  getForCase: (caseId: string)     => api.get(`/audit/case/${caseId}`).then(r => r.data),
  getAll: (params?: any)           => api.get('/audit', { params }).then(r => r.data),
};
