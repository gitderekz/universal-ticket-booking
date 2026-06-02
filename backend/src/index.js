const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');
const { sequelize, testConnection } = require('./config/database');
const i18n = require('./config/i18n');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');
const models = require('./models');
const { seedDatabase } = require('./services/seedService');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const companyRoutes = require('./routes/company');
const transportRoutes = require('./routes/transport');
const routeRoutes = require('./routes/route');
const journeyRoutes = require('./routes/journey');
const bookingRoutes = require('./routes/booking');
const seatHoldRoutes = require('./routes/seat-hold');
const paymentRoutes = require('./routes/payment');
const facilityRoutes = require('./routes/facility');
const activityRoutes = require('./routes/activity');
const activityInstanceRoutes = require('./routes/activity-instance');
const adminRoutes = require('./routes/admin');
const reportRoutes = require('./routes/report');

const facilityTypeRoutes = require('./routes/facilityType');
const transportTypeRoutes = require('./routes/transportType');
const stationRoutes = require('./routes/station');
const seatLayoutRoutes = require('./routes/seatLayout');
const roleRoutes = require('./routes/role');
const currencyRoutes = require('./routes/currency');

// Import socket handlers
const socketHandlers = require('./sockets');

// Import cron jobs
const cronJobs = require('./jobs');

const app = express();
const server = http.createServer(app);

const allowedOrigins = Array.from(new Set([
  ...(process.env.SOCKET_CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175'
]));

// Socket.IO setup
const io = socketIo(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin || true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin || true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const systemLogMiddleware = require('./middleware/systemLogMiddleware');
app.use(systemLogMiddleware);

// Rate limiting
app.use(rateLimiter);

// i18n setup
app.use(i18n.init);

// Static files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin/companies', companyRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/transports', transportRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/journeys', journeyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/seat-holds', seatHoldRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/activity-instances', activityInstanceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/facility-types', facilityTypeRoutes);
app.use('/api/transport-types', transportTypeRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/seat-layouts', seatLayoutRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/currencies', currencyRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// Socket handlers
socketHandlers(io);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Sync database (in development only)
    if (process.env.NODE_ENV === 'development') {
      // Using force: true temporarily to rebuild tables with corrected schema
      const forceRebuild = process.env.FORCE_DB_REBUILD === 'true';
      await sequelize.sync({ force: forceRebuild, alter: !forceRebuild });
      console.log('Database synchronized successfully.');

      // Seed required data
      await seedDatabase();
    }


    // Start cron jobs
    cronJobs.start();

    // Start server
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();