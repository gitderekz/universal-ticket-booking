import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { useSystemLogs } from '../../../contexts/SystemLogsContext';
import { useAuth } from '../../../contexts/AuthContext';
import { apiClient } from '../../../services/apiClient';
import {
  Ticket, Calendar, Search, TrendingUp, Users, DollarSign,
  CheckCircle, Bus, Film, XCircle, Clock, ChevronDown, ChevronUp,
  Eye, Ban, RefreshCw
} from 'lucide-react';

type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'holding' | 'expired';

interface BookingRecord {
  id: string;
  customerName: string;
  customerPhone: string;
  type: 'Transport' | 'Facility';
  route: string;
  date: string;
  time: string;
  seats: number;
  amount: number;
  status: BookingStatus;
  paymentStatus: 'paid' | 'pending' | 'failed';
}

const statusConfig: Record<BookingStatus, { label: string; bg: string; dot: string }> = {
  confirmed: { label: 'Confirmed', bg: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300', dot: 'bg-green-500' },
  pending: { label: 'Pending', bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', dot: 'bg-amber-500' },
  cancelled: { label: 'Cancelled', bg: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', dot: 'bg-red-500' },
  completed: { label: 'Completed', bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', dot: 'bg-blue-500' },
  holding: { label: 'Holding', bg: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300', dot: 'bg-gray-500' },
  expired: { label: 'Expired', bg: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', dot: 'bg-red-500' },
};

const getStatusConfig = (status: string) => {
  const normalized = status?.toString().trim().toLowerCase();
  return statusConfig[normalized as BookingStatus] || {
    label: normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : 'Unknown',
    bg: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    dot: 'bg-gray-500',
  };
};

const paymentConfig: Record<string, string> = {
  paid: 'text-green-600 dark:text-green-400',
  pending: 'text-amber-600 dark:text-amber-400',
  failed: 'text-red-600 dark:text-red-400',
};

export const BookingsOverview: React.FC = () => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const { addLog } = useSystemLogs();
  const { user } = useAuth();

  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const isCustomer = user?.role === 'customer';

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const response = await apiClient.get('/bookings');
        const transformedBookings = (response.data.bookings || response.data || []).map((b: any) => {
          const rawStatus = String(b.status || 'pending').trim().toLowerCase();
          const normalizedStatus = ['confirmed', 'pending', 'cancelled', 'completed', 'holding', 'expired'].includes(rawStatus)
            ? rawStatus
            : 'pending';
          const rawPaymentStatus = String(b.payment_status || b.paymentStatus || 'pending').trim().toLowerCase();
          const normalizedPaymentStatus = ['paid', 'pending', 'failed'].includes(rawPaymentStatus)
            ? rawPaymentStatus
            : 'pending';

          return {
            id: b.id || b.booking_number || 'UNKNOWN',
            customerName: b.customer_name || b.customerName || 'Unknown',
            customerPhone: b.customer_phone || b.customerPhone || '',
            type: b.type === 'transport' ? 'Transport' : 'Facility' as 'Transport' | 'Facility',
            route: b.route || b.title || '',
            date: b.date || new Date().toISOString().split('T')[0],
            time: b.time || '00:00',
            seats: b.seats || 0,
            amount: b.amount || b.total_price || 0,
            status: normalizedStatus as BookingRecord['status'],
            paymentStatus: normalizedPaymentStatus as 'paid' | 'pending' | 'failed',
          };
        });
        setBookings(transformedBookings);
      } catch (error) {
        console.error('Error loading bookings:', error);
        setBookings([]);
      }
    };
    loadBookings();
  }, []);

  const handleStatusChange = async (id: string, newStatus: BookingRecord['status']) => {
    if (isCustomer) return;
    try {
      const response = await apiClient.patch(`/bookings/${id}/status`, { status: newStatus });
      const updatedBooking = response.data.booking;
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: updatedBooking.status } : b));
      const booking = bookings.find(b => b.id === id);
      addLog({ userId: user?.id || '', userName: user?.fullName || '', action: `Updated booking ${id} status to ${newStatus}`, module: 'Bookings', status: 'success', details: booking?.route });
    } catch (error) {
      console.error('Error updating booking status:', error);
      addLog({ userId: user?.id || '', userName: user?.fullName || '', action: `Failed to update booking ${id}`, module: 'Bookings', status: 'failed', details: error instanceof Error ? error.message : String(error) });
    }
  };

  const filtered = bookings
    .filter(b => {
      const matchSearch = b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.customerPhone.includes(searchTerm);
      const matchStatus = filterStatus === 'all' || b.status === filterStatus;
      const matchType = filterType === 'all' || b.type.toLowerCase() === filterType;
      return matchSearch && matchStatus && matchType;
    })
    .sort((a, b) => sortDir === 'desc' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));

  const totalRevenue = bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.amount, 0);
  const stats = [
    { icon: <Ticket className="w-6 h-6" />, label: 'Total Bookings', value: String(bookings.length), grad: 'from-blue-500 to-cyan-600', trend: `+${bookings.filter(b => b.status === 'confirmed').length} confirmed` },
    { icon: <Users className="w-6 h-6" />, label: 'Total Passengers', value: String(bookings.reduce((s, b) => s + b.seats, 0)), grad: 'from-green-500 to-emerald-600', trend: `${bookings.reduce((s, b) => s + b.seats, 0)} seats` },
    { icon: <DollarSign className="w-6 h-6" />, label: 'Total Revenue', value: formatPrice(totalRevenue), grad: 'from-purple-500 to-pink-600', trend: `${bookings.filter(b => b.paymentStatus === 'paid').length} paid` },
    { icon: <CheckCircle className="w-6 h-6" />, label: 'Confirmation Rate', value: `${Math.round(bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length / bookings.length * 100)}%`, grad: 'from-orange-500 to-amber-600', trend: 'of all bookings' },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('nav.bookings')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor and manage all bookings in real-time</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(0,0,0,0.15)' }}
            className={`bg-gradient-to-br ${stat.grad} rounded-xl p-5 text-white shadow-md`}>
            <div className="flex items-start justify-between mb-3">
              <div className="bg-white/20 p-2 rounded-lg">{stat.icon}</div>
              <TrendingUp className="w-4 h-4 opacity-70" />
            </div>
            <p className="text-white/70 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold mt-0.5 mb-1">{stat.value}</p>
            <p className="text-white/60 text-xs">{stat.trend}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search by ID, customer, phone, or route..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <button onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <RefreshCw className="w-4 h-4" /> Sort: {sortDir === 'desc' ? 'Newest' : 'Oldest'}
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'confirmed', 'pending', 'cancelled', 'completed'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filterStatus === s ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
              {s === 'all' ? 'All Status' : s}
            </button>
          ))}
          <div className="ml-2 flex gap-2">
            {['all', 'transport', 'facility'].map(t => (
              <button key={t} onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filterType === t ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                {t === 'all' ? 'All Types' : t === 'transport' ? <span className="flex items-center gap-1"><Bus className="w-3 h-3" /> Transport</span> : <span className="flex items-center gap-1"><Film className="w-3 h-3" /> Facility</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Booking ID</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Route / Event</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Seats</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              <AnimatePresence initial={false}>
                {filtered.map((booking, i) => {
                  const sc = getStatusConfig(booking.status);
                  const isExpanded = expandedId === booking.id;
                  return (
                    <React.Fragment key={booking.id}>
                      <motion.tr
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: i * 0.03 }}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors cursor-pointer ${isExpanded ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                        onClick={() => setExpandedId(isExpanded ? null : booking.id)}>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">{booking.id}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{booking.customerName}</p>
                          <p className="text-xs text-gray-400">{booking.customerPhone}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full w-fit ${booking.type === 'Transport' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'}`}>
                            {booking.type === 'Transport' ? <Bus className="w-3 h-3" /> : <Film className="w-3 h-3" />}
                            {booking.type}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 max-w-[200px]">
                          <p className="text-sm text-gray-800 dark:text-gray-200 truncate">{booking.route}</p>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <p className="text-sm text-gray-800 dark:text-gray-200">{booking.date}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{booking.time}</p>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 text-center">
                          {booking.seats}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">{formatPrice(booking.amount)}</p>
                          <p className={`text-xs font-medium capitalize ${paymentConfig[booking.paymentStatus]}`}>{booking.paymentStatus}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full w-fit ${sc.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            {sc.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <button onClick={e => { e.stopPropagation(); setExpandedId(isExpanded ? null : booking.id); }}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                      </motion.tr>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.tr key={`${booking.id}-expanded`}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <td colSpan={9} className="px-5 pb-4 pt-0 bg-blue-50/30 dark:bg-blue-900/5">
                              <div className="flex flex-wrap gap-3 pt-3 border-t border-blue-100 dark:border-blue-900/30">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                  <Eye className="w-4 h-4" /> Quick Actions:
                                </span>
                                {!isCustomer && (
                                  <>
                                    {booking.status !== 'confirmed' && (
                                      <button onClick={() => handleStatusChange(booking.id, 'confirmed')}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors">
                                        <CheckCircle className="w-3.5 h-3.5" /> Confirm
                                      </button>
                                    )}
                                    {booking.status !== 'pending' && booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                      <button onClick={() => handleStatusChange(booking.id, 'pending')}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 rounded-lg text-xs font-medium hover:bg-amber-200 transition-colors">
                                        <Clock className="w-3.5 h-3.5" /> Mark Pending
                                      </button>
                                    )}
                                    {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                                      <button onClick={() => handleStatusChange(booking.id, 'completed')}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors">
                                        <CheckCircle className="w-3.5 h-3.5" /> Complete
                                      </button>
                                    )}
                                    {booking.status !== 'cancelled' && (
                                      <button onClick={() => handleStatusChange(booking.id, 'cancelled')}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors">
                                        <Ban className="w-3.5 h-3.5" /> Cancel
                                      </button>
                                    )}
                                  </>
                                )}
                                {isCustomer && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400">You can view your bookings here. Status actions are reserved for staff/admin.</p>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-12 text-gray-400 dark:text-gray-500">
            <Ticket className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="font-medium">No bookings match your filters</p>
          </motion.div>
        )}

        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing <strong className="text-gray-700 dark:text-gray-300">{filtered.length}</strong> of <strong className="text-gray-700 dark:text-gray-300">{bookings.length}</strong> bookings
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Click a row to manage status
          </p>
        </div>
      </div>
    </div>
  );
};
