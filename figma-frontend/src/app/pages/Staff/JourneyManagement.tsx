// figma-frontend/src/app/pages/Staff/JourneyManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { useSystemLogs } from '../../../contexts/SystemLogsContext';
import { useAuth } from '../../../contexts/AuthContext';
import { getTimetables, getRoutes, createJourney, updateJourney, deleteJourney } from '../../../services/managementService';
import { getJourneys } from '../../../services/adminService';
import { getTransports } from '../../../services/adminService';
import { formatDate, formatTime12Hour } from '../../../utils/dateFormatter';
import {
  Plus, Calendar, Clock, Edit, Trash2, Search, Bus, X,
  AlertTriangle, CheckCircle2, Users, MapPin, Timer, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface JourneyFormData {
  timetable_id: string;
  transport_id: string;
  route_id: string;
  journey_date: string;
  departure_at: string;
  arrival_at: string;
  available_seats: number;
  status: string;
  delay_minutes: number;
}

const emptyForm = (): JourneyFormData => ({
  timetable_id: '',
  transport_id: '',
  route_id: '',
  journey_date: new Date().toISOString().split('T')[0],
  departure_at: '08:00',
  arrival_at: '12:00',
  available_seats: 50,
  status: 'scheduled',
  delay_minutes: 0,
});

export const JourneyManagement: React.FC = () => {
  const { formatPrice } = useCurrency();
  const { addLog } = useSystemLogs();
  const { user } = useAuth();

  const [journeys, setJourneys] = useState<any[]>([]);
  const [timetables, setTimetables] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [transports, setTransports] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [form, setForm] = useState<JourneyFormData>(emptyForm());
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
      const [journeyData, timetableData, routeData, transportData] = await Promise.all([
        getJourneys(),
        getTimetables(),
        getRoutes(),
        getTransports(1, 100, ''),
      ]);
      setJourneys(journeyData.journeys || []);
      setTimetables(timetableData || []);
      setRoutes(routeData || []);
      setTransports(transportData.transports || []);
    } catch (error) {
      console.error('Failed to load journeys', error);
      toast.error('Unable to load journey data');
    }
  };

  const filteredJourneys = journeys.filter(journey => {
    const route = routes.find(r => r.id === journey.route_id);
    const routeName = route?.name || `${route?.originStation?.name} → ${route?.destinationStation?.name}` || '';
    const matchSearch = routeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || journey.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: journeys.length,
    scheduled: journeys.filter(j => j.status === 'scheduled').length,
    completed: journeys.filter(j => j.status === 'completed').length,
    cancelled: journeys.filter(j => j.status === 'cancelled').length,
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm());
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (journey: any) => {
    setEditTarget(journey);
    setForm({
      timetable_id: journey.timetable_id || '',
      transport_id: journey.transport_id || '',
      route_id: journey.route_id || '',
      journey_date: journey.journey_date?.split('T')[0] || new Date().toISOString().split('T')[0],
      departure_at: journey.departure_at?.split('T')[1]?.slice(0, 5) || '08:00',
      arrival_at: journey.arrival_at?.split('T')[1]?.slice(0, 5) || '12:00',
      available_seats: journey.available_seats || 0,
      status: journey.status || 'scheduled',
      delay_minutes: journey.delay_minutes || 0,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.timetable_id) errs.timetable_id = 'Select a timetable';
    if (!form.transport_id) errs.transport_id = 'Select a transport';
    if (!form.route_id) errs.route_id = 'Select a route';
    if (!form.journey_date) errs.journey_date = 'Date is required';
    if (!form.departure_at) errs.departure_at = 'Departure time required';
    if (!form.arrival_at) errs.arrival_at = 'Arrival time required';
    if (form.available_seats <= 0) errs.available_seats = 'Available seats must be greater than 0';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      const payload = {
        timetable_id: form.timetable_id,
        transport_id: form.transport_id,
        route_id: form.route_id,
        journey_date: form.journey_date,
        departure_at: form.departure_at,
        arrival_at: form.arrival_at,
        available_seats: form.available_seats,
        status: form.status,
        delay_minutes: form.delay_minutes,
      };

      if (editTarget) {
        const updated = await updateJourney(editTarget.id, payload);
        setJourneys(prev => prev.map(j => j.id === editTarget.id ? updated : j));
        addLog({
          userId: user?.id || '',
          userName: user?.fullName || '',
          action: `Updated journey for route: ${form.route_id}`,
          module: 'journeys',
          status: 'success',
        });
        showToast('Journey updated successfully');
      } else {
        const created = await createJourney(payload);
        setJourneys(prev => [created, ...prev]);
        addLog({
          userId: user?.id || '',
          userName: user?.fullName || '',
          action: `Created journey for route: ${form.route_id}`,
          module: 'journeys',
          status: 'success',
        });
        showToast('Journey created successfully');
      }

      setShowModal(false);
    } catch (error: any) {
      console.error('Error saving journey:', error);
      showToast(error.response?.data?.message || 'Unable to save journey', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteJourney(deleteTarget.id);
      setJourneys(prev => prev.filter(j => j.id !== deleteTarget.id));
      addLog({
        userId: user?.id || '',
        userName: user?.fullName || '',
        action: `Deleted journey: ${deleteTarget.id}`,
        module: 'journeys',
        status: 'warning',
      });
      showToast('Journey deleted');
      setDeleteTarget(null);
    } catch (error: any) {
      console.error('Error deleting journey:', error);
      showToast('Unable to delete journey', 'error');
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Journey Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Schedule and manage transport journeys</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md font-medium"
        >
          <Plus className="w-5 h-5" /> Schedule Journey
        </motion.button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-white/70 text-sm">Total Journeys</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-white/70 text-sm">Scheduled</p>
          <p className="text-3xl font-bold">{stats.scheduled}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-white/70 text-sm">Completed</p>
          <p className="text-3xl font-bold">{stats.completed}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-white/70 text-sm">Cancelled</p>
          <p className="text-3xl font-bold">{stats.cancelled}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search journeys by route..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-lg text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
        >
          <option value="all">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="delayed">Delayed</option>
        </select>
      </div>

      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {filteredJourneys.map(journey => {
            const route = routes.find(r => r.id === journey.route_id);
            const transport = transports.find(t => t.id === journey.transport_id);
            const routeName = route?.name || `${route?.originStation?.name} → ${route?.destinationStation?.name}` || 'Unknown Route';
            const statusColor = journey.status === 'scheduled' ? 'bg-green-100 text-green-700' :
                               journey.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                               journey.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                               journey.status === 'delayed' ? 'bg-orange-100 text-orange-700' :
                               'bg-gray-100 text-gray-700';

            return (
              <motion.div
                key={journey.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -2 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Bus className="w-5 h-5 text-blue-500" />
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">{routeName}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}`}>
                        {journey.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-400">Date</p>
                          <p className="font-medium">{formatDate(journey.journey_date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-400">Departure</p>
                          <p className="font-medium">{formatTime12Hour(journey.departure_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Timer className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-400">Arrival</p>
                          <p className="font-medium">{formatTime12Hour(journey.arrival_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-400">Available Seats</p>
                          <p className="font-bold text-green-600">{journey.available_seats}</p>
                        </div>
                      </div>
                    </div>

                    {journey.delay_minutes > 0 && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-orange-600 bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg">
                        <RefreshCw className="w-4 h-4" />
                        <span>Delayed by {journey.delay_minutes} minutes</span>
                      </div>
                    )}

                    <div className="mt-4 text-sm text-gray-500">
                      Transport: {transport?.name || 'Unknown'} • Registration: {transport?.registration_number || 'N/A'}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => openEdit(journey)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setDeleteTarget(journey)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

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
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editTarget ? 'Edit Journey' : 'Schedule New Journey'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Timetable *</label>
                  <select
                    value={form.timetable_id}
                    onChange={e => setForm(f => ({ ...f, timetable_id: e.target.value }))}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ${
                      formErrors.timetable_id ? 'border-red-400' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Timetable</option>
                    {timetables.filter(t => t.route_id).map(t => {
                      const route = routes.find(r => r.id === t.route_id);
                      return (
                        <option key={t.id} value={t.id}>
                          {route?.name || 'Unknown Route'} - {t.departure_time} ({t.date})
                        </option>
                      );
                    })}
                  </select>
                  {formErrors.timetable_id && <p className="text-red-500 text-xs mt-1">{formErrors.timetable_id}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Transport *</label>
                  <select
                    value={form.transport_id}
                    onChange={e => setForm(f => ({ ...f, transport_id: e.target.value }))}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ${
                      formErrors.transport_id ? 'border-red-400' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Transport</option>
                    {transports.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.registration_number})</option>
                    ))}
                  </select>
                  {formErrors.transport_id && <p className="text-red-500 text-xs mt-1">{formErrors.transport_id}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Route *</label>
                  <select
                    value={form.route_id}
                    onChange={e => setForm(f => ({ ...f, route_id: e.target.value }))}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ${
                      formErrors.route_id ? 'border-red-400' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Route</option>
                    {routes.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name || `${r.originStation?.name} → ${r.destinationStation?.name}`}
                      </option>
                    ))}
                  </select>
                  {formErrors.route_id && <p className="text-red-500 text-xs mt-1">{formErrors.route_id}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Journey Date *</label>
                  <input
                    type="date"
                    value={form.journey_date}
                    onChange={e => setForm(f => ({ ...f, journey_date: e.target.value }))}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ${
                      formErrors.journey_date ? 'border-red-400' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.journey_date && <p className="text-red-500 text-xs mt-1">{formErrors.journey_date}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Departure Time *</label>
                    <input
                      type="time"
                      value={form.departure_at}
                      onChange={e => setForm(f => ({ ...f, departure_at: e.target.value }))}
                      className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ${
                        formErrors.departure_at ? 'border-red-400' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.departure_at && <p className="text-red-500 text-xs mt-1">{formErrors.departure_at}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Arrival Time *</label>
                    <input
                      type="time"
                      value={form.arrival_at}
                      onChange={e => setForm(f => ({ ...f, arrival_at: e.target.value }))}
                      className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ${
                        formErrors.arrival_at ? 'border-red-400' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.arrival_at && <p className="text-red-500 text-xs mt-1">{formErrors.arrival_at}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Available Seats *</label>
                    <input
                      type="number"
                      value={form.available_seats}
                      onChange={e => setForm(f => ({ ...f, available_seats: Number(e.target.value) }))}
                      min="0"
                      className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ${
                        formErrors.available_seats ? 'border-red-400' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.available_seats && <p className="text-red-500 text-xs mt-1">{formErrors.available_seats}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Delay (minutes)</label>
                    <input
                      type="number"
                      value={form.delay_minutes}
                      onChange={e => setForm(f => ({ ...f, delay_minutes: Number(e.target.value) }))}
                      min="0"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="delayed">Delayed</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border rounded-xl hover:bg-gray-50 text-sm font-medium">
                    Cancel
                  </button>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium shadow-md"
                  >
                    {editTarget ? 'Save Changes' : 'Schedule Journey'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
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
                  <h3 className="font-bold text-gray-900">Delete Journey</h3>
                  <p className="text-sm text-gray-500">This cannot be undone</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-6 bg-gray-50 p-3 rounded-lg">
                Delete this journey? All associated bookings will be affected.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2.5 border rounded-xl">Cancel</button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl shadow-md">Delete Journey</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};