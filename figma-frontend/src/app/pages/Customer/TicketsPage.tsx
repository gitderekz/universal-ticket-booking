import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Ticket, Calendar, MapPin, Clock, Download, Eye, Filter, Search } from 'lucide-react';
import { ReceiptModal } from '../../components/booking/ReceiptModal';
import { apiClient } from '../../../services/apiClient';

interface BookingData {
  id: string;
  type: 'transport' | 'facility';
  category: string;
  title: string;
  company: string;
  date: string;
  time: string;
  seats: string[];
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  bookingNumber: string;
  passengerName: string;
  passengerPhone: string;
  passengerEmail: string;
  from?: string;
  to?: string;
  facility?: string;
  activity?: string;
  transportRegistration?: string;
  paymentMethod?: string;
}

export const TicketsPage: React.FC = () => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [bookings, setBookings] = useState<BookingData[]>([]);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const response = await apiClient.get('/bookings', {
          params: { userId: user?.id }
        });
        const bookingsData = response.data?.bookings || response.data || [];
        // Transform backend bookings to BookingData format
        const transformedBookings = (Array.isArray(bookingsData) ? bookingsData : []).map((b: any) => {
          const journey = b.Journey;
          const route = journey?.Route;
          const transport = journey?.Transport;
          const activityInstance = b.ActivityInstance;
          const activity = activityInstance?.Activity;
          const facility = activityInstance?.Facility;
          const company = facility?.Company || transport?.Company;
          const originStation = route?.originStation;
          const destinationStation = route?.destinationStation;
          const seatHolds = b.SeatHolds || [];
          const seatItems = b.BookingItems || [];
          const payment = b.Payments?.[0]; // Get first payment if exists

          const isFacilityBooking = b.booking_type === 'facility' || Boolean(activityInstance);
          const bookingTitle = isFacilityBooking
            ? activity?.name || facility?.name || `Booking ${b.id}`
            : route?.name || `Journey ${b.id}`;
          const bookingCompany = isFacilityBooking
            ? company?.name || facility?.name || 'Unknown Facility'
            : transport?.Company?.name || 'Unknown Company';
          const bookingDate = isFacilityBooking
            ? activityInstance ? new Date(activityInstance.start_at).toLocaleDateString('en-US') : new Date().toISOString().split('T')[0]
            : journey?.journey_date || new Date().toISOString().split('T')[0];
          const bookingTime = isFacilityBooking
            ? activityInstance ? new Date(activityInstance.start_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '00:00'
            : journey?.departure_at ? new Date(journey.departure_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '00:00';
          const seats = seatItems.length > 0 ? seatItems.map((item: any) => item.item_code || '') : seatHolds.map((sh: any) => sh.seat_code);

          return {
            id: b.id,
            type: b.booking_type || 'transport',
            category: b.booking_type || 'transport',
            title: bookingTitle,
            company: bookingCompany,
            date: bookingDate,
            time: bookingTime,
            seats,
            totalPrice: parseFloat(b.total_amount) || 0,
            status: b.status || 'pending',
            paymentStatus: payment?.status === 'completed' ? 'paid' : 'pending',
            bookingNumber: b.booking_code || `BK-${b.id}`,
            passengerName: b.contact_name || user?.fullName || 'John Doe',
            passengerPhone: b.contact_phone || user?.phone || '',
            passengerEmail: b.contact_email || user?.email || '',
            from: isFacilityBooking ? facility?.name || '' : originStation?.name || '',
            to: isFacilityBooking ? activity?.name || '' : destinationStation?.name || '',
            transportRegistration: transport?.registration_number || '',
            paymentMethod: payment?.method || 'M-Pesa'
          };
        });
        setBookings(transformedBookings);
      } catch (error) {
        console.error('Error loading bookings:', error);
        // Fallback to empty array or default bookings
        setBookings([]);
      }
    };
    if (user?.id) {
      loadBookings();
    }
  }, [user?.id]);

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || booking.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'completed':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('nav.tickets')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View and manage all your bookings
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filterStatus === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('confirmed')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filterStatus === 'confirmed'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Confirmed
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filterStatus === 'pending'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Pending
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {booking.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    {booking.paymentStatus === 'paid' && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                        Paid
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {booking.company} • {booking.bookingNumber}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      {booking.date}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      {booking.time}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Ticket className="w-4 h-4" />
                      {booking.seats.join(', ')}
                    </div>
                  </div>
                  {booking.from && booking.to && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-2">
                      <MapPin className="w-4 h-4" />
                      Route: {booking.from} → {booking.to}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(booking.totalPrice)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {booking.seats.length} seat{booking.seats.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setSelectedBooking(booking)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Eye className="w-4 h-4" />
                View Receipt
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
          <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No tickets found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {selectedBooking && (
        <ReceiptModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
};
