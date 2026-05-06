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

  const stats = [
    {
      icon: <Ticket className="w-6 h-6" />,
      label: t('dashboard.totalBookings'),
      value: '12',
      color: 'bg-blue-500',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      label: t('dashboard.activeBookings'),
      value: '3',
      color: 'bg-orange-500',
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      label: t('dashboard.completedBookings'),
      value: '9',
      color: 'bg-green-500',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: 'Total Spent',
      value: formatPrice(485000),
      color: 'bg-purple-500',
    },
  ];

  const recentBookings = [
    {
      id: '1',
      type: 'transport',
      title: 'Dar es Salaam → Mwanza',
      company: 'Kilimanjaro Express',
      date: '2026-05-10',
      time: '10:00',
      seats: 2,
      status: 'confirmed',
      price: 120000,
    },
    {
      id: '2',
      type: 'entertainment',
      title: 'Avengers: Endgame',
      company: 'Dar Es Salaam Cinemas',
      date: '2026-05-08',
      time: '18:00',
      seats: 3,
      status: 'confirmed',
      price: 36000,
    },
    {
      id: '3',
      type: 'sports',
      title: 'Simba vs Yanga',
      company: 'National Stadium',
      date: '2026-05-12',
      time: '16:00',
      seats: 4,
      status: 'pending',
      price: 60000,
    },
  ];

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
