// figma-frontend/src/app/pages/Staff/ActivitiesManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { useSystemLogs } from '../../../contexts/SystemLogsContext';
import { useAuth } from '../../../contexts/AuthContext';
import { getActivities, createActivity, updateActivity, deleteActivity } from '../../../services/managementService';
import { getFacilities } from '../../../services/adminService';
import {
  Plus, Edit, Trash2, Search, X, AlertTriangle, CheckCircle2,
  Film, Music, Trophy, Tent, Home, Calendar, Clock, DollarSign,
  Tag, Star, ChevronDown, Users, Globe, Shield, CalendarDays
} from 'lucide-react';
import { toast } from 'sonner';

const ACTIVITY_TYPES = ['event', 'session', 'programme'] as const;
const GENRES = ['Action', 'Comedy', 'Drama', 'Thriller', 'Animation', 'Documentary', 'Concert', 'Sports', 'Conference', 'Workshop', 'Safari', 'Cultural'];
const LANGUAGES = ['English', 'Swahili', 'French', 'Arabic', 'Spanish', 'German'];
const AGE_RESTRICTIONS = ['G', 'PG', 'PG-13', '16+', '18+', 'All Ages'];

const categoryIcon = (cat: string) => {
  switch (cat) {
    case 'entertainment': return <Film className="w-4 h-4" />;
    case 'events': return <Calendar className="w-4 h-4" />;
    case 'sports': return <Trophy className="w-4 h-4" />;
    case 'outdoor': return <Tent className="w-4 h-4" />;
    case 'housing': return <Home className="w-4 h-4" />;
    default: return <Star className="w-4 h-4" />;
  }
};

const categoryGradient = (cat: string) => {
  switch (cat) {
    case 'entertainment': return 'from-purple-500 to-pink-600';
    case 'events': return 'from-blue-500 to-cyan-600';
    case 'sports': return 'from-green-500 to-emerald-600';
    case 'outdoor': return 'from-orange-500 to-amber-600';
    case 'housing': return 'from-rose-500 to-red-600';
    default: return 'from-gray-500 to-gray-600';
  }
};

const statusBadge = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
    case 'inactive': return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
    case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
    case 'sold_out': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300';
    default: return 'bg-gray-100 text-gray-600';
  }
};

interface ActivityFormData {
  facilityId: string;
  name: string;
  activity_type: string;
  description: string;
  duration_minutes: number;
  max_participants: number;
  base_price: number;
  category: string;
  age_restriction: string;
  language: string;
  date: string;
  genre: string;
  requirements: string;
  status: string;
}

const emptyForm = (): ActivityFormData => ({
  facilityId: '',
  name: '',
  activity_type: 'event',
  description: '',
  duration_minutes: 120,
  max_participants: 100,
  base_price: 0,
  category: '',
  age_restriction: 'All Ages',
  language: 'English',
  date: new Date().toISOString().split('T')[0],
  genre: '',
  requirements: '',
  status: 'active',
});

export const ActivitiesManagement: React.FC = () => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const { addLog } = useSystemLogs();
  const { user } = useAuth();

  const [activities, setActivities] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [form, setForm] = useState<ActivityFormData>(emptyForm());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [toastMsg, setToastMsg] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3000);
  }, []);

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm());
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (activity: any) => {
    setEditTarget(activity);
    setForm({
      facilityId: activity.facility_id || activity.facilityId || '',
      name: activity.name || '',
      activity_type: activity.activity_type || activity.type || 'event',
      description: activity.description || '',
      duration_minutes: activity.duration_minutes || 120,
      max_participants: activity.max_participants || 100,
      base_price: parseFloat(activity.base_price) || 0,
      category: activity.category || '',
      age_restriction: activity.age_restriction || 'All Ages',
      language: activity.language || 'English',
      date: activity.date || new Date().toISOString().split('T')[0],
      genre: activity.genre || '',
      requirements: typeof activity.requirements === 'object' ? JSON.stringify(activity.requirements) : (activity.requirements || ''),
      status: activity.status || 'active',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.facilityId) errs.facilityId = 'Select a facility';
    if (!form.name?.trim()) errs.name = 'Activity name is required';
    if (!form.activity_type) errs.activity_type = 'Select activity type';
    if (form.base_price <= 0) errs.base_price = 'Enter a valid price';
    if (form.duration_minutes <= 0) errs.duration_minutes = 'Duration must be greater than 0';
    if (form.max_participants <= 0) errs.max_participants = 'Max participants must be greater than 0';
    if (!form.date) errs.date = 'Date is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      let requirementsObj = null;
      if (form.requirements && form.requirements.trim()) {
        try {
          requirementsObj = JSON.parse(form.requirements);
        } catch {
          requirementsObj = { notes: form.requirements };
        }
      }

      const payload = {
        facility_id: form.facilityId,
        name: form.name,
        description: form.description,
        activity_type: form.activity_type,
        duration_minutes: form.duration_minutes,
        max_participants: form.max_participants,
        base_price: form.base_price,
        category: form.category,
        age_restriction: form.age_restriction,
        language: form.language,
        date: form.date,
        genre: form.genre,
        requirements: requirementsObj,
        status: form.status,
      };

      if (editTarget) {
        const updated = await updateActivity(editTarget.id, payload);
        setActivities(prev => prev.map(a => a.id === editTarget.id ? updated : a));
        addLog({
          userId: user?.id || '',
          userName: user?.fullName || '',
          action: `Edited activity: ${form.name}`,
          module: 'Activities',
          status: 'success',
          details: `${form.activity_type} - ${form.category}`
        });
        showToast(`"${form.name}" updated successfully`);
      } else {
        const created = await createActivity(payload);
        setActivities(prev => [created, ...prev]);
        addLog({
          userId: user?.id || '',
          userName: user?.fullName || '',
          action: `Created activity: ${form.name}`,
          module: 'Activities',
          status: 'success',
          details: `${form.activity_type} - ${form.category}`
        });
        showToast(`"${form.name}" created successfully`);
      }

      setShowModal(false);
    } catch (error: any) {
      console.error('Error saving activity:', error);
      showToast(error.response?.data?.message || 'Unable to save activity', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteActivity(deleteTarget.id);
      setActivities(prev => prev.filter(a => a.id !== deleteTarget.id));
      addLog({
        userId: user?.id || '',
        userName: user?.fullName || '',
        action: `Deleted activity: ${deleteTarget.name}`,
        module: 'Activities',
        status: 'warning',
        details: `${deleteTarget.activity_type}`
      });
      showToast(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
    } catch (error: any) {
      console.error('Error deleting activity:', error);
      showToast(error.response?.data?.message || 'Unable to delete activity', 'error');
    }
  };

  const filtered = activities.filter(a => {
    const facility = facilities.find(f => f.id === a.facility_id);
    const matchSearch = (a.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'all' || a.activity_type === filterType;
    const matchCat = filterCategory === 'all' || facility?.category === filterCategory;
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchSearch && matchType && matchCat && matchStatus;
  });

  const stats = {
    total: activities.length,
    active: activities.filter(a => a.status === 'active').length,
    cancelled: activities.filter(a => a.status === 'cancelled').length,
    soldOut: activities.filter(a => a.status === 'sold_out').length,
    events: activities.filter(a => a.activity_type === 'event').length,
    sessions: activities.filter(a => a.activity_type === 'session').length,
    programmes: activities.filter(a => a.activity_type === 'programme').length,
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [activityResult, facilityResult] = await Promise.all([
          getActivities(),
          getFacilities(1, 100, ''),
        ]);
        setActivities(activityResult || []);
        setFacilities(facilityResult.facilities || []);
      } catch (error) {
        console.error('Failed to load activities or facilities', error);
        toast.error('Unable to load data');
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('nav.activities')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage events, movies, matches, and activities</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-md font-medium"
        >
          <Plus className="w-5 h-5" /> Add Activity
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-white/70 text-sm">Total</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-white/70 text-sm">Active</p>
          <p className="text-3xl font-bold">{stats.active}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-white/70 text-sm">Cancelled</p>
          <p className="text-3xl font-bold">{stats.cancelled}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-white/70 text-sm">Sold Out</p>
          <p className="text-3xl font-bold">{stats.soldOut}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-white/70 text-sm">Events</p>
          <p className="text-2xl font-bold">{stats.events}</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-white/70 text-sm">Sessions/Programmes</p>
          <p className="text-2xl font-bold">{stats.sessions + stats.programmes}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
            >
              <option value="all">All Types</option>
              <option value="event">Events</option>
              <option value="session">Sessions</option>
              <option value="programme">Programmes</option>
            </select>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
            >
              <option value="all">All Categories</option>
              <option value="entertainment">Entertainment</option>
              <option value="events">Events</option>
              <option value="sports">Sports</option>
              <option value="outdoor">Outdoor</option>
              <option value="housing">Housing</option>
            </select>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="cancelled">Cancelled</option>
              <option value="sold_out">Sold Out</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence initial={false}>
          {filtered.map(activity => {
            const facility = facilities.find(f => f.id === activity.facility_id);
            const company = facility?.Company || null;
            const grad = categoryGradient(facility?.category || '');
            const isExpanded = expandedId === activity.id;

            return (
              <motion.div
                key={activity.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm transition-shadow"
              >
                <div className={`bg-gradient-to-br ${grad} px-5 py-4 flex items-start justify-between`}>
                  <div className="flex items-center gap-2 text-white">
                    {categoryIcon(facility?.category || '')}
                    <span className="text-xs font-medium uppercase tracking-wide opacity-80">
                      {facility?.category}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(activity.status)}`}>
                    {activity.status?.replace('_', ' ') || 'Active'}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1 leading-tight">{activity.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {company?.name || 'Unknown'} · {facility?.name || 'Unknown Facility'}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div className="flex items-center gap-1">
                      <CalendarDays className="w-3 h-3 text-gray-400" />
                      <span>{activity.date || 'TBD'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span>{activity.duration_minutes} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-gray-400" />
                      <span>Max: {activity.max_participants}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe className="w-3 h-3 text-gray-400" />
                      <span>{activity.language || 'English'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : activity.id)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-2 transition-colors"
                  >
                    <span>{isExpanded ? 'Hide' : 'Show'} details</span>
                    <motion.span animate={{ rotate: isExpanded ? 180 : 0 }}>
                      <ChevronDown className="w-3 h-3" />
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                          {activity.description || 'No description provided'}
                        </p>
                        <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-500 dark:text-gray-400">
                          {activity.genre && (
                            <span className="flex items-center gap-1">
                              <Tag className="w-3 h-3" /> Genre: {activity.genre}
                            </span>
                          )}
                          {activity.age_restriction && (
                            <span className="flex items-center gap-1">
                              <Shield className="w-3 h-3" /> {activity.age_restriction}
                            </span>
                          )}
                          {activity.category && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3" /> Category: {activity.category}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" /> Type: {activity.activity_type}
                          </span>
                        </div>
                        {activity.requirements && (
                          <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs">
                            <strong>Requirements:</strong> {
                              typeof activity.requirements === 'object'
                                ? JSON.stringify(activity.requirements)
                                : activity.requirements
                            }
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full capitalize">
                      {activity.activity_type || activity.type}
                    </span>
                    <span className="text-lg font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {formatPrice(activity.base_price || 0)}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-3 mt-3 border-t border-gray-100 dark:border-gray-700">
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => openEdit(activity)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setDeleteTarget(activity)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-sm font-medium transition-colors"
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

      {filtered.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-16 text-gray-400 dark:text-gray-500"
        >
          <Film className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No activities found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
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
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editTarget ? 'Edit Activity' : 'Add New Activity'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Facility *</label>
                  <select
                    value={form.facilityId}
                    onChange={e => setForm(f => ({ ...f, facilityId: e.target.value }))}
                    className={`w-full px-3 py-2.5 border rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none ${
                      formErrors.facilityId ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="">Select Facility</option>
                    {facilities.map(f => (
                      <option key={f.id} value={f.id}>{f.name} ({f.category})</option>
                    ))}
                  </select>
                  {formErrors.facilityId && <p className="text-red-500 text-xs mt-1">{formErrors.facilityId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Activity Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Avengers: Endgame, Simba vs Yanga, Tech Summit 2024"
                    className={`w-full px-3 py-2.5 border rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none ${
                      formErrors.name ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Type *</label>
                    <select
                      value={form.activity_type}
                      onChange={e => setForm(f => ({ ...f, activity_type: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      {ACTIVITY_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
                    <select
                      value={form.status}
                      onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="sold_out">Sold Out</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Brief description of the activity..."
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Price (TZS) *</label>
                    <input
                      type="number"
                      value={form.base_price}
                      onChange={e => setForm(f => ({ ...f, base_price: Number(e.target.value) }))}
                      placeholder="5000"
                      className={`w-full px-3 py-2.5 border rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none ${
                        formErrors.base_price ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {formErrors.base_price && <p className="text-red-500 text-xs mt-1">{formErrors.base_price}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Duration (minutes) *</label>
                    <input
                      type="number"
                      value={form.duration_minutes}
                      onChange={e => setForm(f => ({ ...f, duration_minutes: Number(e.target.value) }))}
                      placeholder="120"
                      className={`w-full px-3 py-2.5 border rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none ${
                        formErrors.duration_minutes ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {formErrors.duration_minutes && <p className="text-red-500 text-xs mt-1">{formErrors.duration_minutes}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Max Participants *</label>
                    <input
                      type="number"
                      value={form.max_participants}
                      onChange={e => setForm(f => ({ ...f, max_participants: Number(e.target.value) }))}
                      placeholder="100"
                      className={`w-full px-3 py-2.5 border rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none ${
                        formErrors.max_participants ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {formErrors.max_participants && <p className="text-red-500 text-xs mt-1">{formErrors.max_participants}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date *</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                      className={`w-full px-3 py-2.5 border rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none ${
                        formErrors.date ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {formErrors.date && <p className="text-red-500 text-xs mt-1">{formErrors.date}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Genre</label>
                    <select
                      value={form.genre}
                      onChange={e => setForm(f => ({ ...f, genre: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      <option value="">None</option>
                      {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Language</label>
                    <select
                      value={form.language}
                      onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Age Restriction</label>
                    <select
                      value={form.age_restriction}
                      onChange={e => setForm(f => ({ ...f, age_restriction: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      {AGE_RESTRICTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    placeholder="e.g., action, comedy, sports, conference"
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Requirements (JSON)</label>
                  <textarea
                    rows={2}
                    value={form.requirements}
                    onChange={e => setForm(f => ({ ...f, requirements: e.target.value }))}
                    placeholder='{"equipment": "Projector", "notes": "Bring ID"}'
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm font-mono focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSave}
                    className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 text-sm font-medium transition-colors shadow-md"
                  >
                    {editTarget ? 'Save Changes' : 'Create Activity'}
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Delete Activity</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                Are you sure you want to delete <strong>"{deleteTarget.name}"</strong>?
                All associated timetables and bookings will be affected.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm font-medium transition-colors shadow-md"
                >
                  Delete Activity
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};








// import React, { useState, useEffect, useCallback } from 'react';
// import { useTranslation } from 'react-i18next';
// import { motion, AnimatePresence } from 'motion/react';
// import { useCurrency } from '../../../contexts/CurrencyContext';
// import { useSystemLogs } from '../../../contexts/SystemLogsContext';
// import { useAuth } from '../../../contexts/AuthContext';
// import { getActivities, createActivity, updateActivity, deleteActivity, ActivityItem } from '../../../services/managementService';
// import { getFacilities } from '../../../services/adminService';
// import {
//   Plus, Edit, Trash2, Search, X, AlertTriangle, CheckCircle2,
//   Film, Music, Trophy, Tent, Home, Calendar, Clock, DollarSign,
//   Tag, Star, ChevronDown
// } from 'lucide-react';

// const ACTIVITY_TYPES = ['event', 'session', 'programme'] as const;
// const GENRES = ['Action', 'Comedy', 'Drama', 'Thriller', 'Animation', 'Documentary', 'Concert', 'Sports', 'Conference', 'Workshop', 'Safari', 'Cultural'];
// const LANGUAGES = ['English', 'Swahili', 'French', 'Arabic'];
// const AGE_RESTRICTIONS = ['G', 'PG', 'PG-13', '16+', '18+', 'All Ages'];

// const categoryIcon = (cat: string) => {
//   switch (cat) {
//     case 'entertainment': return <Film className="w-4 h-4" />;
//     case 'events': return <Calendar className="w-4 h-4" />;
//     case 'sports': return <Trophy className="w-4 h-4" />;
//     case 'outdoor': return <Tent className="w-4 h-4" />;
//     case 'housing': return <Home className="w-4 h-4" />;
//     default: return <Star className="w-4 h-4" />;
//   }
// };

// const categoryGradient = (cat: string) => {
//   switch (cat) {
//     case 'entertainment': return 'from-purple-500 to-pink-600';
//     case 'events': return 'from-blue-500 to-cyan-600';
//     case 'sports': return 'from-green-500 to-emerald-600';
//     case 'outdoor': return 'from-orange-500 to-amber-600';
//     case 'housing': return 'from-rose-500 to-red-600';
//     default: return 'from-gray-500 to-gray-600';
//   }
// };

// const statusBadge = (status: string) => {
//   switch (status) {
//     case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
//     case 'inactive': return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
//     case 'sold_out': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
//     default: return 'bg-gray-100 text-gray-600';
//   }
// };

// const emptyForm = (): Partial<Activity> => ({
//   facilityId: '',
//   name: '',
//   type: 'event',
//   description: '',
//   price: 0,
//   duration: '',
//   ageRestriction: 'All Ages',
//   language: 'English',
//   genre: '',
//   status: 'active',
//   date: new Date().toISOString().split('T')[0],
// });

// export const ActivitiesManagement: React.FC = () => {
//   const { t } = useTranslation();
//   const { formatPrice } = useCurrency();
//   const { addLog } = useSystemLogs();
//   const { user } = useAuth();

//   const [activities, setActivities] = useState<any[]>([]);
//   const [facilities, setFacilities] = useState<any[]>([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterType, setFilterType] = useState<string>('all');
//   const [filterCategory, setFilterCategory] = useState<string>('all');

//   const [showModal, setShowModal] = useState(false);
//   const [editTarget, setEditTarget] = useState<Activity | null>(null);
//   const [form, setForm] = useState<Partial<Activity>>(emptyForm());
//   const [formErrors, setFormErrors] = useState<Record<string, string>>({});

//   const [deleteTarget, setDeleteTarget] = useState<Activity | null>(null);
//   const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
//   const [expandedId, setExpandedId] = useState<string | null>(null);

//   const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 3000);
//   }, []);

//   const openAdd = () => {
//     setEditTarget(null);
//     setForm(emptyForm());
//     setFormErrors({});
//     setShowModal(true);
//   };

//   const openEdit = (activity: any) => {
//     setEditTarget(activity);
//     setForm({
//       ...activity,
//       facilityId: activity.facility_id || activity.facilityId || '',
//       name: activity.name || '',
//       type: activity.activity_type || activity.type || 'event',
//       status: activity.status || 'active',
//     });
//     setFormErrors({});
//     setShowModal(true);
//   };

//   const validate = () => {
//     const errs: Record<string, string> = {};
//     if (!form.facilityId) errs.facilityId = 'Select a facility';
//     if (!form.name?.trim()) errs.name = 'Name is required';
//     if (!form.type) errs.type = 'Select a type';
//     if (!form.price || form.price <= 0) errs.price = 'Enter a valid price';
//     setFormErrors(errs);
//     return Object.keys(errs).length === 0;
//   };

//   const handleSave = async () => {
//     if (!validate()) return;

//     try {
//       if (editTarget) {
//         const updated = await updateActivity(editTarget.id, {
//           facility_id: form.facilityId,
//           name: form.name,
//           description: form.description,
//           activity_type: form.type,
//           duration_minutes: form.duration ? parseInt(form.duration, 10) : undefined,
//           base_price: form.price,
//           category: form.genre || undefined,
//           requirements: form.requirements,
//           status: form.status,
//         });

//         setActivities(prev => prev.map(a => a.id === editTarget.id ? updated : a));
//         addLog({ userId: user?.id || '', userName: user?.fullName || '', action: `Edited activity: ${form.name}`, module: 'Activities', status: 'success', details: form.name });
//         showToast(`"${form.name}" updated successfully`);
//       } else {
//         const created = await createActivity({
//           facility_id: form.facilityId!,
//           name: form.name!,
//           description: form.description,
//           activity_type: form.type || 'event',
//           duration_minutes: form.duration ? parseInt(form.duration, 10) : undefined,
//           max_participants: form.max_participants,
//           base_price: form.price,
//           category: form.genre,
//           requirements: form.requirements,
//           status: form.status,
//         });

//         setActivities(prev => [created, ...prev]);
//         addLog({ userId: user?.id || '', userName: user?.fullName || '', action: `Created activity: ${form.name}`, module: 'Activities', status: 'success', details: form.name });
//         showToast(`"${form.name}" created successfully`);
//       }

//       setShowModal(false);
//     } catch (error) {
//       console.error('Error saving activity:', error);
//       showToast('Unable to save activity', 'error');
//     }
//   };

//   const handleDelete = async () => {
//     if (!deleteTarget) return;
//     try {
//       await deleteActivity(deleteTarget.id);
//       setActivities(prev => prev.filter(a => a.id !== deleteTarget.id));
//       addLog({ userId: user?.id || '', userName: user?.fullName || '', action: `Deleted activity: ${deleteTarget.name}`, module: 'Activities', status: 'success', details: deleteTarget.name });
//       showToast(`"${deleteTarget.name}" deleted`);
//       setDeleteTarget(null);
//     } catch (error) {
//       console.error('Error deleting activity:', error);
//       showToast('Unable to delete activity', 'error');
//     }
//   };

//   const filtered = activities.filter(a => {
//     const facility = facilities.find(f => f.id === a.facility_id);
//     const matchSearch = (a.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
//       (a.description || '').toLowerCase().includes(searchTerm.toLowerCase());
//     const matchType = filterType === 'all' || a.activity_type === filterType;
//     const matchCat = filterCategory === 'all' || facility?.category === filterCategory;
//     return matchSearch && matchType && matchCat;
//   });

//   const stats = {
//     total: activities.length,
//     active: activities.filter(a => a.status === 'active').length,
//     soldOut: activities.filter(a => a.status === 'sold_out').length,
//     events: activities.filter(a => a.type === 'event').length,
//   };

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const [activityResult, facilityResult] = await Promise.all([
//           getActivities(),
//           getFacilities(1, 100, ''),
//         ]);
//         setActivities(activityResult || []);
//         setFacilities(facilityResult.facilities || []);
//       } catch (error) {
//         console.error('Failed to load activities or facilities', error);
//       }
//     };
//     loadData();
//   }, []);

//   return (
//     <div className="space-y-6">
//       <AnimatePresence>
//         {toast && (
//           <motion.div
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -20 }}
//             className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white font-medium ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
//           >
//             <CheckCircle2 className="w-5 h-5" />
//             {toast.msg}
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('nav.activities')}</h1>
//           <p className="text-gray-500 dark:text-gray-400 mt-1">Manage events, movies, matches, and activities</p>
//         </div>
//         <motion.button whileTap={{ scale: 0.97 }} onClick={openAdd}
//           className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-md font-medium">
//           <Plus className="w-5 h-5" /> Add Activity
//         </motion.button>
//       </div>

//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         {[
//           { label: 'Total', value: stats.total, color: 'from-purple-500 to-pink-600' },
//           { label: 'Active', value: stats.active, color: 'from-green-500 to-emerald-600' },
//           { label: 'Sold Out', value: stats.soldOut, color: 'from-red-500 to-rose-600' },
//           { label: 'Events', value: stats.events, color: 'from-blue-500 to-cyan-600' },
//         ].map(s => (
//           <motion.div key={s.label} whileHover={{ y: -2 }}
//             className={`bg-gradient-to-br ${s.color} rounded-xl p-4 text-white shadow-md`}>
//             <p className="text-white/70 text-sm">{s.label}</p>
//             <p className="text-3xl font-bold">{s.value}</p>
//           </motion.div>
//         ))}
//       </div>

//       <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
//         <div className="flex flex-col md:flex-row gap-4">
//           <div className="flex-1 relative">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//             <input type="text" placeholder="Search activities..." value={searchTerm}
//               onChange={e => setSearchTerm(e.target.value)}
//               className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
//           </div>
//           <div className="flex gap-2 flex-wrap">
//             {['all', ...ACTIVITY_TYPES].map(t => (
//               <button key={t} onClick={() => setFilterType(t)}
//                 className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filterType === t ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
//                 {t === 'all' ? 'All Types' : t}
//               </button>
//             ))}
//           </div>
//           <div className="flex gap-2 flex-wrap">
//             {['all', 'entertainment', 'events', 'sports', 'outdoor', 'housing'].map(c => (
//               <button key={c} onClick={() => setFilterCategory(c)}
//                 className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filterCategory === c ? 'bg-pink-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
//                 {c === 'all' ? 'All Categories' : c}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
//         <AnimatePresence initial={false}>
//           {filtered.map(activity => {
//             const facility = facilities.find(f => f.id === activity.facility_id);
//             const company = facility?.Company || null;
//             const grad = categoryGradient(facility?.category || '');
//             const isExpanded = expandedId === activity.id;

//             return (
//               <motion.div key={activity.id}
//                 layout
//                 initial={{ opacity: 0, scale: 0.95 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 exit={{ opacity: 0, scale: 0.9 }}
//                 whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}
//                 className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm transition-shadow">

//                 <div className={`bg-gradient-to-br ${grad} px-5 py-4 flex items-start justify-between`}>
//                   <div className="flex items-center gap-2 text-white">
//                     {categoryIcon(facility?.category || '')}
//                     <span className="text-xs font-medium uppercase tracking-wide opacity-80">
//                       {facility?.category}
//                     </span>
//                   </div>
//                   <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(activity.status)}`}>
//                     {activity.status.replace('_', ' ')}
//                   </span>
//                 </div>

//                 <div className="p-5">
//                   <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1 leading-tight">{activity.name}</h3>
//                   <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
//                     {company?.name} · {facility?.name}
//                   </p>

//                   <button onClick={() => setExpandedId(isExpanded ? null : activity.id)}
//                     className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-2 transition-colors">
//                     <span>{isExpanded ? 'Hide' : 'Show'} details</span>
//                     <motion.span animate={{ rotate: isExpanded ? 180 : 0 }}>
//                       <ChevronDown className="w-3 h-3" />
//                     </motion.span>
//                   </button>

//                   <AnimatePresence>
//                     {isExpanded && (
//                       <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
//                         className="overflow-hidden">
//                         <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">{activity.description}</p>
//                         <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-500 dark:text-gray-400">
//                           {activity.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{activity.duration}</span>}
//                           {activity.language && <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{activity.language}</span>}
//                           {activity.genre && <span className="flex items-center gap-1"><Film className="w-3 h-3" />{activity.genre}</span>}
//                           {activity.ageRestriction && <span className="flex items-center gap-1"><Star className="w-3 h-3" />{activity.ageRestriction}</span>}
//                         </div>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>

//                   <div className="flex items-center justify-between mb-4">
//                     <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full capitalize">
//                       {activity.type}
//                     </span>
//                     <span className="text-lg font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
//                       <DollarSign className="w-4 h-4" />{formatPrice(activity.base_price || 0)}
//                     </span>
//                   </div>

//                   <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
//                     <motion.button whileTap={{ scale: 0.96 }} onClick={() => openEdit(activity)}
//                       className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg text-sm font-medium transition-colors">
//                       <Edit className="w-4 h-4" /> Edit
//                     </motion.button>
//                     <motion.button whileTap={{ scale: 0.96 }} onClick={() => setDeleteTarget(activity)}
//                       className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-sm font-medium transition-colors">
//                       <Trash2 className="w-4 h-4" /> Delete
//                     </motion.button>
//                   </div>
//                 </div>
//               </motion.div>
//             );
//           })}
//         </AnimatePresence>
//       </div>

//       {filtered.length === 0 && (
//         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
//           className="text-center py-16 text-gray-400 dark:text-gray-500">
//           <Film className="w-12 h-12 mx-auto mb-3 opacity-30" />
//           <p className="text-lg font-medium">No activities found</p>
//           <p className="text-sm">Try adjusting your search or filters</p>
//         </motion.div>
//       )}

//       <AnimatePresence>
//         {showModal && (
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
//             <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
//               className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
//               <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
//                 <h2 className="text-xl font-bold text-gray-900 dark:text-white">
//                   {editTarget ? 'Edit Activity' : 'Add New Activity'}
//                 </h2>
//                 <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
//                   <X className="w-5 h-5 text-gray-500" />
//                 </button>
//               </div>

//               <div className="p-6 space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Facility *</label>
//                   <select value={form.facilityId} onChange={e => setForm(f => ({ ...f, facilityId: e.target.value }))}
//                     className={`w-full px-3 py-2.5 border rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none ${formErrors.facilityId ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`}>
//                     <option value="">Select Facility</option>
//                     {facilities.map(f => (
//                       <option key={f.id} value={f.id}>{f.name} ({f.category})</option>
//                     ))}
//                   </select>
//                   {formErrors.facilityId && <p className="text-red-500 text-xs mt-1">{formErrors.facilityId}</p>}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Activity Name *</label>
//                   <input type="text" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
//                     placeholder="e.g. Avengers: Endgame, Simba vs. Yanga"
//                     className={`w-full px-3 py-2.5 border rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none ${formErrors.name ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`} />
//                   {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
//                 </div>

//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Type *</label>
//                     <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as Activity['type'] }))}
//                       className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none">
//                       {ACTIVITY_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
//                     <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Activity['status'] }))}
//                       className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none">
//                       <option value="active">Active</option>
//                       <option value="inactive">Inactive</option>
//                       <option value="sold_out">Sold Out</option>
//                     </select>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
//                   <textarea rows={3} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
//                     placeholder="Brief description of the activity..."
//                     className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none" />
//                 </div>

//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Price (TZS) *</label>
//                     <input type="number" value={form.price || ''} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
//                       placeholder="5000"
//                       className={`w-full px-3 py-2.5 border rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none ${formErrors.price ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`} />
//                     {formErrors.price && <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>}
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Duration</label>
//                     <input type="text" value={form.duration || ''} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
//                       placeholder="2h 30min"
//                       className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-3 gap-3">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Genre</label>
//                     <select value={form.genre || ''} onChange={e => setForm(f => ({ ...f, genre: e.target.value }))}
//                       className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none">
//                       <option value="">None</option>
//                       {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Language</label>
//                     <select value={form.language || 'English'} onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
//                       className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none">
//                       {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Age</label>
//                     <select value={form.ageRestriction || 'All Ages'} onChange={e => setForm(f => ({ ...f, ageRestriction: e.target.value }))}
//                       className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none">
//                       {AGE_RESTRICTIONS.map(a => <option key={a} value={a}>{a}</option>)}
//                     </select>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date</label>
//                   <input type="date" value={form.date || ''} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
//                     className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
//                 </div>

//                 <div className="flex gap-3 pt-2">
//                   <button onClick={() => setShowModal(false)}
//                     className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors">
//                     Cancel
//                   </button>
//                   <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave}
//                     className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 text-sm font-medium transition-colors shadow-md">
//                     {editTarget ? 'Save Changes' : 'Create Activity'}
//                   </motion.button>
//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <AnimatePresence>
//         {deleteTarget && (
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
//             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
//               className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center flex-shrink-0">
//                   <AlertTriangle className="w-6 h-6 text-red-600" />
//                 </div>
//                 <div>
//                   <h3 className="font-bold text-gray-900 dark:text-white">Delete Activity</h3>
//                   <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
//                 </div>
//               </div>
//               <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
//                 Are you sure you want to delete <strong>"{deleteTarget.name}"</strong>?
//                 All associated timetables and bookings will be affected.
//               </p>
//               <div className="flex gap-3">
//                 <button onClick={() => setDeleteTarget(null)}
//                   className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors">
//                   Cancel
//                 </button>
//                 <motion.button whileTap={{ scale: 0.97 }} onClick={handleDelete}
//                   className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm font-medium transition-colors shadow-md">
//                   Delete Activity
//                 </motion.button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };
