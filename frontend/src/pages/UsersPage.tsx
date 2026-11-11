import React, { useEffect, useState } from 'react';
import { ShieldCheck, Plus, X } from 'lucide-react';
import api from '../api/client';
import { User, Role } from '../types';
import { UsersSkeleton } from '../components/skeleton/PageSkeletons';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New user form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('MEDICAL_OFFICER');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users', { params: { size: 50 } });
      setUsers(res.data.content || []);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await api.post('/users', { fullName, email, password, role });
      setShowModal(false);
      setFullName('');
      setEmail('');
      setPassword('');
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (userId: number, currentActive: boolean) => {
    try {
      await api.patch(`/users/${userId}/active`, { active: !currentActive });
      fetchUsers();
    } catch (err) {
      console.error('Failed to toggle user status', err);
    }
  };

  if (loading && users.length === 0) {
    return <UsersSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-accent" />
            <span>Staff & User Administration</span>
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Role-based access management, credential provisioning, and personnel authorization
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Account</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-bg-surface border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-surface-2/60 border-b border-[var(--border)] text-text-muted font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-5">User ID</th>
                <th className="py-3.5 px-5">Staff Member</th>
                <th className="py-3.5 px-5">Email</th>
                <th className="py-3.5 px-5">Role</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Registered</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-text-primary">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-text-muted">
                    <div className="w-7 h-7 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-2.5" />
                    <span className="font-semibold">Loading staff directory...</span>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.userId} className="hover:bg-bg-surface-2/60 transition-colors">
                    <td className="py-4 px-5 font-mono font-medium text-text-muted">#{u.userId}</td>
                    <td className="py-4 px-5 font-bold text-text-primary">{u.fullName}</td>
                    <td className="py-4 px-5 text-text-secondary font-mono">{u.email}</td>
                    <td className="py-4 px-5">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                        u.role === 'ADMIN'
                          ? 'bg-[#EDE9FE] text-[#7C3AED] border-[#DDD6FE]'
                          : u.role === 'DISPATCHER'
                          ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]'
                          : 'bg-accent-light text-accent border-[var(--border)]'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                        u.active
                          ? 'bg-[#DCFCE7] dark:bg-[var(--success-light)] text-[var(--success)] border-[#86EFAC]'
                          : 'bg-[#FEE2E2] dark:bg-[var(--critical-light)] text-[var(--critical)] border-[#FCA5A5]'
                      }`}>
                        {u.active ? 'ACTIVE' : 'DEACTIVATED'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-text-secondary">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => handleToggleActive(u.userId, u.active)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shadow-sm ${
                          u.active
                            ? 'bg-[#FEE2E2] dark:bg-[var(--critical-light)] border border-[#FCA5A5] text-[var(--critical)] hover:opacity-80'
                            : 'bg-[#DCFCE7] dark:bg-[var(--success-light)] border border-[#86EFAC] text-[var(--success)] hover:opacity-80'
                        }`}
                      >
                        {u.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-[var(--border)] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-text-muted hover:text-text-primary"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-text-primary mb-1">Provision Staff Account</h3>
            <p className="text-xs text-text-secondary mb-4">Assign role and system access</p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-[#FEF2F2] dark:bg-[var(--critical-light)] border border-[#FCA5A5] text-xs text-[var(--critical)]">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Robert House"
                  className="w-full px-3.5 py-2.5 bg-bg-surface-2 border border-[var(--border)] rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1.5">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rhouse@medipriority.com"
                  className="w-full px-3.5 py-2.5 bg-bg-surface-2 border border-[var(--border)] rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1.5">Temporary Password *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 bg-bg-surface-2 border border-[var(--border)] rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1.5">Staff Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full px-3.5 py-2.5 bg-bg-surface-2 border border-[var(--border)] rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="MEDICAL_OFFICER">MEDICAL_OFFICER (Clinical Triage & Bed Allocation)</option>
                  <option value="DISPATCHER">DISPATCHER (Incident Intake & Ambulance Dispatch)</option>
                  <option value="ADMIN">ADMIN (Full System Administration)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-bg-surface-2 border border-[var(--border)] text-xs font-semibold text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-xs font-bold text-white shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Provision User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
