const API_BASE = '/api/v1';

function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

async function apiFetch(url: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: any = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(body.error || `API error ${res.status}`);
  }

  return res.json();
}

// ── Auth ──
export async function login(tabel_id: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tabel_id, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Login failed' }));
    throw new Error(body.error || 'Invalid credentials');
  }
  return res.json();
}

export function fetchCurrentUser() {
  return apiFetch('/users/me');
}

// ── Dashboard ──
export function fetchDashboardStats() {
  return apiFetch('/dashboard/stats');
}

// ── Clients ──
export interface ClientRecord {
  id: string;
  code: string;
  name: string;
  subject: 'P' | 'J';
  code_filial: string;
  inn: string;
  address: string;
  phone: string;
  condition: boolean;
  accounts?: AccountRecord[];
}

export function fetchClients(subject?: string, search?: string): Promise<ClientRecord[]> {
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (search) params.set('search', search);
  return apiFetch(`/clients?${params}`);
}

export function createClient(data: any) {
  return apiFetch('/clients', { method: 'POST', body: JSON.stringify(data) });
}

export function updateClient(id: string, data: any) {
  return apiFetch(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteClient(id: string) {
  return apiFetch(`/clients/${id}`, { method: 'DELETE' });
}

// ── Accounts ──
export interface AccountRecord {
  id: string;
  client_id: string;
  code: string;
  code_filial: string;
  code_coa: string;
  code_currency: string;
  client?: ClientRecord;
}

export function fetchAccounts(client_id?: string): Promise<AccountRecord[]> {
  const params = new URLSearchParams();
  if (client_id) params.set('client_id', client_id);
  return apiFetch(`/accounts?${params}`);
}

export function createAccount(data: any) {
  return apiFetch('/accounts', { method: 'POST', body: JSON.stringify(data) });
}

export function deleteAccount(id: string) {
  return apiFetch(`/accounts/${id}`, { method: 'DELETE' });
}

// ── CBU Registry ──
export interface CBURegistryEntry {
  id: string;
  coa_code: string;
  description: string;
  account_type: 'INCOME' | 'EXPENSE' | 'TRANSIT';
}

export function fetchCBURegistry(): Promise<CBURegistryEntry[]> {
  return apiFetch('/cbu-registry');
}

// ── Leases ──
export interface LeaseRecord {
  id: string;
  type: 'OUTBOUND' | 'INBOUND';
  status: 'INTRODUCED' | 'APPROVED' | 'RETURNED';
  asset_type: string;
  measurement_unit: string;
  amount: string | number;
  tenant_id: string;
  lessor_id: string;
  income_expense_account: string;
  transit_account: string;
  start_date: string;
  end_date: string;
  tenant?: ClientRecord;
  lessor?: ClientRecord;
}

export function fetchLeases(type?: string, status?: string): Promise<LeaseRecord[]> {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  if (status) params.set('status', status);
  return apiFetch(`/leases?${params}`);
}

export function createLease(data: any) {
  return apiFetch('/leases', { method: 'POST', body: JSON.stringify(data) });
}

export function updateLease(id: string, data: any) {
  return apiFetch(`/leases/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteLease(id: string) {
  return apiFetch(`/leases/${id}`, { method: 'DELETE' });
}

export function approveLease(id: string) {
  return apiFetch(`/leases/${id}/approve`, { method: 'POST' });
}

export function returnLease(id: string) {
  return apiFetch(`/leases/${id}/return`, { method: 'POST' });
}

export function payLease(id: string, mode: string) {
  return apiFetch(`/leases/${id}/pay`, { method: 'POST', body: JSON.stringify({ mode }) });
}

// ── AI ──
export function aiCopilot(message: string): Promise<{ response: string }> {
  return apiFetch('/ai/copilot', { method: 'POST', body: JSON.stringify({ message }) });
}

export function aiMatchmaker(prompt: string): Promise<{ query: any; results: any[] }> {
  return apiFetch('/ai/matchmaker', { method: 'POST', body: JSON.stringify({ prompt }) });
}

export function aiAnalytics(query: string): Promise<{ sql: string; data: any[] }> {
  return apiFetch('/ai/analytics', { method: 'POST', body: JSON.stringify({ query }) });
}

// ── Users ──
export interface UserRecord {
  tabel_id: string;
  full_name: string;
  is_head_admin: boolean;
  role_id: string;
  role: { id: string; name: string; permissions: { action_name: string; is_allowed: boolean }[] };
}

export function fetchUsers(): Promise<UserRecord[]> {
  return apiFetch('/users');
}

export function createUser(data: any) {
  return apiFetch('/users', { method: 'POST', body: JSON.stringify(data) });
}

export function updateUser(id: string, data: any) {
  return apiFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteUser(id: string) {
  return apiFetch(`/users/${id}`, { method: 'DELETE' });
}

// ── Roles ──
export interface RoleRecord {
  id: string;
  name: string;
  permissions: { id: string; action_name: string; is_allowed: boolean }[];
}

export function fetchRoles(): Promise<RoleRecord[]> {
  return apiFetch('/roles');
}

export function updateRolePermission(roleId: string, action_name: string, is_allowed: boolean) {
  return apiFetch(`/roles/${roleId}/permissions`, { method: 'PUT', body: JSON.stringify({ action_name, is_allowed }) });
}

// ── Audit Logs ──
export interface AuditLogEntry {
  id: string;
  tabel_id: string;
  action: string;
  entity: string;
  entity_id: string;
  payload: any;
  timestamp: string;
}

export function fetchAuditLogs(entityId?: string, limit?: number): Promise<AuditLogEntry[]> {
  const params = new URLSearchParams();
  if (entityId) params.set('entity_id', entityId);
  if (limit) params.set('limit', String(limit));
  return apiFetch(`/audit-logs?${params}`);
}

// ── Counterparties (legacy compat) ──
export interface Counterparty {
  id: string;
  inn: string;
  name: string;
  settlement_account: string;
  type: 'TENANT' | 'LESSOR';
}

export function fetchCounterparties(type?: string): Promise<Counterparty[]> {
  const params = type ? `?type=${type}` : '';
  return apiFetch(`/counterparties${params}`);
}

export function createCounterparty(data: any) {
  return apiFetch('/counterparties', { method: 'POST', body: JSON.stringify(data) });
}

export function updateCounterparty(id: string, data: any) {
  return apiFetch(`/counterparties/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteCounterparty(id: string) {
  return apiFetch(`/counterparties/${id}`, { method: 'DELETE' });
}

// ── Assets (legacy compat) ──
export interface Asset {
  id: string;
  name: string;
  category: string;
  measurement_unit: string;
}

export function fetchAssets(): Promise<Asset[]> {
  return apiFetch('/assets');
}

export function createAsset(data: any) {
  return apiFetch('/assets', { method: 'POST', body: JSON.stringify(data) });
}

export function deleteAsset(id: string) {
  return apiFetch(`/assets/${id}`, { method: 'DELETE' });
}
