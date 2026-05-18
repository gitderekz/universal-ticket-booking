const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');
const {
  User,
  Role,
  UserRole,
  Company,
  Transport,
  TransportType,
  Facility,
  FacilityType,
  Activity,
  ActivityInstance,
  Route,
  Station,
  Journey,
  Booking,
  BookingItem,
  Payment,
  Currency,
  SystemLog
} = require('../models');

// Apply admin authentication to all routes
router.use(adminAuthMiddleware);

// User Management
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { email: { [Op.like]: `%${search}%` } },
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }

    const users = await User.findAndCountAll({
      where,
      include: [{
        model: Role,
        as: 'roles',
        through: { attributes: ['company_id'] },
        attributes: ['id', 'name', 'slug']
      }, {
        model: Company,
        as: 'ownedCompanies',
        attributes: ['id', 'name']
      }, {
        model: UserRole,
        attributes: ['company_id', 'role_id'],
        include: [{ model: Company, as: 'company', attributes: ['id', 'name'] }]
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    const usersWithCompany = users.rows.map(user => {
      const plain = user.toJSON();
      if ((!plain.Company || !plain.Company.name) && plain.UserRoles?.length) {
        const userCompany = plain.UserRoles.find(ur => ur.company?.name)?.company;
        if (userCompany) {
          plain.Company = userCompany;
        }
      }
      return plain;
    });

    res.json({
      users: usersWithCompany,
      pagination: {
        total: users.count,
        page: parseInt(page),
        pages: Math.ceil(users.count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{
        model: Role,
        through: { attributes: ['company_id'] },
        attributes: ['id', 'name', 'slug']
      }, {
        model: Company,
        as: 'ownedCompanies',
        attributes: ['id', 'name']
      }, {
        model: UserRole,
        attributes: ['company_id', 'role_id'],
        include: [{ model: Company, as: 'company', attributes: ['id', 'name'] }]
      }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userPlain = user.toJSON();
    if ((!userPlain.Company || !userPlain.Company.name) && userPlain.UserRoles?.length) {
      const userCompany = userPlain.UserRoles.find(ur => ur.company?.name)?.company;
      if (userCompany) {
        userPlain.Company = userCompany;
      }
    }

    res.json(userPlain);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, status, role_slug } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({
      first_name,
      last_name,
      email,
      phone,
      status
    });

    // Update role if provided
    if (role_slug) {
      const role = await Role.findOne({ where: { slug: role_slug } });
      if (role) {
        await UserRole.destroy({ where: { user_id: user.id } });
        await UserRole.create({ user_id: user.id, role_id: role.id });
      }
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password, role_slug = 'customer', status = 'active' } = req.body;
    const user = await User.create({
      first_name,
      last_name,
      email,
      phone,
      password_hash: password,
      status
    });

    const role = await Role.findOne({ where: { slug: role_slug } });
    if (role) {
      await UserRole.create({ user_id: user.id, role_id: role.id });
    }

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

// System Logs
router.get('/system-logs', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, module } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { action: { [Op.like]: `%${search}%` } },
        { module: { [Op.like]: `%${search}%` } },
        { user_name: { [Op.like]: `%${search}%` } },
        { details: { [Op.like]: `%${search}%` } }
      ];
    }
    if (status && status !== 'all') {
      where.status = status;
    }
    if (module && module !== 'all') {
      where.module = module;
    }

    const logs = await SystemLog.findAndCountAll({
      where,
      include: [{
        model: User,
        attributes: ['id', 'first_name', 'last_name', 'email']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['timestamp', 'DESC']]
    });

    res.json({
      logs: logs.rows,
      pagination: {
        total: logs.count,
        page: parseInt(page),
        pages: Math.ceil(logs.count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching system logs', error: error.message });
  }
});

router.delete('/system-logs', async (req, res) => {
  try {
    await SystemLog.destroy({ where: {} });
    res.json({ message: 'System logs cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing system logs', error: error.message });
  }
});

// Company Management
router.get('/companies', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const companies = await Company.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'first_name', 'last_name', 'email']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      companies: companies.rows,
      pagination: {
        total: companies.count,
        page: parseInt(page),
        pages: Math.ceil(companies.count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching companies', error: error.message });
  }
});

router.get('/companies/:id', async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'first_name', 'last_name', 'email']
      }, {
        model: Transport,
        include: [TransportType]
      }, {
        model: Facility,
        include: [FacilityType]
      }]
    });

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json(company);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching company', error: error.message });
  }
});

router.post('/companies', async (req, res) => {
  try {
    const { owner_id, name, email, phone, address, status = 'pending' } = req.body;
    const company = await Company.create({
      owner_id,
      name,
      email,
      phone,
      address,
      status
    });
    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ message: 'Error creating company', error: error.message });
  }
});

router.put('/companies/:id', async (req, res) => {
  try {
    const { name, email, phone, address, status } = req.body;
    const company = await Company.findByPk(req.params.id);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    await company.update({
      name,
      email,
      phone,
      address,
      status
    });

    res.json(company);
  } catch (error) {
    res.status(500).json({ message: 'Error updating company', error: error.message });
  }
});

router.delete('/companies/:id', async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    await company.destroy();
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting company', error: error.message });
  }
});

// Transport Management
router.post('/transports', async (req, res) => {
  try {
    const { company_id, transport_type_id, transport_type_slug, name, registration_number, capacity, description, sittingPlan, sittingLength, status = 'active' } = req.body;
    let transportTypeId = transport_type_id;

    if (!transportTypeId && transport_type_slug) {
      const transportType = await TransportType.findOne({ where: { slug: transport_type_slug } });
      if (!transportType) {
        return res.status(400).json({ message: 'Invalid transport type' });
      }
      transportTypeId = transportType.id;
    }

    if (!transportTypeId) {
      return res.status(400).json({ message: 'Transport type is required' });
    }

    const transport = await Transport.create({
      company_id,
      transport_type_id: transportTypeId,
      name,
      registration_number,
      capacity,
      description,
      sittingPlan: sittingPlan || null,
      sittingLength: sittingLength || 0,
      status
    });
    res.status(201).json(transport);
  } catch (error) {
    res.status(500).json({ message: 'Error creating transport', error: error.message });
  }
});

router.put('/transports/:id', async (req, res) => {
  try {
    const { company_id, transport_type_id, transport_type_slug, name, registration_number, capacity, description, sittingPlan, sittingLength, status } = req.body;
    const transport = await Transport.findByPk(req.params.id);

    if (!transport) {
      return res.status(404).json({ message: 'Transport not found' });
    }

    let transportTypeId = transport_type_id;
    if (!transportTypeId && transport_type_slug) {
      const transportType = await TransportType.findOne({ where: { slug: transport_type_slug } });
      if (!transportType) {
        return res.status(400).json({ message: 'Invalid transport type' });
      }
      transportTypeId = transportType.id;
    }

    await transport.update({
      company_id: company_id || transport.company_id,
      transport_type_id: transportTypeId || transport.transport_type_id,
      name: name || transport.name,
      registration_number: registration_number || transport.registration_number,
      capacity: capacity !== undefined ? capacity : transport.capacity,
      description: description !== undefined ? description : transport.description,
      sittingPlan: sittingPlan !== undefined ? sittingPlan : transport.sittingPlan,
      sittingLength: sittingLength !== undefined ? sittingLength : transport.sittingLength,
      status: status || transport.status
    });

    res.json(transport);
  } catch (error) {
    res.status(500).json({ message: 'Error updating transport', error: error.message });
  }
});

router.get('/transports', async (req, res) => {
  try {
    const { page = 1, limit = 20, company_id } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (company_id) {
      where.company_id = company_id;
    }

    const transports = await Transport.findAndCountAll({
      where,
      include: [{
        model: Company,
        attributes: ['id', 'name']
      }, {
        model: TransportType,
        attributes: ['id', 'name', 'category', 'slug']
      }, {
        model: require('../models').SeatLayout,
        as: 'seatLayout',
        attributes: ['pattern', 'rows', 'total_units', 'config']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      transports: transports.rows,
      pagination: {
        total: transports.count,
        page: parseInt(page),
        pages: Math.ceil(transports.count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transports', error: error.message });
  }
});

router.delete('/transports/:id', async (req, res) => {
  try {
    const transport = await Transport.findByPk(req.params.id);
    if (!transport) {
      return res.status(404).json({ message: 'Transport not found' });
    }
    await transport.destroy();
    res.json({ message: 'Transport deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting transport', error: error.message });
  }
});

router.get('/transports/:id', async (req, res) => {
  try {
    const transport = await Transport.findByPk(req.params.id, {
      include: [{
        model: Company,
        attributes: ['id', 'name']
      }, {
        model: TransportType,
        attributes: ['id', 'name', 'category', 'slug']
      }, {
        model: Route,
        include: [{
          model: Station,
          as: 'originStation',
          attributes: ['id', 'name']
        }, {
          model: Station,
          as: 'destinationStation',
          attributes: ['id', 'name']
        }]
      }]
    });

    if (!transport) {
      return res.status(404).json({ message: 'Transport not found' });
    }

    res.json(transport);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transport', error: error.message });
  }
});

// Facility Management
router.post('/facilities', async (req, res) => {
  try {
    const { company_id, facility_type_id, facility_type_slug, name, description, location, capacity, base_price, sittingPlan, sittingLength, features, images, status = 'pending' } = req.body;
    let facilityTypeId = facility_type_id;

    if (!facilityTypeId && facility_type_slug) {
      const facilityType = await FacilityType.findOne({ where: { slug: facility_type_slug } });
      if (!facilityType) {
        return res.status(400).json({ message: 'Invalid facility type' });
      }
      facilityTypeId = facilityType.id;
    }

    if (!facilityTypeId) {
      return res.status(400).json({ message: 'Facility type is required' });
    }

    const facility = await Facility.create({
      company_id,
      facility_type_id: facilityTypeId,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description,
      location: location || {},
      capacity,
      base_price: base_price || 0,
      sittingPlan: sittingPlan || null,
      sittingLength: sittingLength || 0,
      features: features || {},
      images: images || [],
      status
    });
    res.status(201).json(facility);
  } catch (error) {
    res.status(500).json({ message: 'Error creating facility', error: error.message });
  }
});

router.put('/facilities/:id', async (req, res) => {
  try {
    const { company_id, facility_type_id, facility_type_slug, name, description, location, capacity, base_price, sittingPlan, sittingLength, features, images, status } = req.body;
    const facility = await Facility.findByPk(req.params.id);

    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    let facilityTypeId = facility_type_id;
    if (!facilityTypeId && facility_type_slug) {
      const facilityType = await FacilityType.findOne({ where: { slug: facility_type_slug } });
      if (!facilityType) {
        return res.status(400).json({ message: 'Invalid facility type' });
      }
      facilityTypeId = facilityType.id;
    }

    await facility.update({
      company_id: company_id || facility.company_id,
      facility_type_id: facilityTypeId || facility.facility_type_id,
      name: name || facility.name,
      slug: name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : facility.slug,
      description: description !== undefined ? description : facility.description,
      location: location !== undefined ? location : facility.location,
      capacity: capacity !== undefined ? capacity : facility.capacity,
      base_price: base_price !== undefined ? base_price : facility.base_price,
      sittingPlan: sittingPlan !== undefined ? sittingPlan : facility.sittingPlan,
      sittingLength: sittingLength !== undefined ? sittingLength : facility.sittingLength,
      features: features !== undefined ? features : facility.features,
      images: images !== undefined ? images : facility.images,
      status: status || facility.status
    });

    res.json(facility);
  } catch (error) {
    res.status(500).json({ message: 'Error updating facility', error: error.message });
  }
});

router.get('/facilities', async (req, res) => {
  try {
    const { page = 1, limit = 20, company_id, facility_type_id } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (company_id) {
      where.company_id = company_id;
    }
    if (facility_type_id) {
      where.facility_type_id = facility_type_id;
    }

    const facilities = await Facility.findAndCountAll({
      where,
      include: [{
        model: Company,
        attributes: ['id', 'name']
      }, {
        model: FacilityType,
        attributes: ['id', 'name', 'slug']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      facilities: facilities.rows,
      pagination: {
        total: facilities.count,
        page: parseInt(page),
        pages: Math.ceil(facilities.count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching facilities', error: error.message });
  }
});

router.delete('/facilities/:id', async (req, res) => {
  try {
    const facility = await Facility.findByPk(req.params.id);
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }
    await facility.destroy();
    res.json({ message: 'Facility deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting facility', error: error.message });
  }
});

router.get('/facilities/:id', async (req, res) => {
  try {
    const facility = await Facility.findByPk(req.params.id, {
      include: [{
        model: Company,
        attributes: ['id', 'name']
      }, {
        model: FacilityType,
        attributes: ['id', 'name', 'slug']
      }, {
        model: Activity,
        include: [ActivityInstance]
      }]
    });

    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    res.json(facility);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching facility', error: error.message });
  }
});

// Booking Management
router.get('/bookings', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, company_id } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) {
      where.status = status;
    }
    if (company_id) {
      where.company_id = company_id;
    }

    const bookings = await Booking.findAndCountAll({
      where,
      include: [{
        model: User,
        attributes: ['id', 'first_name', 'last_name', 'email']
      }, {
        model: Company,
        attributes: ['id', 'name']
      }, {
        model: Journey,
        include: [{
          model: Route,
          include: [{
            model: Station,
            as: 'originStation',
            attributes: ['id', 'name']
          }, {
            model: Station,
            as: 'destinationStation',
            attributes: ['id', 'name']
          }]
        }]
      }, {
        model: Payment,
        attributes: ['id', 'amount', 'status', 'method']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      bookings: bookings.rows,
      pagination: {
        total: bookings.count,
        page: parseInt(page),
        pages: Math.ceil(bookings.count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
});

router.get('/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{
        model: User,
        attributes: ['id', 'first_name', 'last_name', 'email', 'phone_number']
      }, {
        model: Company,
        attributes: ['id', 'name', 'email', 'phone']
      }, {
        model: Journey,
        include: [{
          model: Route,
          include: [{
            model: Station,
            as: 'originStation',
            attributes: ['id', 'name', 'location']
          }, {
            model: Station,
            as: 'destinationStation',
            attributes: ['id', 'name', 'location']
          }]
        }, {
          model: Transport,
          attributes: ['id', 'name', 'registration_number']
        }]
      }, {
        model: BookingItem
      }, {
        model: Payment
      }, {
        model: Currency,
        attributes: ['id', 'code', 'symbol']
      }]
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking', error: error.message });
  }
});

// Payment Management
router.get('/payments', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) {
      where.status = status;
    }

    const payments = await Payment.findAndCountAll({
      where,
      include: [{
        model: Booking,
        attributes: ['id', 'booking_code', 'total_amount'],
        include: [{
          model: User,
          attributes: ['id', 'first_name', 'last_name', 'email']
        }]
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      payments: payments.rows,
      pagination: {
        total: payments.count,
        page: parseInt(page),
        pages: Math.ceil(payments.count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
});

// Dashboard Statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalCompanies,
      totalBookings,
      totalRevenue,
      pendingPayments,
      activeJourneys
    ] = await Promise.all([
      User.count(),
      Company.count(),
      Booking.count(),
      Payment.sum('amount', { where: { status: 'completed' } }),
      Payment.count({ where: { status: 'pending' } }),
      Journey.count({ where: { status: 'active' } })
    ]);

    res.json({
      totalUsers,
      totalCompanies,
      totalBookings,
      totalRevenue: totalRevenue || 0,
      pendingPayments,
      activeJourneys
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

module.exports = router;
