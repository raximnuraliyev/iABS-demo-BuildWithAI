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

// ── Leases ──
export interface LeaseRecord {
  id: string;
  asset_id: string;
  counterparty_id: string;
  lease_direction: 'OUTBOUND' | 'INBOUND';
  status: 'INTRODUCED' | 'APPROVED' | 'RETURNED';
  contract_amount: string | number;
  start_date: string;
  end_date: string;
  asset?: { id: string; name: string; category: string; measurement_unit: string };
  counterparty?: { id: string; inn: string; name: string; settlement_account: string; type: string };
}

export function fetchLeases(direction?: string, status?: string): Promise<LeaseRecord[]> {
  const params = new URLSearchParams();
  if (direction) params.set('direction', direction);
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

export function payLease(id: string, paymentType: string) {
  return apiFetch(`/leases/${id}/pay`, { method: 'POST', body: JSON.stringify({ payment_type: paymentType }) });
}

// ── Counterparties ──
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

// ── Assets ──
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
  entity_name: string;
  entity_id: string;
  previous_data: any;
  new_data: any;
  created_at: string;
}

export function fetchAuditLogs(entityId?: string, limit?: number): Promise<AuditLogEntry[]> {
  const params = new URLSearchParams();
  if (entityId) params.set('entity_id', entityId);
  if (limit) params.set('limit', String(limit));
  return apiFetch(`/audit-logs?${params}`);
}
