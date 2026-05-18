import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { useSystemLogs } from '../../../contexts/SystemLogsContext';
import { useAuth } from '../../../contexts/AuthContext';
import { formatDateTime, formatDate, formatTime12Hour, formatDateTimeRange } from '../../../utils/dateFormatter';
import {
  getTimetables,
  getRoutes,
  getActivities,
  createJourney,
  updateJourney,
  deleteJourney,
  getActivityInstances,
  createActivityInstance,
  updateActivityInstance,
  deleteActivityInstance,
  RouteItem,
  ActivityItem,
  TimetableItem
} from '../../../services/managementService';
import {
  Plus, Calendar, Clock, Edit, Trash2, Search, Bus, Film,
  X, AlertTriangle, CheckCircle2, ChevronRight, Users,
  Plane, Ship, Train, Car
} from 'lucide-react';

const transportIcon = (type: string) => {
  switch (type) {
    case 'airplane': return <Plane className="w-4 h-4" />;
    case 'ferry': case 'ship': case 'boat': return <Ship className="w-4 h-4" />;
    case 'train': return <Train className="w-4 h-4" />;
    default: return <Bus className="w-4 h-4" />;
  }
};

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  full: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  completed: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
};

const convertTo12Hour = (time24: string) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const swahiliHour = (hour + 6) % 24;
  const period = swahiliHour < 12 ? 'usiku' : swahiliHour < 18 ? 'mchana' : 'jioni';
  const displayHour = swahiliHour === 0 ? 12 : swahiliHour > 12 ? swahiliHour - 12 : swahiliHour;
  return `${time24} (${displayHour}:${minutes} ${period})`;
};

const emptyForm = (): Partial<TimetableItem> => ({
  routeId: '',
  activityId: '',
  date: new Date().toISOString().split('T')[0],
  journey_date: new Date().toISOString().split('T')[0],
  startTime: '08:00',
  endTime: '10:00',
  departure_at: '08:00',
  arrival_at: '10:00',
  availableSeats: 40,
  available_seats: 40,
  status: 'scheduled',
});

export const TimetablesManagement: React.FC = () => {
  const { t } = useTranslation();
  const { addLog } = useSystemLogs();
  const { user } = useAuth();

  const [timetables, setTimetables] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'transport' | 'facility'>('all');

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'transport' | 'facility'>('transport');
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [form, setForm] = useState<any>(emptyForm());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const getTimetableLabel = (tt: any) => {
    const routeId = tt.routeId || tt.route_id;
    const activityId = tt.activityId || tt.activity_id;
    if (routeId) {
      const route = routes.find(r => r.id === routeId);
      const start = route?.startLocation || route?.originStation?.name || 'Unknown';
      const end = route?.endLocation || route?.destinationStation?.name || 'Unknown';
      return `${start} → ${end}`;
    }
    if (activityId) {
      const activity = activities.find(a => a.id === activityId);
      return activity?.name || 'Unknown Activity';
    }
    return 'Unknown';
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [journeyData, routeData, activityData, activityInstances] = await Promise.all([
          getTimetables(),
          getRoutes(),
          getActivities(),
          getActivityInstances()
        ]);

        const journeyItems = (journeyData || []).map((journey) => ({
          ...journey,
          type: 'journey',
          routeId: journey.route_id,
          activityId: undefined,
          startTime: journey.departure_at,
          endTime: journey.arrival_at,
          availableSeats: journey.available_seats,
          status: journey.status || 'scheduled',
        }));

        const activityItems = (activityInstances || []).map((instance) => ({
          ...instance,
          type: 'activity_instance',
          routeId: undefined,
          activityId: instance.activity_id,
          startTime: instance.start_at,
          endTime: instance.end_at,
          availableSeats: instance.available_slots,
          status: instance.status,
        }));

        setTimetables([...journeyItems, ...activityItems]);
        setRoutes(routeData || []);
        setActivities(activityData || []);
      } catch (error) {
        console.error('Failed to load timetables, routes, or activities', error);
      }
    };
    loadData();
  }, []);

  const openAdd = (type: 'transport' | 'facility') => {
    setModalType(type);
    setEditTarget(null);
    setForm({ ...emptyForm(), routeId: type === 'transport' ? '' : undefined, activityId: type === 'facility' ? '' : undefined });
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (tt: any) => {
    setEditTarget(tt);
    const hasRoute = !!(tt.routeId || tt.route_id);
    setModalType(hasRoute ? 'transport' : 'facility');
    setForm({
      ...tt,
      routeId: tt.routeId || tt.route_id || '',
      activityId: tt.activityId || tt.activity_id || '',
      date: tt.date || tt.journey_date || '',
      startTime: tt.startTime || tt.departure_at || tt.start_at || '',
      endTime: tt.endTime || tt.arrival_at || tt.end_at || '',
      availableSeats: tt.availableSeats || tt.available_seats || tt.available_slots || 0,
      status: tt.status,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (modalType === 'transport' && !form.routeId) errs.routeId = 'Select a route';
    if (modalType === 'facility' && !form.activityId) errs.activityId = 'Select an activity';
    if (!form.date) errs.date = 'Date is required';
    if (!form.startTime) errs.startTime = 'Start time required';
    if (!form.endTime) errs.endTime = 'End time required';
    if (!form.availableSeats || form.availableSeats <= 0) errs.availableSeats = 'Enter valid seat count';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      const isTransport = modalType === 'transport';
      const route = routes.find(r => r.id === form.routeId);
      const activity = activities.find(a => a.id === form.activityId);
      let savedItem: any;

      if (editTarget) {
        if (editTarget.type === 'journey') {
          savedItem = await updateJourney(editTarget.id, {
            route_id: form.routeId,
            transport_id: route?.transport_id || route?.Transport?.id,
            journey_date: form.date || form.journey_date,
            departure_at: form.startTime || form.departure_at,
            arrival_at: form.endTime || form.arrival_at,
            available_seats: form.availableSeats,
            status: form.status,
          });
          savedItem.type = 'journey';
          savedItem.startTime = savedItem.departure_at;
          savedItem.endTime = savedItem.arrival_at;
          savedItem.availableSeats = savedItem.available_seats;
        } else {
          savedItem = await updateActivityInstance(editTarget.id, {
            start_at: form.startTime || form.start_at,
            end_at: form.endTime || form.end_at,
            available_slots: form.availableSeats,
            status: form.status,
          });
          savedItem.type = 'activity_instance';
          savedItem.startTime = savedItem.start_at;
          savedItem.endTime = savedItem.end_at;
          savedItem.availableSeats = savedItem.available_slots;
        }

        setTimetables(prev => prev.map(tt => tt.id === editTarget.id ? { ...tt, ...savedItem } : tt));
        addLog({ userId: user?.id || '', userName: user?.fullName || '', action: `Edited timetable: ${getTimetableLabel(savedItem)}`, module: 'Timetables', status: 'success', details: getTimetableLabel(savedItem) });
        showToast('Schedule updated successfully');
      } else if (isTransport) {
        if (!route) {
          showToast('Selected route is unavailable', 'error');
          return;
        }
        savedItem = await createJourney({
          route_id: form.routeId,
          transport_id: route.transport_id || route.Transport?.id,
          journey_date: form.date || form.journey_date,
          departure_at: form.startTime,
          arrival_at: form.endTime,
          available_seats: form.availableSeats,
          status: form.status,
        });
        savedItem.type = 'journey';
        savedItem.startTime = savedItem.departure_at;
        savedItem.endTime = savedItem.arrival_at;
        savedItem.availableSeats = savedItem.available_seats;
        setTimetables(prev => [savedItem, ...prev]);
        addLog({ userId: user?.id || '', userName: user?.fullName || '', action: `Created timetable: ${getTimetableLabel(savedItem)}`, module: 'Timetables', status: 'success', details: getTimetableLabel(savedItem) });
        showToast('Schedule created successfully');
      } else {
        if (!activity) {
          showToast('Selected activity is unavailable', 'error');
          return;
        }
        savedItem = await createActivityInstance({
          activity_id: form.activityId,
          facility_id: activity.facility_id || activity.Facility?.id,
          start_at: form.startTime,
          end_at: form.endTime,
          total_slots: form.availableSeats,
          available_slots: form.availableSeats,
          status: form.status,
        });
        savedItem.type = 'activity_instance';
        savedItem.startTime = savedItem.start_at;
        savedItem.endTime = savedItem.end_at;
        savedItem.availableSeats = savedItem.available_slots;
        setTimetables(prev => [savedItem, ...prev]);
        addLog({ userId: user?.id || '', userName: user?.fullName || '', action: `Created timetable: ${getTimetableLabel(savedItem)}`, module: 'Timetables', status: 'success', details: getTimetableLabel(savedItem) });
        showToast('Schedule created successfully');
      }

      setShowModal(false);
    } catch (error) {
      console.error('Error saving timetable:', error);
      showToast('Unable to save timetable', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'journey') {
        await deleteJourney(deleteTarget.id);
      } else {
        await deleteActivityInstance(deleteTarget.id);
      }
      const label = getTimetableLabel(deleteTarget);
      setTimetables(prev => prev.filter(tt => tt.id !== deleteTarget.id));
      addLog({ userId: user?.id || '', userName: user?.fullName || '', action: `Deleted timetable: ${label}`, module: 'Timetables', status: 'success', details: label });
      showToast('Schedule deleted');
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting timetable:', error);
      showToast('Unable to delete timetable', 'error');
    }
  };

  const filtered = timetables.filter(tt => {
    const label = getTimetableLabel(tt).toLowerCase();
    const matchSearch = label.includes(searchTerm.toLowerCase());
    const routeId = tt.routeId || tt.route_id;
    const activityId = tt.activityId || tt.activity_id;
    const matchType = filterType === 'all' ||
      (filterType === 'transport' && !!routeId) ||
      (filterType === 'facility' && !!activityId);
    return matchSearch && matchType;
  });

  const stats = {
    total: timetables.length,
    transport: timetables.filter(t => t.routeId).length,
    facility: timetables.filter(t => t.activityId).length,
    active: timetables.filter(t => t.status === 'active').length,
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white font-medium bg-green-600">
            <CheckCircle2 className="w-5 h-5" />
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('nav.timetables')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Schedule departures, events, and activities</p>
        </div>
        <div className="flex gap-2">
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => openAdd('transport')}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md font-medium text-sm">
            <Bus className="w-4 h-4" /> Schedule Transport
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => openAdd('facility')}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-md font-medium text-sm">
            <Film className="w-4 h-4" /> Schedule Activity
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'from-slate-500 to-gray-600' },
          { label: 'Transport', value: stats.transport, color: 'from-blue-500 to-cyan-600' },
          { label: 'Facility', value: stats.facility, color: 'from-purple-500 to-pink-600' },
          { label: 'Active', value: stats.active, color: 'from-green-500 to-emerald-600' },
        ].map(s => (
          <motion.div key={s.label} whileHover={{ y: -2 }}
            className={`bg-gradient-to-br ${s.color} rounded-xl p-4 text-white shadow-md`}>
            <p className="text-white/70 text-sm">{s.label}</p>
            <p className="text-3xl font-bold">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search timetables..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div className="flex gap-2">
          {(['all', 'transport', 'facility'] as const).map(f => (
            <button key={f} onClick={() => setFilterType(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${filterType === f ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
              {f === 'all' ? 'All' : f === 'transport' ? 'Transport' : 'Facility'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800 text-sm">
        <p className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Swahili Time Reference</p>
        <div className="flex flex-wrap gap-4 text-blue-700 dark:text-blue-400 text-xs">
          <span>06:00 = midnight (saa 12 usiku) · 07:00 = saa 1 asubuhi · 12:00 = saa 6 asubuhi · 18:00 = saa 12 mchana · 00:00 = saa 6 usiku</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AnimatePresence initial={false}>
          {filtered.map(tt => {
            let title = '';
            let subtitle = '';
            let color = 'from-blue-500 to-blue-600';
            let icon = <Bus className="w-5 h-5 text-white" />;

            const routeId = tt.routeId || tt.route_id;
            const activityId = tt.activityId || tt.activity_id;

            if (routeId) {
              const route = routes.find(r => r.id === routeId);
              const startLoc = route?.startLocation || route?.originStation?.name || 'Unknown';
              const endLoc = route?.endLocation || route?.destinationStation?.name || 'Unknown';
              title = `${startLoc} → ${endLoc}`;
              subtitle = route?.Transport?.name || 'Unknown transport';
              color = 'from-blue-500 to-cyan-600';
            } else if (activityId) {
              const activity = activities.find(a => a.id === activityId);
              title = activity?.name || 'Unknown Activity';
              subtitle = activity?.Facility?.name || activity?.facility_id || 'Unknown facility';
              icon = <Film className="w-5 h-5 text-white" />;
              color = 'from-purple-500 to-pink-600';
            }

            const seatsColor = tt.availableSeats > 20 ? 'text-green-600 dark:text-green-400'
              : tt.availableSeats > 10 ? 'text-orange-500 dark:text-orange-400'
              : 'text-red-600 dark:text-red-400';

            return (
              <motion.div key={tt.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">

                <div className={`bg-gradient-to-r ${color} px-5 py-3 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    {icon}
                    <span className="text-white font-semibold text-sm truncate max-w-[240px]">{title}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[tt.status]}`}>
                    {tt.status}
                  </span>
                </div>

                <div className="p-5">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{subtitle}</p>

                  <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Date</p>
                        <p className="font-medium text-gray-800 dark:text-white">{formatDate(tt.date || tt.journey_date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Available</p>
                        <p className={`font-bold ${seatsColor}`}>{tt.availableSeats} seats</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Departure</p>
                        <p className="font-medium text-gray-800 dark:text-white">{formatTime12Hour(tt.startTime || tt.departure_at, false)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Arrival</p>
                        <p className="font-medium text-gray-800 dark:text-white">{formatTime12Hour(tt.endTime || tt.arrival_at, false)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <motion.button whileTap={{ scale: 0.96 }} onClick={() => openEdit(tt)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg text-sm font-medium transition-colors">
                      <Edit className="w-4 h-4" /> Edit
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.96 }} onClick={() => setDeleteTarget(tt)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-sm font-medium transition-colors">
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
          className="text-center py-16 text-gray-400 dark:text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No schedules found</p>
          <p className="text-sm">Create a new transport or activity schedule</p>
        </motion.div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${modalType === 'transport' ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-purple-100 dark:bg-purple-900/40'}`}>
                    {modalType === 'transport'
                      ? <Bus className={`w-5 h-5 ${modalType === 'transport' ? 'text-blue-600' : 'text-purple-600'}`} />
                      : <Film className="w-5 h-5 text-purple-600" />}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editTarget ? 'Edit Schedule' : modalType === 'transport' ? 'Schedule Transport' : 'Schedule Activity'}
                  </h2>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {modalType === 'transport' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Route *</label>
                    <select value={form.routeId || ''} onChange={e => setForm(f => ({ ...f, routeId: e.target.value }))}
                      className={`w-full px-3 py-2.5 border rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none ${formErrors.routeId ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`}>
                      <option value="">Select Route</option>
                      {routes.map(r => {
                        const startLoc = r.startLocation || r.originStation?.name || 'Unknown';
                        const endLoc = r.endLocation || r.destinationStation?.name || 'Unknown';
                        const company = r.Company?.name || 'Unknown Company';
                        return (
                          <option key={r.id} value={r.id}>
                            {startLoc} → {endLoc} ({company})
                          </option>
                        );
                      })}
                    </select>
                    {formErrors.routeId && <p className="text-red-500 text-xs mt-1">{formErrors.routeId}</p>}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Activity *</label>
                    <select value={form.activityId || ''} onChange={e => setForm(f => ({ ...f, activityId: e.target.value }))}
                      className={`w-full px-3 py-2.5 border rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none ${formErrors.activityId ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`}>
                      <option value="">Select Activity</option>
                      {activities.map(a => {
                        const facility = a.Facility?.name || a.facility_id || 'Unknown';
                        return (
                          <option key={a.id} value={a.id}>
                            {a.name} ({facility})
                          </option>
                        );
                      })}
                    </select>
                    {formErrors.activityId && <p className="text-red-500 text-xs mt-1">{formErrors.activityId}</p>}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date *</label>
                  <input type="date" value={form.date || ''} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className={`w-full px-3 py-2.5 border rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none ${formErrors.date ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`} />
                  {formErrors.date && <p className="text-red-500 text-xs mt-1">{formErrors.date}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Start Time *</label>
                    <input type="time" value={form.startTime || ''} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                      className={`w-full px-3 py-2.5 border rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none ${formErrors.startTime ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`} />
                    {formErrors.startTime && <p className="text-red-500 text-xs mt-1">{formErrors.startTime}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">End Time *</label>
                    <input type="time" value={form.endTime || ''} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                      className={`w-full px-3 py-2.5 border rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none ${formErrors.endTime ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`} />
                    {formErrors.endTime && <p className="text-red-500 text-xs mt-1">{formErrors.endTime}</p>}
                  </div>
                </div>

                {form.startTime && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-xs text-blue-700 dark:text-blue-300">
                    <span className="font-medium">Swahili: </span>
                    {convertTo12Hour(form.startTime)}
                    {form.endTime && <span> — {convertTo12Hour(form.endTime)}</span>}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Available Seats *</label>
                    <input type="number" value={form.availableSeats || ''} onChange={e => setForm(f => ({ ...f, availableSeats: Number(e.target.value) }))}
                      min="1"
                      className={`w-full px-3 py-2.5 border rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none ${formErrors.availableSeats ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`} />
                    {formErrors.availableSeats && <p className="text-red-500 text-xs mt-1">{formErrors.availableSeats}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
                    <select value={form.status || 'active'} onChange={e => setForm(f => ({ ...f, status: e.target.value as Timetable['status'] }))}
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="active">Active</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="full">Full</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors">
                    Cancel
                  </button>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave}
                    className={`flex-1 px-4 py-2.5 text-white rounded-xl text-sm font-medium transition-colors shadow-md ${modalType === 'transport' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'}`}>
                    {editTarget ? 'Save Changes' : 'Create Schedule'}
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
                  <h3 className="font-bold text-gray-900 dark:text-white">Delete Schedule</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">This cannot be undone</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                Delete the schedule for <strong>"{getTimetableLabel(deleteTarget)}"</strong> on <strong>{deleteTarget.date}</strong> at <strong>{deleteTarget.startTime}</strong>?
                Existing bookings may be affected.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors">
                  Cancel
                </button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm font-medium transition-colors shadow-md">
                  Delete Schedule
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
