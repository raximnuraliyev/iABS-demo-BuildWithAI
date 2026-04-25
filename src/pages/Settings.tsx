import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Users, Plus, Trash2, Info, Lock, AlertTriangle, Server, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsers, fetchRoles, createUser, deleteUser, updateRolePermission, type UserRecord, type RoleRecord } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useToast } from '../components/Toast';
import { motion, AnimatePresence } from 'motion/react';

const PERMISSION_LABELS: Record<string, string> = {
  can_add_lease: 'Add Lease',
  can_approve_lease: 'Approve Lease',
  can_execute_payment: 'Execute Payment',
  can_view_audit: 'View Audit Log',
  can_manage_users: 'Manage Users',
};

type Tab = 'users' | 'permissions' | 'system';

export default function Settings() {
  const { t } = useTranslation();
  const { user: authUser } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState<{ tabel_id: string; full_name: string; password: string; permissions: string[] }>({ tabel_id: '', full_name: '', password: '', permissions: [] });

  const isHeadAdmin = authUser?.is_head_admin ?? false;

  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });
  const { data: roles = [] } = useQuery({ queryKey: ['roles'], queryFn: fetchRoles });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowAddUser(false);
      setNewUser({ tabel_id: '', full_name: '', password: '', permissions: [] });
      toast.success('Employee created');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Employee removed');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const permMutation = useMutation({
    mutationFn: ({ roleId, action, allowed }: { roleId: string; action: string; allowed: boolean }) =>
      updateRolePermission(roleId, action, allowed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Permission updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const allActions = Object.keys(PERMISSION_LABELS);

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'permissions', label: 'Permission Matrix', icon: Shield },
    { id: 'system', label: 'System Info', icon: Server },
  ];

  return (
    <div id="settings-page" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-sqb-navy">{t('sidebar.settings')}</h1>
        <p className="text-sm text-sqb-grey-secondary flex items-center gap-1">
          <Shield className="w-3 h-3" /> Role-based access control and system configuration.
        </p>
      </div>

      {!isHeadAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 text-amber-800 text-sm">
          <Lock size={18} />
          <span>Only the <strong>Head Administrator</strong> can modify users and permissions. You have read-only access.</span>
        </div>
      )}

      <div className="flex gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
              activeTab === tab.id ? "bg-sqb-navy text-white" : "bg-white text-sqb-navy border border-gray-100 hover:bg-sqb-bg"
            )}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* User Management */}
      {activeTab === 'users' && (
        <div className="sqb-card overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-sqb-navy flex items-center gap-2">
              <Users size={20} /> System Personnel
            </h2>
            {isHeadAdmin && (
              <button onClick={() => setShowAddUser(true)} className="sqb-btn-primary flex items-center gap-2 text-sm">
                <Plus size={16} /> Add Employee
              </button>
            )}
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-[10px] font-bold text-sqb-grey-secondary uppercase tracking-widest">Табель №</th>
                <th className="text-left px-6 py-3 text-[10px] font-bold text-sqb-grey-secondary uppercase tracking-widest">Full Name</th>
                <th className="text-left px-6 py-3 text-[10px] font-bold text-sqb-grey-secondary uppercase tracking-widest">Assigned Role</th>
                <th className="text-left px-6 py-3 text-[10px] font-bold text-sqb-grey-secondary uppercase tracking-widest">Status</th>
                {isHeadAdmin && <th className="px-6 py-3"></th>}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.tabel_id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-sqb-navy">{u.tabel_id}</td>
                  <td className="px-6 py-4 text-sm">{u.full_name}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[10px] font-bold uppercase px-3 py-1 rounded-full border",
                      u.role.name === 'Admin' ? "bg-sqb-navy text-white border-sqb-navy" : "bg-white text-sqb-navy border-gray-200"
                    )}>
                      {u.role.name.startsWith('CustomRole_') ? 'Custom Permissions' : u.role.name}
                    </span>
                    {u.is_head_admin && <span className="ml-2 text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">HEAD</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-green-700 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> ACTIVE
                    </span>
                  </td>
                  {isHeadAdmin && (
                    <td className="px-6 py-4 text-right">
                      {!u.is_head_admin && (
                        <button
                          onClick={() => { if (confirm(`Delete user ${u.full_name}?`)) deleteMutation.mutate(u.tabel_id); }}
                          className="text-red-400 hover:text-red-600 transition-colors p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Permission Matrix */}
      {activeTab === 'permissions' && (
        <div className="sqb-card overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-sqb-navy flex items-center gap-2">
              <Shield size={20} /> Permission Matrix
            </h2>
            <p className="text-xs text-gray-400 mt-1">Configure what each role can do in the system.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-[10px] font-bold text-sqb-grey-secondary uppercase tracking-widest">Permission</th>
                  {roles.map(r => (
                    <th key={r.id} className="text-center px-6 py-3 text-[10px] font-bold text-sqb-grey-secondary uppercase tracking-widest">{r.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allActions.map(action => (
                  <tr key={action} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-sm font-medium text-sqb-navy">{PERMISSION_LABELS[action]}</td>
                    {roles.map(role => {
                      const perm = role.permissions.find(p => p.action_name === action);
                      const isAllowed = perm?.is_allowed ?? false;
                      return (
                        <td key={role.id} className="px-6 py-4 text-center">
                          <button
                            onClick={() => isHeadAdmin && permMutation.mutate({ roleId: role.id, action, allowed: !isAllowed })}
                            disabled={!isHeadAdmin}
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center transition-all text-sm font-bold mx-auto",
                              isAllowed ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400",
                              isHeadAdmin && "cursor-pointer hover:scale-110"
                            )}
                          >
                            {isAllowed ? '✓' : '✗'}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* System Info */}
      {activeTab === 'system' && (
        <div className="sqb-card p-6 space-y-6">
          <h2 className="text-lg font-bold text-sqb-navy flex items-center gap-2">
            <Server size={20} /> System Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Application', value: 'SQB iABS Uchet Arenda' },
              { label: 'Version', value: 'v2.0.0' },
              { label: 'Environment', value: 'Production' },
              { label: 'Database', value: 'PostgreSQL 15' },
              { label: 'Total Users', value: String(users.length) },
              { label: 'Total Roles', value: String(roles.length) },
              { label: 'Backend', value: 'Node.js + Express + Prisma 7' },
              { label: 'Frontend', value: 'React 19 + Vite + TailwindCSS' },
            ].map((item) => (
              <div key={item.label} className="bg-sqb-bg rounded-xl p-4 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{item.label}</span>
                <span className="text-sm font-bold text-sqb-navy">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddUser(false)} className="absolute inset-0 bg-sqb-navy/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative z-10">
              <div className="bg-sqb-navy p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg"><Plus className="w-5 h-5" /></div>
                  <div>
                    <h2 className="text-lg font-bold">Add Employee</h2>
                    <p className="text-white/50 text-xs">Create a new system user</p>
                  </div>
                </div>
                <button onClick={() => setShowAddUser(false)} className="text-white/60 hover:text-white"><X size={20} /></button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(newUser); }} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-sqb-navy uppercase tracking-widest">Tabel ID</label>
                  <input required value={newUser.tabel_id} onChange={(e) => setNewUser({ ...newUser, tabel_id: e.target.value })} className="w-full bg-sqb-bg border-none rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-sqb-navy/20" placeholder="e.g. 14552" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-sqb-navy uppercase tracking-widest">Full Name</label>
                  <input required value={newUser.full_name} onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })} className="w-full bg-sqb-bg border-none rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-sqb-navy/20" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-sqb-navy uppercase tracking-widest">Password</label>
                  <input required type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="w-full bg-sqb-bg border-none rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-sqb-navy/20" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-sqb-navy uppercase tracking-widest">Button-level Permissions</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {allActions.map(action => (
                      <label key={action} className="flex items-center gap-2 text-sm bg-sqb-bg p-3 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={newUser.permissions.includes(action)}
                          onChange={(e) => {
                            const perms = e.target.checked 
                              ? [...newUser.permissions, action] 
                              : newUser.permissions.filter(p => p !== action);
                            setNewUser({ ...newUser, permissions: perms });
                          }}
                          className="w-4 h-4 accent-sqb-navy rounded border-gray-300"
                        />
                        <span className="font-medium">{PERMISSION_LABELS[action]}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowAddUser(false)} className="flex-1 sqb-btn-ghost">Cancel</button>
                  <button type="submit" className="flex-1 sqb-btn-primary justify-center" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Creating...' : 'Create Employee'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
