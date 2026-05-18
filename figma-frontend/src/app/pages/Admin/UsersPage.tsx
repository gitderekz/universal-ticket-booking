import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { useSystemLogs } from '../../../contexts/SystemLogsContext';
import { useAuth, UserRole } from '../../../contexts/AuthContext';
import { formatDateTime } from '../../../utils/dateFormatter';
import {
  Plus, Edit, Trash2, Search, X, AlertTriangle, CheckCircle2,
  Users as UsersIcon, Shield, Mail, Phone, Eye, EyeOff, Ban, Loader2
} from 'lucide-react';
import { getUsers, createUser, updateUser, deleteUser } from '../../../services/adminService';
import type { User } from '../../../services/adminService';

interface UserAccount extends User {
  fullName?: string; // Computed from first_name + last_name
  role?: string; // Derived from Roles
  company?: string; // Company name or affiliation
  companyId?: string;
}

const MOCK_USERS: UserAccount[] = [];

const ROLES: UserRole[] = ['customer', 'staff', 'company_admin', 'super_admin', 'developer'];

const roleColors: Record<UserRole, string> = {
  developer: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  super_admin: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  company_admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  staff: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  customer: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  suspended: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  inactive: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
};

const emptyForm = (): Partial<UserAccount> & { password?: string } => ({
  fullName: '',
  email: '',
  first_name: '',
  last_name: '',
  phone: '',
  role: 'customer',
  status: 'active',
  password: '',
});

export const UsersPage: React.FC = () => {
  const { t } = useTranslation();
  const { addLog } = useSystemLogs();
  const { user } = useAuth();

  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<UserAccount | null>(null);
  const [form, setForm] = useState<Partial<UserAccount> & { password?: string }>(emptyForm());
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<UserAccount | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers(1, 100, searchTerm);
      const processedUsers = (response.users || []).map((user: User) => {
        // Resolve role from multiple possible shapes
        const userRole = (
          // direct role field
          (user as any).role || (user as any).role_slug ||
          // roles array
          user.roles?.[0]?.slug || user.Roles?.[0]?.slug ||
          // fallback
          'customer'
        );

        // Try to get company from multiple possible fields
        let company = '';
        let companyId = '';
        if ((user as any).Company?.name) {
          company = (user as any).Company.name;
          companyId = (user as any).Company.id;
        } else if ((user as any).ownedCompanies && (user as any).ownedCompanies.length > 0) {
          company = (user as any).ownedCompanies[0].name;
          companyId = (user as any).ownedCompanies[0].id;
        } else if ((user as any).UserRoles?.[0]?.company?.name) {
          company = (user as any).UserRoles[0].company.name;
          companyId = (user as any).UserRoles[0].company.id;
        } else if ((user as any).userRoles?.[0]?.company?.name) {
          company = (user as any).userRoles[0].company.name;
          companyId = (user as any).userRoles[0].company.id;
        } else if ((user as any).roles?.[0]?.UserRole?.company_id) {
          companyId = (user as any).roles[0].UserRole.company_id;
        } else if ((user as any).Roles?.[0]?.UserRole?.company_id) {
          companyId = (user as any).Roles[0].UserRole.company_id;
        } else if ((user as any).company_id) {
          companyId = (user as any).company_id;
        }

        return {
          ...user,
          fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
          role: userRole,
          company,
          companyId
        };
      });
      setUsers(processedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Reload users when search term changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadUsers();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm());
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (u: UserAccount) => {
    setEditTarget(u);
    setForm({ ...u, password: '' });
    setFormErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.fullName?.trim()) errs.fullName = 'Full name is required';
    if (!form.email?.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.phone?.trim()) errs.phone = 'Phone is required';
    if (!editTarget && !form.password?.trim()) errs.password = 'Password is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const fullName = (form.fullName || '').trim();
    const [first_name, ...rest] = fullName.split(/\s+/);
    const last_name = rest.join(' ') || first_name;

    try {
      if (editTarget) {
        await updateUser(editTarget.id, {
          email: form.email,
          first_name,
          last_name,
          phone: form.phone,
          role_slug: form.role,
          status: form.status,
          company_id: form.company_id,
        });
        addLog({ userId: user?.id || '', userName: user?.fullName || '', action: `Updated user: ${form.email}`, module: 'Users', status: 'success', details: form.email });
        showToast(`User "${fullName}" updated successfully`);
      } else {
        await createUser({
          email: form.email!,
          first_name,
          last_name,
          phone: form.phone!,
          role_slug: form.role!,
          password: form.password!,
          company_id: form.company_id,
        });
        addLog({ userId: user?.id || '', userName: user?.fullName || '', action: `Created user: ${form.email}`, module: 'Users', status: 'success', details: form.email });
        showToast(`User "${fullName}" created successfully`);
      }
      setShowModal(false);
      loadUsers(); // Reload users after save
    } catch (error: any) {
      console.error('Error saving user:', error);
      showToast(error.response?.data?.message || 'Failed to save user', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget.id);
      addLog({ userId: user?.id || '', userName: user?.fullName || '', action: `Deleted user: ${deleteTarget.email}`, module: 'Users', status: 'success', details: deleteTarget.email });
      showToast(`User "${deleteTarget.fullName}" deleted`);
      setDeleteTarget(null);
      loadUsers(); // Reload users after delete
    } catch (error: any) {
      console.error('Error deleting user:', error);
      showToast(error.response?.data?.message || 'Failed to delete user', 'error');
    }
  };

  const toggleStatus = async (u: UserAccount) => {
    const newStatus = u.status === 'active' ? 'suspended' : 'active';
    try {
      await updateUser(u.id, { status: newStatus });
      addLog({ userId: user?.id || '', userName: user?.fullName || '', action: `${newStatus === 'suspended' ? 'Suspended' : 'Activated'} user: ${u.email}`, module: 'Users', status: 'warning', details: u.email });
      showToast(`User ${newStatus === 'suspended' ? 'suspended' : 'activated'}`);
      loadUsers(); // Reload users after status change
    } catch (error: any) {
      console.error('Error updating user status:', error);
      showToast(error.response?.data?.message || 'Failed to update user status', 'error');
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = (u.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm);
    const matchRole = filterRole === 'all' || u.role === filterRole;
    const matchStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    customers: users.filter(u => u.role === 'customer').length,
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white font-medium ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
          >
            <CheckCircle2 className="w-5 h-5" />
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage users, roles, and permissions</p>
        </div>
        <motion.button whileTap={{ scale: 0.97 }} onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md font-medium">
          <Plus className="w-5 h-5" /> Add User
        </motion.button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.total, color: 'from-blue-500 to-cyan-600', icon: <UsersIcon className="w-6 h-6" /> },
          { label: 'Active', value: stats.active, color: 'from-green-500 to-emerald-600', icon: <CheckCircle2 className="w-6 h-6" /> },
          { label: 'Suspended', value: stats.suspended, color: 'from-red-500 to-rose-600', icon: <Ban className="w-6 h-6" /> },
          { label: 'Customers', value: stats.customers, color: 'from-purple-500 to-pink-600', icon: <UsersIcon className="w-6 h-6" /> },
        ].map(s => (
          <motion.div key={s.label} whileHover={{ y: -2 }}
            className={`bg-gradient-to-br ${s.color} rounded-xl p-4 text-white shadow-md`}>
            <div className="flex items-start justify-between mb-2">
              <div className="bg-white/20 p-2 rounded-lg">{s.icon}</div>
            </div>
            <p className="text-white/70 text-sm">{s.label}</p>
            <p className="text-3xl font-bold">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search by name, email, or phone..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', ...ROLES].map(r => (
            <button key={r} onClick={() => setFilterRole(r)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filterRole === r ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
              {r === 'all' ? 'All Roles' : r.replace('_', ' ')}
            </button>
          ))}
          <div className="ml-2 flex gap-2">
            {['all', 'active', 'suspended'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filterStatus === s ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                {s === 'all' ? 'All Status' : s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading users...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">User</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Contact</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Role</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Company</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Joined</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              <>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                      {searchTerm || filterRole !== 'all' || filterStatus !== 'all' ? 'No users match your filters' : 'No users found'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((u, i) => (
                  <motion.tr key={u.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                          {getInitials(u.fullName || '')}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{u.fullName}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="w-3.5 h-3.5" />
                        {u.phone}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${roleColors[(u.role as UserRole) || 'customer']}`}>
                        {(u.role || 'customer').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {u.company || (u as any).Company?.name || u.companyId || (u.role !== 'customer' && u.role !== 'super_admin' && u.role !== 'developer' ? '—' : 'N/A')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[u.status]}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400">
                        {formatDateTime(u.created_at || (u as any).createdAt || (u as any).joined_at || (u as any).created, false)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleStatus(u)}
                          className={`p-1.5 rounded-lg transition-colors ${u.status === 'active' ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30' : 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30'}`}>
                          <Ban className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEdit(u)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(u)}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                  ))
                )}
              </>
            </tbody>
          </table>
        </div>
        )}
      </div>

            <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing{' '}
          <strong className="text-gray-700 dark:text-gray-300">
            {filtered.length}
          </strong>{' '}
          of{' '}
          <strong className="text-gray-700 dark:text-gray-300">
            {users.length}
          </strong>{' '}
          users
        </p>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editTarget ? 'Edit User' : 'Add New User'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name *</label>
                  <input type="text" value={form.fullName || ''} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                    placeholder="John Doe"
                    className={`w-full px-3 py-2.5 border rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none ${formErrors.fullName ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`} />
                  {formErrors.fullName && <p className="text-red-500 text-xs mt-1">{formErrors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email *</label>
                  <input type="email" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="user@example.com"
                    className={`w-full px-3 py-2.5 border rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none ${formErrors.email ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`} />
                  {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone *</label>
                  <input type="tel" value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+255 700 000 000"
                    className={`w-full px-3 py-2.5 border rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none ${formErrors.phone ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`} />
                  {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                </div>

                {!editTarget && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password *</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={form.password || ''} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        placeholder="••••••••"
                        className={`w-full px-3 py-2.5 border rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none pr-10 ${formErrors.password ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`} />
                      <button type="button" onClick={() => setShowPassword(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Role</label>
                    <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))}
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none capitalize">
                      {ROLES.map(r => <option key={r} value={r} className="capitalize">{r.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as UserAccount['status'] }))}
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none capitalize">
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors">
                    Cancel
                  </button>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors shadow-md flex items-center justify-center gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {saving ? 'Saving...' : (editTarget ? 'Save Changes' : 'Create User')}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Delete User</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                Are you sure you want to delete <strong>"{deleteTarget.fullName}"</strong>?
                All associated data will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors">
                  Cancel
                </button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm font-medium transition-colors shadow-md">
                  Delete User
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
