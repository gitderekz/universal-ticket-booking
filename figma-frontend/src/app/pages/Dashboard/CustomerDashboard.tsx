import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useAuth } from '../../../contexts/AuthContext';
import { useCurrency } from '../../../contexts/CurrencyContext';
import {
  Bus,
  Film,
  Calendar,
  TreePine,
  Home,
  Trophy,
  Ticket,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { apiClient } from '../../../services/apiClient';
import { useEffect, useState } from 'react';

export const CustomerDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const categories = [
    {
      id: 'transport',
      icon: <Bus className="w-8 h-8" />,
      title: t('categories.transport'),
      description: 'Buses, Trains, Ferries & More',
      color: 'from-blue-500 to-blue-600',
      route: '/bookings/transport',
    },
    {
      id: 'entertainment',
      icon: <Film className="w-8 h-8" />,
      title: t('categories.entertainment'),
      description: 'Movies, Shows, Comedy & Events',
      color: 'from-purple-500 to-purple-600',
      route: '/bookings/entertainment',
    },
    {
      id: 'events',
      icon: <Calendar className="w-8 h-8" />,
      title: t('categories.events'),
      description: 'Conferences, Seminars & Meetings',
      color: 'from-pink-500 to-pink-600',
      route: '/bookings/events',
    },
    {
      id: 'outdoor',
      icon: <TreePine className="w-8 h-8" />,
      title: t('categories.outdoor'),
      description: 'Parks, Picnic Areas & Nature',
      color: 'from-green-500 to-green-600',
      route: '/bookings/outdoor',
    },
    {
      id: 'housing',
      icon: <Home className="w-8 h-8" />,
      title: t('categories.housing'),
      description: 'Hotels, Apartments & Rentals',
      color: 'from-orange-500 to-orange-600',
      route: '/bookings/housing',
    },
    {
      id: 'sports',
      icon: <Trophy className="w-8 h-8" />,
      title: t('categories.sports'),
      description: 'Stadiums, Arenas & Sports Events',
      color: 'from-red-500 to-red-600',
      route: '/bookings/sports',
    },
  ];

  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get('/bookings', { params: { user_id: user?.id } });
        const data = res.data?.bookings || res.data || [];
        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load bookings for dashboard:', err);
        setBookings([]);
      }
    };
    load();
  }, [user?.id]);

  const totalBookings = bookings.length;
  const activeBookings = bookings.filter(b => ['pending', 'holding', 'confirmed'].includes(String(b.status || '').toLowerCase())).length;
  const completedBookings = bookings.filter(b => ['confirmed', 'completed'].includes(String(b.status || '').toLowerCase())).length;
  const totalSpent = bookings.filter(b => String(b.payment_status || b.paymentStatus || '').toLowerCase() === 'paid')
    .reduce((s, b) => s + Number(b.total_price || b.amount || b.price || 0), 0);

  const stats = [
    { icon: <Ticket className="w-6 h-6" />, label: t('dashboard.totalBookings'), value: String(totalBookings), color: 'bg-blue-500' },
    { icon: <Clock className="w-6 h-6" />, label: t('dashboard.activeBookings'), value: String(activeBookings), color: 'bg-orange-500' },
    { icon: <CheckCircle className="w-6 h-6" />, label: t('dashboard.completedBookings'), value: String(completedBookings), color: 'bg-green-500' },
    { icon: <TrendingUp className="w-6 h-6" />, label: 'Total Spent', value: formatPrice(totalSpent), color: 'bg-purple-500' },
  ];

  const recentBookings = bookings.slice(0, 6).map((b: any) => {
    let title = '';
    let date = '';
    let time = '';
    let seatsCount = 0;

    if (b.Journey) {
      // Transport booking
      const route = b.Journey.Route;
      const startStation = route?.originStation?.name || route?.startLocation || 'Unknown';
      const endStation = route?.destinationStation?.name || route?.endLocation || 'Unknown';
      title = `${startStation} → ${endStation}`;
      date = b.Journey.journey_date ? new Date(b.Journey.journey_date).toLocaleDateString() : '';
      if (b.Journey.departure_at) {
        const depTime = new Date(b.Journey.departure_at);
        time = depTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      }
    } else if (b.ActivityInstance) {
      // Facility booking
      const activity = b.ActivityInstance.Activity;
      const facility = b.ActivityInstance.Facility;
      title = activity?.name || facility?.name || 'Unknown Event';
      date = b.ActivityInstance.start_at ? new Date(b.ActivityInstance.start_at).toLocaleDateString() : '';
      if (b.ActivityInstance.start_at) {
        const startTime = new Date(b.ActivityInstance.start_at);
        time = startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      }
    }

    if (Array.isArray(b.SeatHolds)) {
      seatsCount = b.SeatHolds.length;
    } else if (b.passenger_count) {
      seatsCount = b.passenger_count;
    } else if (Array.isArray(b.BookingItems)) {
      seatsCount = b.BookingItems.length;
    }

    return {
      id: b.id || b.booking_code || 'unknown',
      type: b.booking_type === 'transport' ? 'transport' : 'facility',
      title: title,
      company: b.contact_name || b.customer_name || '',
      date: date,
      time: time,
      seats: seatsCount,
      status: b.status || 'pending',
      price: Number(b.total_amount || b.amount || 0),
    };
  });

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('dashboard.welcome')}, {user?.fullName}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          What would you like to book today?
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -4 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className={`${stat.color} p-3 rounded-lg text-white`}
              >
                {stat.icon}
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Browse by Category */}
      <div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-bold text-gray-900 dark:text-white mb-4"
        >
          Browse by Category
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(category.route)}
              className="group bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all text-left"
            >
              <motion.div
                whileHover={{ scale: 1.15, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={`bg-gradient-to-r ${category.color} w-16 h-16 rounded-lg flex items-center justify-center text-white mb-4 shadow-lg`}
              >
                {category.icon}
              </motion.div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {category.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {category.description}
              </p>
              <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium">
                {t('booking.bookNow')}
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <ArrowRight className="w-4 h-4 ml-2" />
                </motion.div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Recent Bookings */}
      <div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="flex items-center justify-between mb-4"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('dashboard.recentBookings')}
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/tickets')}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            View all
          </motion.button>
        </motion.div>
        <div className="space-y-4">
          {recentBookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 + index * 0.1 }}
              whileHover={{ scale: 1.01, x: 4 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => navigate('/tickets')}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {booking.title}
                    </h3>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.3 + index * 0.1 }}
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                      }`}
                    >
                      {booking.status}
                    </motion.span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {booking.company}
                  </p>
                  <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {booking.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {booking.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4" />
                      {booking.seats} seats
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(booking.price)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
