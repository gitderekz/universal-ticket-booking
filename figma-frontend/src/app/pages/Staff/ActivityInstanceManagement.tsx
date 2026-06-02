// figma-frontend/src/app/pages/Staff/ActivityInstanceManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { useSystemLogs } from '../../../contexts/SystemLogsContext';
import { useAuth } from '../../../contexts/AuthContext';
import { getActivityInstances, createActivityInstance, updateActivityInstance, deleteActivityInstance, getActivities } from '../../../services/managementService';
import { getFacilities } from '../../../services/adminService';
import { formatDate, formatTime12Hour } from '../../../utils/dateFormatter';
import {
  Plus, Calendar, Clock, Edit, Trash2, Search, Film, X,
  AlertTriangle, CheckCircle2, Users, Building2, DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

interface InstanceFormData {
  activity_id: string;
  facility_id: string;
  start_at: string;
  end_at: string;
  total_slots: number;
  available_slots: number;
  price_modifier: number;
  status: string;
}

const emptyForm = (): InstanceFormData => ({
  activity_id: '',
  facility_id: '',
  start_at: new Date().toISOString().slice(0, 16),
  end_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16),
  total_slots: 100,
  available_slots: 100,
  price_modifier: 0,
  status: 'scheduled',
});

export const ActivityInstanceManagement: React.FC = () => {
  const { formatPrice } = useCurrency();
  const { addLog } = useSystemLogs();
  const { user } = useAuth();

  const [instances, setInstances] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [form, setForm] = useState<InstanceFormData>(emptyForm());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [toastMsg, setToastMsg] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3000);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [instanceData, activityData, facilityData] = await Promise.all([
        getActivityInstances(),
        getActivities(),
        getFacilities(1, 100, ''),
      ]);
      setInstances(instanceData || []);
      setActivities(activityData || []);
      setFacilities(facilityData.facilities || []);
    } catch (error) {
      console.error('Failed to load activity instances', error);
      toast.error('Unable to load instance data');
    }
  };

  const filteredInstances = instances.filter(instance => {
    const activity = activities.find(a => a.id === instance.activity_id);
    const matchSearch = (activity?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || instance.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: instances.length,
    scheduled: instances.filter(i => i.status === 'scheduled').length,
    open: instances.filter(i => i.status === 'open').length,
    closed: instances.filter(i => i.status === 'closed').length,
    cancelled: instances.filter(i => i.status === 'cancelled').length,
    completed: instances.filter(i => i.status === 'completed').length,
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm());
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (instance: any) => {
    setEditTarget(instance);
    setForm({
      activity_id: instance.activity_id || '',
      facility_id: instance.facility_id || '',
      start_at: instance.start_at?.slice(0, 16) || '',
      end_at: instance.end_at?.slice(0, 16) || '',
      total_slots: instance.total_slots || 0,
      available_slots: instance.available_slots || 0,
      price_modifier: parseFloat(instance.price_modifier) || 0,
      status: instance.status || 'scheduled',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.activity_id) errs.activity_id = 'Select an activity';
    if (!form.facility_id) errs.facility_id = 'Select a facility';
    if (!form.start_at) errs.start_at = 'Start time is required';
    if (!form.end_at) errs.end_at = 'End time is required';
    if (new Date(form.start_at) >= new Date(form.end_at)) errs.end_at = 'End time must be after start time';
    if (form.total_slots <= 0) errs.total_slots = 'Total slots must be greater than 0';
    if (form.available_slots < 0) errs.available_slots = 'Available slots cannot be negative';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      const payload = {
        activity_id: form.activity_id,
        facility_id: form.facility_id,
        start_at: form.start_at,
        end_at: form.end_at,
        total_slots: form.total_slots,
        available_slots: form.available_slots,
        price_modifier: form.price_modifier,
        status: form.status,
      };

      if (editTarget) {
        const updated = await updateActivityInstance(editTarget.id, payload);
        setInstances(prev => prev.map(i => i.id === editTarget.id ? updated : i));
        addLog({
          userId: user?.id || '',
          userName: user?.fullName || '',
          action: `Updated activity instance for: ${form.activity_id}`,
          module: 'activity_instances',
          status: 'success',
        });
        showToast('Activity instance updated successfully');
      } else {
        const created = await createActivityInstance(payload);
        setInstances(prev => [created, ...prev]);
        addLog({
          userId: user?.id || '',
          userName: user?.fullName || '',
          action: `Created activity instance for: ${form.activity_id}`,
          module: 'activity_instances',
          status: 'success',
        });
        showToast('Activity instance created successfully');
      }

      setShowModal(false);
    } catch (error: any) {
      console.error('Error saving activity instance:', error);
      showToast(error.response?.data?.message || 'Unable to save instance', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteActivityInstance(deleteTarget.id);
      setInstances(prev => prev.filter(i => i.id !== deleteTarget.id));
      addLog({
        userId: user?.id || '',
        userName: user?.fullName || '',
        action: `Deleted activity instance: ${deleteTarget.id}`,
        module: 'activity_instances',
        status: 'warning',
      });
      showToast('Activity instance deleted');
      setDeleteTarget(null);
    } catch (error: any) {
      console.error('Error deleting activity instance:', error);
      showToast('Unable to delete instance', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-yellow-100 text-yellow-700';
      case 'open': return 'bg-green-100 text-green-700';
      case 'closed': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white font-medium ${
              toastMsg.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            {toastMsg.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Activity Instance Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Schedule and manage facility activity instances</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-md font-medium"
        >
          <Plus className="w-5 h-5" /> Schedule Instance
        </motion.button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-white/70 text-sm">Total</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-white/70 text-sm">Scheduled</p>
          <p className="text-2xl font-bold">{stats.scheduled}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-white/70 text-sm">Open</p>
          <p className="text-2xl font-bold">{stats.open}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-white/70 text-sm">Completed</p>
          <p className="text-2xl font-bold">{stats.completed}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-white/70 text-sm">Cancelled</p>
          <p className="text-2xl font-bold">{stats.cancelled}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by activity name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-lg text-sm border bg-white dark:bg-gray-700"
        >
          <option value="all">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AnimatePresence initial={false}>
          {filteredInstances.map(instance => {
            const activity = activities.find(a => a.id === instance.activity_id);
            const facility = facilities.find(f => f.id === instance.facility_id);
            const statusColor = getStatusColor(instance.status);
            const availablePercentage = (instance.available_slots / instance.total_slots) * 100;

            return (
              <motion.div
                key={instance.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -2 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm"
              >
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white">
                    <Film className="w-5 h-5" />
                    <span className="font-semibold text-sm truncate">{activity?.name || 'Unknown Activity'}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}`}>
                    {instance.status}
                  </span>
                </div>

                <div className="p-5">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {facility?.name || 'Unknown Facility'}
                  </p>

                  <div className="grid grid-cols-2 gap-y-3 gap-x-6 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-400">Date</p>
                        <p className="font-medium">{formatDate(instance.start_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-400">Time</p>
                        <p className="font-medium">{formatTime12Hour(instance.start_at)} - {formatTime12Hour(instance.end_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-400">Slots</p>
                        <p className="font-bold">{instance.available_slots} / {instance.total_slots} available</p>
                      </div>
                    </div>
                    {instance.price_modifier !== 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-400">Price Modifier</p>
                          <p className="font-medium">{instance.price_modifier > 0 ? '+' : ''}{instance.price_modifier}%</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${availablePercentage}%` }}
                    />
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => openEdit(instance)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-purple-600 hover:bg-purple-50 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setDeleteTarget(instance)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredInstances.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-16 text-gray-400 dark:text-gray-500"
        >
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No activity instances found</p>
          <p className="text-sm">Create a new scheduled instance for an activity</p>
        </motion.div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-bold">
                  {editTarget ? 'Edit Instance' : 'Schedule New Instance'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Activity *</label>
                  <select
                    value={form.activity_id}
                    onChange={e => {
                      const activity = activities.find(a => a.id === e.target.value);
                      setForm(f => ({
                        ...f,
                        activity_id: e.target.value,
                        facility_id: activity?.facility_id || '',
                        total_slots: activity?.max_participants || 100,
                        available_slots: activity?.max_participants || 100,
                      }));
                    }}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none ${
                      formErrors.activity_id ? 'border-red-400' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Activity</option>
                    {activities.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                  {formErrors.activity_id && <p className="text-red-500 text-xs mt-1">{formErrors.activity_id}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Facility *</label>
                  <select
                    value={form.facility_id}
                    onChange={e => setForm(f => ({ ...f, facility_id: e.target.value }))}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none ${
                      formErrors.facility_id ? 'border-red-400' : 'border-gray-300'
                    }`}
                    disabled
                  >
                    <option value="">Facility (auto-filled)</option>
                    {facilities.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                  {formErrors.facility_id && <p className="text-red-500 text-xs mt-1">{formErrors.facility_id}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Start Time *</label>
                    <input
                      type="datetime-local"
                      value={form.start_at}
                      onChange={e => setForm(f => ({ ...f, start_at: e.target.value }))}
                      className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none ${
                        formErrors.start_at ? 'border-red-400' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.start_at && <p className="text-red-500 text-xs mt-1">{formErrors.start_at}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">End Time *</label>
                    <input
                      type="datetime-local"
                      value={form.end_at}
                      onChange={e => setForm(f => ({ ...f, end_at: e.target.value }))}
                      className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none ${
                        formErrors.end_at ? 'border-red-400' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.end_at && <p className="text-red-500 text-xs mt-1">{formErrors.end_at}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Total Slots *</label>
                    <input
                      type="number"
                      value={form.total_slots}
                      onChange={e => setForm(f => ({ ...f, total_slots: Number(e.target.value) }))}
                      min="1"
                      className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none ${
                        formErrors.total_slots ? 'border-red-400' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.total_slots && <p className="text-red-500 text-xs mt-1">{formErrors.total_slots}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Available Slots</label>
                    <input
                      type="number"
                      value={form.available_slots}
                      onChange={e => setForm(f => ({ ...f, available_slots: Number(e.target.value) }))}
                      min="0"
                      max={form.total_slots}
                      className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none ${
                        formErrors.available_slots ? 'border-red-400' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.available_slots && <p className="text-red-500 text-xs mt-1">{formErrors.available_slots}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Price Modifier (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.price_modifier}
                      onChange={e => setForm(f => ({ ...f, price_modifier: Number(e.target.value) }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Status</label>
                    <select
                      value={form.status}
                      onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border rounded-xl hover:bg-gray-50 text-sm font-medium">
                    Cancel
                  </button>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave}
                    className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 text-sm font-medium shadow-md"
                  >
                    {editTarget ? 'Save Changes' : 'Schedule Instance'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          >
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Delete Instance</h3>
                  <p className="text-sm text-gray-500">This cannot be undone</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-6 bg-gray-50 p-3 rounded-lg">
                Delete this activity instance? All associated bookings will be affected.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2.5 border rounded-xl">Cancel</button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl shadow-md">Delete Instance</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};