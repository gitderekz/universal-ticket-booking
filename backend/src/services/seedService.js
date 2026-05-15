const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const {
  Role,
  User,
  UserRole,
  Currency,
  Company,
  Transport,
  TransportType,
  FacilityType,
  Facility,
  Route,
  RouteStation,
  Station,
  Timetable,
  Journey,
  SeatLayout,
  SeatHold,
  Booking,
  BookingItem,
  Payment,
  Activity,
  ActivityInstance
} = require('../models');

const slugify = (text) => {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const splitName = (fullName) => {
  const parts = fullName.trim().split(/\s+/);
  return {
    first_name: parts[0] || '',
    last_name: parts.slice(1).join(' ') || parts[0] || ''
  };
};

const seedDatabase = async () => {
  console.log('🌱 Starting database seeding...');

  await seedRoles();
  await seedCurrencies();
  await seedTransportTypes();
  await seedFacilityTypes();

  const currency = await Currency.findOne({ where: { code: 'TZS' } });
  const roles = await getRoles();
  const companies = await seedCompanies();
  const users = await seedUsers(roles, currency);
  const transports = await seedTransports(companies);
  const stations = await seedStations(companies[0]);
  const routes = await seedRoutes(transports, stations);
  await seedRouteStations(routes, stations);
  await seedSeatLayouts(transports);
  const timetables = await seedTimetables(routes);
  await seedJourneys(timetables);
  const facilities = await seedFacilities(companies);
  await seedFacilitySeatLayouts(facilities);
  const activities = await seedActivities(facilities);
  await seedActivityInstances(activities);
  await seedBookings(users.customers, routes, activities, currency);

  console.log('🎉 Database seeding completed successfully!');
};

const getRoles = async () => {
  const slugs = ['developer', 'super_admin', 'company_admin', 'staff', 'customer'];
  const roles = {};
  for (const slug of slugs) {
    roles[slug] = await Role.findOne({ where: { slug } });
  }
  return roles;
};

const seedRoles = async () => {
  const roles = [
    { name: 'Developer', slug: 'developer', is_system: true },
    { name: 'Super Admin', slug: 'super_admin', is_system: true },
    { name: 'Company Admin', slug: 'company_admin', is_system: false },
    { name: 'Staff', slug: 'staff', is_system: false },
    { name: 'Customer', slug: 'customer', is_system: false }
  ];

  for (const role of roles) {
    await Role.findOrCreate({ where: { slug: role.slug }, defaults: role });
  }
};

const seedCurrencies = async () => {
  const currencies = [
    { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TZS', exchange_rate: 1.0, is_base: true, active: true },
    { code: 'USD', name: 'US Dollar', symbol: '$', exchange_rate: 0.00042, is_base: false, active: true },
    { code: 'EUR', name: 'Euro', symbol: '€', exchange_rate: 0.00038, is_base: false, active: true },
    { code: 'GBP', name: 'British Pound', symbol: '£', exchange_rate: 0.00033, is_base: false, active: true },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R', exchange_rate: 0.0082, is_base: false, active: true }
  ];

  for (const currency of currencies) {
    await Currency.findOrCreate({ where: { code: currency.code }, defaults: currency });
  }
};

const seedTransportTypes = async () => {
  const types = [
    { name: 'Safari Car', slug: 'safari_car', category: 'land', requires_routes: true, requires_layout: true },
    { name: 'Mini Bus', slug: 'mini_bus', category: 'land', requires_routes: true, requires_layout: true },
    { name: 'Bus', slug: 'bus', category: 'land', requires_routes: true, requires_layout: true },
    { name: 'Train', slug: 'train', category: 'land', requires_routes: true, requires_layout: true },
    { name: 'Aeroplane', slug: 'aeroplane', category: 'air', requires_routes: true, requires_layout: true },
    { name: 'Boat', slug: 'boat', category: 'water', requires_routes: true, requires_layout: true },
    { name: 'Ferry', slug: 'ferry', category: 'water', requires_routes: true, requires_layout: true },
    { name: 'Ship', slug: 'ship', category: 'water', requires_routes: true, requires_layout: true }
  ];

  for (const type of types) {
    await TransportType.findOrCreate({ where: { slug: type.slug }, defaults: type });
  }
};

const seedFacilityTypes = async () => {
  const types = [
    { name: 'Hotel', slug: 'hotel', category: 'housing', description: 'Hotel rooms and accommodations' },
    { name: 'Movie Theatre', slug: 'movie_theatre', category: 'entertainment', description: 'Cinema and screenings' },
    { name: 'Conference Hall', slug: 'conference_hall', category: 'events', description: 'Conference and meeting spaces' },
    { name: 'Stadium', slug: 'stadium', category: 'sports', description: 'Sports and arena venues' },
    { name: 'Restaurant', slug: 'restaurant', category: 'outdoor', description: 'Dining and culinary experiences' },
    { name: 'Park', slug: 'park', category: 'outdoor', description: 'Outdoor recreation areas' },
    { name: 'Resort', slug: 'resort', category: 'housing', description: 'Resorts and leisure stays' },
    { name: 'Lodge', slug: 'lodge', category: 'housing', description: 'Safari lodges and camps' },
    { name: 'Parking Lot', slug: 'parking_lot', category: 'outdoor', description: 'Vehicle parking and storage' },
    { name: 'Arena', slug: 'arena', category: 'sports', description: 'Indoor and outdoor sports arena' },
    { name: 'Court', slug: 'court', category: 'sports', description: 'Sports courts for basketball and tennis' },
    { name: 'Meeting Room', slug: 'meeting_room', category: 'events', description: 'Meeting rooms for business and private events' },
    { name: 'Concert Hall', slug: 'concert_hall', category: 'events', description: 'Concert venues for live music' },
    { name: 'Exhibition Hall', slug: 'exhibition_hall', category: 'events', description: 'Exhibition and trade show spaces' },
    { name: 'Safari Park', slug: 'safari_park', category: 'outdoor', description: 'Safari park reservations and tours' },
    { name: 'Mountain Lodge', slug: 'mountain', category: 'outdoor', description: 'Mountain hiking and expedition lodges' },
    { name: 'Camp', slug: 'camp', category: 'outdoor', description: 'Camping and expedition sites' }
  ];

  for (const type of types) {
    await FacilityType.findOrCreate({ where: { slug: type.slug }, defaults: type });
  }
};

const seedCompanies = async () => {
  const companies = [
    {
      name: 'Kilimanjaro Express',
      slug: 'kilimanjaro-express',
      description: 'Premium bus services across Tanzania',
      category: 'transport',
      status: 'active',
      logo_url: null,
      contact_email: 'info@kiliexpress.co.tz',
      contact_phone: '+255767000001'
    },
    {
      name: 'Dar Es Salaam Cinemas',
      slug: 'dar-es-salaam-cinemas',
      description: 'Modern cinema experience',
      category: 'facility',
      status: 'active',
      logo_url: null,
      contact_email: 'info@darcinemas.co.tz',
      contact_phone: '+255767000002'
    },
    {
      name: 'Safari Adventures',
      slug: 'safari-adventures',
      description: 'Safari car rentals and tours',
      category: 'transport',
      status: 'active',
      logo_url: null,
      contact_email: 'info@safariadventures.co.tz',
      contact_phone: '+255767000003'
    },
    {
      name: 'National Stadium',
      slug: 'national-stadium',
      description: 'Premier sports venue',
      category: 'facility',
      status: 'active',
      logo_url: null,
      contact_email: 'info@nationalstadium.co.tz',
      contact_phone: '+255767000004'
    },
    {
      name: 'Tanzania Railways',
      slug: 'tanzania-railways',
      description: 'Central railway services',
      category: 'transport',
      status: 'active',
      logo_url: null,
      contact_email: 'info@rzltz.co.tz',
      contact_phone: '+255767000005'
    },
    {
      name: 'Island Ferries',
      slug: 'island-ferries',
      description: 'Zanzibar and coastal ferry services',
      category: 'transport',
      status: 'active',
      logo_url: null,
      contact_email: 'info@islandferries.co.tz',
      contact_phone: '+255767000006'
    },
    {
      name: 'Conference Center Arusha',
      slug: 'conference-center-arusha',
      description: 'International conference facilities',
      category: 'facility',
      status: 'active',
      logo_url: null,
      contact_email: 'info@conferencearusha.co.tz',
      contact_phone: '+255767000007'
    },
    {
      name: 'Precision Air',
      slug: 'precision-air',
      description: 'Regional airline serving East Africa',
      category: 'transport',
      status: 'active',
      logo_url: null,
      contact_email: 'info@precisionair.co.tz',
      contact_phone: '+255767000008'
    },
    {
      name: 'Coastal Aviation',
      slug: 'coastal-aviation',
      description: 'Safari and coastal flights',
      category: 'transport',
      status: 'active',
      logo_url: null,
      contact_email: 'info@coastalaviation.co.tz',
      contact_phone: '+255767000009'
    },
    {
      name: 'Azam Marine',
      slug: 'azam-marine',
      description: 'High-speed ferry services',
      category: 'transport',
      status: 'active',
      logo_url: null,
      contact_email: 'info@azammarine.co.tz',
      contact_phone: '+255767000010'
    },
    {
      name: 'Serengeti Safaris',
      slug: 'serengeti-safaris',
      description: 'Premium safari tour operator',
      category: 'transport',
      status: 'active',
      logo_url: null,
      contact_email: 'info@serengetisafaris.co.tz',
      contact_phone: '+255767000011'
    },
    {
      name: 'Kenya Railways SGR',
      slug: 'kenya-railways-sgr',
      description: 'Standard Gauge Railway services',
      category: 'transport',
      status: 'active',
      logo_url: null,
      contact_email: 'info@kenyarailways.co.ke',
      contact_phone: '+254700000012'
    },
    {
      name: 'Cinemax Cinemas',
      slug: 'cinemax-cinemas',
      description: 'Luxury cinema chain',
      category: 'facility',
      status: 'active',
      logo_url: null,
      contact_email: 'info@cinemax.co.tz',
      contact_phone: '+255767000013'
    },
    {
      name: 'Mlimani City Cinemas',
      slug: 'mlimani-city-cinemas',
      description: 'Shopping mall cinema complex',
      category: 'facility',
      status: 'active',
      logo_url: null,
      contact_email: 'info@mlimanicinemas.co.tz',
      contact_phone: '+255767000014'
    },
    {
      name: 'Benjamin Mkapa Stadium',
      slug: 'benjamin-mkapa-stadium',
      description: 'National sports complex',
      category: 'facility',
      status: 'active',
      logo_url: null,
      contact_email: 'info@benjaminmkapa.co.tz',
      contact_phone: '+255767000015'
    },
    {
      name: 'Uhuru Stadium',
      slug: 'uhuru-stadium',
      description: 'Historic sports venue',
      category: 'facility',
      status: 'active',
      logo_url: null,
      contact_email: 'info@uhurustadium.co.tz',
      contact_phone: '+255767000016'
    },
    {
      name: 'Serengeti Lodge & Spa',
      slug: 'serengeti-lodge-spa',
      description: 'Luxury safari lodge',
      category: 'facility',
      status: 'active',
      logo_url: null,
      contact_email: 'info@serengetilodge.co.tz',
      contact_phone: '+255767000017'
    },
    {
      name: 'Zanzibar Beach Resort',
      slug: 'zanzibar-beach-resort',
      description: 'Beachfront accommodation',
      category: 'facility',
      status: 'active',
      logo_url: null,
      contact_email: 'info@zanzibarbeach.co.tz',
      contact_phone: '+255767000018'
    },
    {
      name: 'Kilimanjaro Hotel',
      slug: 'kilimanjaro-hotel',
      description: 'Premium city hotel',
      category: 'facility',
      status: 'active',
      logo_url: null,
      contact_email: 'info@kilimanjarohotel.co.tz',
      contact_phone: '+255767000019'
    },
    {
      name: 'Arusha Conference Centre',
      slug: 'arusha-conference-centre',
      description: 'International events venue',
      category: 'facility',
      status: 'active',
      logo_url: null,
      contact_email: 'info@arushacenter.co.tz',
      contact_phone: '+255767000020'
    },
    {
      name: 'Ngorongoro Adventures',
      slug: 'ngorongoro-adventures',
      description: 'Crater tours and camping',
      category: 'facility',
      status: 'active',
      logo_url: null,
      contact_email: 'info@ngorongoroadventures.co.tz',
      contact_phone: '+255767000021'
    },
    {
      name: 'Mount Meru Tours',
      slug: 'mount-meru-tours',
      description: 'Trekking and hiking expeditions',
      category: 'facility',
      status: 'active',
      logo_url: null,
      contact_email: 'info@mountmerutours.co.tz',
      contact_phone: '+255767000022'
    },
    {
      name: 'Saadani Safari Park',
      slug: 'saadani-safari-park',
      description: 'Coastal safari experiences',
      category: 'facility',
      status: 'active',
      logo_url: null,
      contact_email: 'info@saadanisafari.co.tz',
      contact_phone: '+255767000023'
    },
    {
      name: 'Nairobi Transit',
      slug: 'nairobi-transit',
      description: 'Cross-border bus services',
      category: 'transport',
      status: 'active',
      logo_url: null,
      contact_email: 'info@nairobitransit.co.ke',
      contact_phone: '+254700000024'
    },
    {
      name: 'Lake Victoria Cruises',
      slug: 'lake-victoria-cruises',
      description: 'Passenger and cargo ships',
      category: 'transport',
      status: 'active',
      logo_url: null,
      contact_email: 'info@lakevictoriacruises.co.tz',
      contact_phone: '+255767000025'
    }
  ];

  const seededCompanies = [];
  for (const company of companies) {
    const [record] = await Company.findOrCreate({
      where: { slug: company.slug },
      defaults: company
    });
    seededCompanies.push(record);
  }

  return seededCompanies;
};

const createUserWithRole = async (definition, role) => {
  const { first_name, last_name } = splitName(definition.full_name || `${definition.email}`);
  const [user, created] = await User.findOrCreate({
    where: { email: definition.email },
    defaults: {
      email: definition.email,
      phone: definition.phone,
      password_hash: definition.password,
      first_name,
      last_name,
      preferred_language: definition.preferred_language || 'en',
      status: definition.status || 'active'
    }
  });

  if (!created) {
    const updates = {};
    if (definition.phone && user.phone !== definition.phone) {
      const phoneOwner = await User.findOne({ where: { phone: definition.phone } });
      if (!phoneOwner || phoneOwner.id === user.id) {
        updates.phone = definition.phone;
      }
    }
    if (first_name && user.first_name !== first_name) updates.first_name = first_name;
    if (last_name && user.last_name !== last_name) updates.last_name = last_name;
    if (definition.preferred_language && user.preferred_language !== definition.preferred_language) updates.preferred_language = definition.preferred_language;
    if (definition.status && user.status !== definition.status) updates.status = definition.status;
    if (Object.keys(updates).length) {
      await user.update(updates);
    }
  }

  if (role) {
    await UserRole.findOrCreate({
      where: { user_id: user.id, role_id: role.id },
      defaults: { user_id: user.id, role_id: role.id }
    });
  }

  return user;
};

const seedUsers = async (roles, currency) => {
  const password = 'SeedPass123!';
  const users = {
    system: [],
    companyAdmins: [],
    staff: [],
    customers: []
  };

  const adminDefinitions = [
    { email: 'dev@system.co.tz', full_name: 'System Developer', phone: '+255700000001', password, preferred_language: 'en', status: 'active', role: roles.developer },
    { email: 'admin@system.co.tz', full_name: 'Super Administrator', phone: '+255700000002', password, preferred_language: 'en', status: 'active', role: roles.super_admin }
  ];

  for (const def of adminDefinitions) {
    const user = await createUserWithRole(def, def.role);
    users.system.push(user);
  }

  const companyAdminDefinitions = [
    { email: 'manager@kiliexpress.co.tz', full_name: 'Baraka Mwenda', phone: '+255712111222', password, preferred_language: 'en', status: 'active', role: roles.company_admin },
    { email: 'manager@azammarine.co.tz', full_name: 'Ahmed Hassan', phone: '+255787654321', password, preferred_language: 'en', status: 'active', role: roles.company_admin },
    { email: 'manager@serengeti.co.tz', full_name: 'Neema Oloitipitip', phone: '+255744123456', password, preferred_language: 'en', status: 'active', role: roles.company_admin },
    { email: 'manager@darcinema.co.tz', full_name: 'Fatuma Mkono', phone: '+255765987654', password, preferred_language: 'en', status: 'active', role: roles.company_admin },
    { email: 'manager@railways.co.tz', full_name: 'Peter Kamau', phone: '+255787654322', password, preferred_language: 'en', status: 'active', role: roles.company_admin }
  ];

  for (const def of companyAdminDefinitions) {
    const user = await createUserWithRole(def, def.role);
    users.companyAdmins.push(user);
  }

  const staffDefinitions = [
    { email: 'staff@kiliexpress.co.tz', full_name: 'Naomi Ochieng', phone: '+255754333444', password, preferred_language: 'en', status: 'active', role: roles.staff },
    { email: 'staff@azammarine.co.tz', full_name: 'Hassan Salim', phone: '+255755000111', password, preferred_language: 'en', status: 'active', role: roles.staff },
    { email: 'staff@darcinema.co.tz', full_name: 'Amina Juma', phone: '+255712345678', password, preferred_language: 'en', status: 'active', role: roles.staff }
  ];

  for (const def of staffDefinitions) {
    const user = await createUserWithRole(def, def.role);
    users.staff.push(user);
  }

  const customerDefinitions = [
    { email: 'amina.juma@gmail.com', full_name: 'Amina Juma', phone: '+255776000001', password, preferred_language: 'en', status: 'active', role: roles.customer },
    { email: 'grace.kimani@gmail.com', full_name: 'Grace Kimani', phone: '+255776234567', password, preferred_language: 'en', status: 'active', role: roles.customer },
    { email: 'james.mbogo@gmail.com', full_name: 'James Mbogo', phone: '+255713456789', password, preferred_language: 'en', status: 'active', role: roles.customer },
    { email: 'fatuma.hassan@gmail.com', full_name: 'Fatuma Hassan', phone: '+255776000002', password, preferred_language: 'en', status: 'active', role: roles.customer },
    { email: 'david.mwase@gmail.com', full_name: 'David Mwase', phone: '+255787123456', password, preferred_language: 'en', status: 'active', role: roles.customer }
  ];

  for (const def of customerDefinitions) {
    const user = await createUserWithRole(def, def.role);
    users.customers.push(user);
  }

  return users;
};

const seedTransports = async (companies) => {
  const transports = [
    // Buses
    {
      company_slug: 'kilimanjaro-express',
      name: 'Express 001',
      transport_type_slug: 'bus',
      registration_number: 'T-001-KLM',
      capacity: 50,
      description: 'Daily Dar es Salaam to Arusha bus service',
      status: 'active'
    },
    {
      company_slug: 'kilimanjaro-express',
      name: 'Luxury 002',
      transport_type_slug: 'bus',
      registration_number: 'T-002-KLM',
      capacity: 40,
      description: 'Premium intercity coach',
      status: 'active'
    },
    {
      company_slug: 'nairobi-transit',
      name: 'Nairobi Express',
      transport_type_slug: 'bus',
      registration_number: 'T-003-NRB',
      capacity: 45,
      description: 'Cross-border bus service',
      status: 'active'
    },
    {
      company_slug: 'nairobi-transit',
      name: 'Cross Border VIP',
      transport_type_slug: 'bus',
      registration_number: 'T-004-NRB',
      capacity: 35,
      description: 'VIP cross-border service',
      status: 'active'
    },
    {
      company_slug: 'kilimanjaro-express',
      name: 'Scania Supreme',
      transport_type_slug: 'bus',
      registration_number: 'T-005-KLM',
      capacity: 52,
      description: 'Luxury long-distance coach',
      status: 'active'
    },

    // Mini Buses
    {
      company_slug: 'kilimanjaro-express',
      name: 'Mini Express 003',
      transport_type_slug: 'mini_bus',
      registration_number: 'T-006-KLM',
      capacity: 25,
      description: 'Airport shuttle and short-route service',
      status: 'active'
    },
    {
      company_slug: 'safari-adventures',
      name: 'Safari Shuttle',
      transport_type_slug: 'mini_bus',
      registration_number: 'T-007-SAF',
      capacity: 18,
      description: 'Safari transfer shuttle',
      status: 'active'
    },
    {
      company_slug: 'nairobi-transit',
      name: 'Urban Commuter',
      transport_type_slug: 'mini_bus',
      registration_number: 'T-008-NRB',
      capacity: 20,
      description: 'City commuter service',
      status: 'active'
    },

    // Safari Cars
    {
      company_slug: 'safari-adventures',
      name: 'Safari Cruiser',
      transport_type_slug: 'safari_car',
      registration_number: 'T-009-SAF',
      capacity: 7,
      description: 'Small safari vehicle for guided tours',
      status: 'active'
    },
    {
      company_slug: 'serengeti-safaris',
      name: 'Land Cruiser VX',
      transport_type_slug: 'safari_car',
      registration_number: 'T-010-SER',
      capacity: 8,
      description: 'Premium safari vehicle',
      status: 'active'
    },
    {
      company_slug: 'serengeti-safaris',
      name: 'Safari Ranger',
      transport_type_slug: 'safari_car',
      registration_number: 'T-011-SER',
      capacity: 6,
      description: 'Compact safari vehicle',
      status: 'active'
    },
    {
      company_slug: 'safari-adventures',
      name: 'Desert Explorer',
      transport_type_slug: 'safari_car',
      registration_number: 'T-012-SAF',
      capacity: 7,
      description: 'Desert safari vehicle',
      status: 'active'
    },

    // Trains
    {
      company_slug: 'tanzania-railways',
      name: 'Central Line Express',
      transport_type_slug: 'train',
      registration_number: 'TR-001-TRZ',
      capacity: 200,
      description: 'Intercity train service',
      status: 'active'
    },
    {
      company_slug: 'tanzania-railways',
      name: 'Coastal Express',
      transport_type_slug: 'train',
      registration_number: 'TR-002-TRZ',
      capacity: 180,
      description: 'Coastal railway service',
      status: 'active'
    },
    {
      company_slug: 'kenya-railways-sgr',
      name: 'SGR Madaraka',
      transport_type_slug: 'train',
      registration_number: 'TR-003-KEN',
      capacity: 300,
      description: 'Standard Gauge Railway',
      status: 'active'
    },
    {
      company_slug: 'kenya-railways-sgr',
      name: 'SGR Intercity',
      transport_type_slug: 'train',
      registration_number: 'TR-004-KEN',
      capacity: 280,
      description: 'Intercity SGR service',
      status: 'active'
    },

    // Airplanes
    {
      company_slug: 'precision-air',
      name: 'PA Boeing 737',
      transport_type_slug: 'aeroplane',
      registration_number: 'P-001-AER',
      capacity: 120,
      description: 'Regional passenger airplane',
      status: 'active'
    },
    {
      company_slug: 'precision-air',
      name: 'PA ATR 42',
      transport_type_slug: 'aeroplane',
      registration_number: 'P-002-AER',
      capacity: 48,
      description: 'Regional turboprop aircraft',
      status: 'active'
    },
    {
      company_slug: 'coastal-aviation',
      name: 'Coastal Caravan',
      transport_type_slug: 'aeroplane',
      registration_number: 'P-003-COA',
      capacity: 12,
      description: 'Light aircraft for safari flights',
      status: 'active'
    },
    {
      company_slug: 'coastal-aviation',
      name: 'Safari Air Cessna',
      transport_type_slug: 'aeroplane',
      registration_number: 'P-004-COA',
      capacity: 6,
      description: 'Small safari aircraft',
      status: 'active'
    },

    // Ferries
    {
      company_slug: 'island-ferries',
      name: 'Ocean Jet',
      transport_type_slug: 'ferry',
      registration_number: 'F-001-ISL',
      capacity: 150,
      description: 'High-speed ferry service',
      status: 'active'
    },
    {
      company_slug: 'azam-marine',
      name: 'Azam Star',
      transport_type_slug: 'ferry',
      registration_number: 'F-002-AZM',
      capacity: 200,
      description: 'Zanzibar ferry with passenger service',
      status: 'active'
    },
    {
      company_slug: 'azam-marine',
      name: 'Kilimanjaro IV',
      transport_type_slug: 'ferry',
      registration_number: 'F-003-AZM',
      capacity: 180,
      description: 'Coastal ferry service',
      status: 'active'
    },
    {
      company_slug: 'island-ferries',
      name: 'Island Hopper',
      transport_type_slug: 'ferry',
      registration_number: 'F-004-ISL',
      capacity: 100,
      description: 'Island hopping ferry',
      status: 'active'
    },

    // Ships
    {
      company_slug: 'lake-victoria-cruises',
      name: 'MV Victoria',
      transport_type_slug: 'ship',
      registration_number: 'S-001-LVC',
      capacity: 400,
      description: 'Lake Victoria passenger ship',
      status: 'active'
    },
    {
      company_slug: 'lake-victoria-cruises',
      name: 'MV Nyanza',
      transport_type_slug: 'ship',
      registration_number: 'S-002-LVC',
      capacity: 350,
      description: 'Lake Victoria cruise ship',
      status: 'active'
    },

    // Boats
    {
      company_slug: 'island-ferries',
      name: 'Speed Boat Alpha',
      transport_type_slug: 'boat',
      registration_number: 'B-001-ISL',
      capacity: 30,
      description: 'Speed boat service',
      status: 'active'
    },
    {
      company_slug: 'azam-marine',
      name: 'Express Dhow',
      transport_type_slug: 'boat',
      registration_number: 'B-002-AZM',
      capacity: 25,
      description: 'Traditional boat service',
      status: 'active'
    },
    {
      company_slug: 'lake-victoria-cruises',
      name: 'Lake Cruiser',
      transport_type_slug: 'boat',
      registration_number: 'B-003-LVC',
      capacity: 40,
      description: 'Lake cruiser boat',
      status: 'active'
    }
  ];

  const transportLayouts = {
    'T-001-KLM': { sittingPlan: '2-2', sittingLength: 12 },
    'T-002-KLM': { sittingPlan: '2-1', sittingLength: 13 },
    'T-003-NRB': { sittingPlan: '2-2', sittingLength: 11 },
    'T-004-NRB': { sittingPlan: '1-2', sittingLength: 11 },
    'T-005-KLM': { sittingPlan: '2-2', sittingLength: 13 },
    'T-006-KLM': { sittingPlan: '1-2', sittingLength: 8 },
    'T-007-SAF': { sittingPlan: '1-2', sittingLength: 6 },
    'T-008-NRB': { sittingPlan: '2-2', sittingLength: 5 },
    'T-009-SAF': { sittingPlan: '1-2', sittingLength: 2 },
    'T-010-SER': { sittingPlan: '2-2', sittingLength: 2 },
    'T-011-SER': { sittingPlan: '1-2', sittingLength: 2 },
    'T-012-SAF': { sittingPlan: '1-2', sittingLength: 2 },
    'TR-001-TRZ': { sittingPlan: '3-2', sittingLength: 20 },
    'TR-002-TRZ': { sittingPlan: '3-2', sittingLength: 18 },
    'TR-003-KEN': { sittingPlan: '3-2', sittingLength: 25 },
    'TR-004-KEN': { sittingPlan: '3-2', sittingLength: 24 },
    'P-001-AER': { sittingPlan: '3-3', sittingLength: 20 },
    'P-002-AER': { sittingPlan: '2-2', sittingLength: 12 },
    'P-003-COA': { sittingPlan: '1-1', sittingLength: 6 },
    'P-004-COA': { sittingPlan: '1-1', sittingLength: 3 },
    'F-001-ISL': { sittingPlan: '3-3', sittingLength: 15 },
    'F-002-AZM': { sittingPlan: '4-4', sittingLength: 20 },
    'F-003-AZM': { sittingPlan: '3-4', sittingLength: 18 },
    'F-004-ISL': { sittingPlan: '3-3', sittingLength: 12 },
    'S-001-LVC': { sittingPlan: '5-5', sittingLength: 40 },
    'S-002-LVC': { sittingPlan: '5-5', sittingLength: 35 },
    'B-001-ISL': { sittingPlan: '2-2', sittingLength: 8 },
    'B-002-AZM': { sittingPlan: '2-2', sittingLength: 7 },
    'B-003-LVC': { sittingPlan: '2-3', sittingLength: 8 }
  };

  const seededTransports = [];
  for (const data of transports) {
    const company = await Company.findOne({ where: { slug: data.company_slug } });
    const type = await TransportType.findOne({ where: { slug: data.transport_type_slug } });
    const layout = transportLayouts[data.registration_number] || { sittingPlan: null, sittingLength: 0 };
    const [transport, created] = await Transport.findOrCreate({
      where: { registration_number: data.registration_number },
      defaults: {
        company_id: company.id,
        transport_type_id: type.id,
        name: data.name,
        registration_number: data.registration_number,
        capacity: data.capacity,
        description: data.description,
        sittingPlan: layout.sittingPlan,
        sittingLength: layout.sittingLength,
        status: data.status
      }
    });

    if (!created) {
      const updateData = {};
      if (layout.sittingPlan && transport.sittingPlan !== layout.sittingPlan) {
        updateData.sittingPlan = layout.sittingPlan;
      }
      if (layout.sittingLength && transport.sittingLength !== layout.sittingLength) {
        updateData.sittingLength = layout.sittingLength;
      }
      if (Object.keys(updateData).length) {
        await transport.update(updateData);
      }
    }

    seededTransports.push(transport);
  }

  return seededTransports;
};

const seedStations = async (company) => {
  const stationDefinitions = [
    { name: 'Dar es Salaam', code: 'DSM', city: 'Dar es Salaam', country: 'Tanzania', type: 'origin', address: 'Dar es Salaam Station' },
    { name: 'Morogoro', code: 'MGO', city: 'Morogoro', country: 'Tanzania', type: 'intermediate', address: 'Morogoro Stop' },
    { name: 'Dodoma', code: 'DDM', city: 'Dodoma', country: 'Tanzania', type: 'intermediate', address: 'Dodoma Terminal' },
    { name: 'Iringa', code: 'IRG', city: 'Iringa', country: 'Tanzania', type: 'intermediate', address: 'Iringa Terminal' },
    { name: 'Mbeya', code: 'MBY', city: 'Mbeya', country: 'Tanzania', type: 'destination', address: 'Mbeya Station' },
    { name: 'Arusha', code: 'ARU', city: 'Arusha', country: 'Tanzania', type: 'destination', address: 'Arusha Terminal' },
    { name: 'Zanzibar', code: 'ZNZ', city: 'Zanzibar', country: 'Tanzania', type: 'destination', address: 'Stone Town Port' },
    { name: 'Pemba', code: 'PMB', city: 'Pemba', country: 'Tanzania', type: 'destination', address: 'Pemba Port' }
  ];

  const seededStations = [];
  for (const station of stationDefinitions) {
    const [record] = await Station.findOrCreate({
      where: { code: station.code },
      defaults: {
        company_id: company.id,
        name: station.name,
        code: station.code,
        city: station.city,
        country: station.country,
        type: station.type,
        address: station.address
      }
    });
    seededStations.push(record);
  }

  return seededStations;
};

const seedRoutes = async (transports, stations) => {
  const routeDefinitions = [
    // Bus routes
    {
      transport_registration: 'T-001-KLM',
      name: 'Dar es Salaam to Mwanza',
      description: 'Dar es Salaam to Mwanza via Morogoro, Dodoma, Singida',
      origin_code: 'DSM',
      destination_code: 'MBY',
      base_price: 60000,
      status: 'active'
    },
    {
      transport_registration: 'T-002-KLM',
      name: 'Arusha to Dar es Salaam',
      description: 'Arusha to Dar es Salaam via Same, Korogwe, Morogoro',
      origin_code: 'ARU',
      destination_code: 'DSM',
      base_price: 50000,
      status: 'active'
    },
    {
      transport_registration: 'T-003-NRB',
      name: 'Nairobi to Arusha',
      description: 'Cross-border service from Nairobi to Arusha',
      origin_code: 'DSM',
      destination_code: 'ARU',
      base_price: 35000,
      status: 'active'
    },
    {
      transport_registration: 'T-005-KLM',
      name: 'Dodoma to Mbeya',
      description: 'Dodoma to Mbeya via Iringa',
      origin_code: 'DDM',
      destination_code: 'MBY',
      base_price: 40000,
      status: 'active'
    },

    // Mini bus routes
    {
      transport_registration: 'T-006-KLM',
      name: 'Dar es Salaam to Bagamoyo',
      description: 'Short route shuttle service',
      origin_code: 'DSM',
      destination_code: 'MGO',
      base_price: 15000,
      status: 'active'
    },

    // Safari car routes
    {
      transport_registration: 'T-009-SAF',
      name: 'Arusha to Serengeti',
      description: 'Safari transfer from Arusha to Serengeti National Park',
      origin_code: 'ARU',
      destination_code: 'DSM',
      base_price: 250000,
      status: 'active'
    },
    {
      transport_registration: 'T-010-SER',
      name: 'Arusha to Ngorongoro',
      description: 'Safari transfer to Ngorongoro Crater',
      origin_code: 'ARU',
      destination_code: 'DSM',
      base_price: 180000,
      status: 'active'
    },

    // Train routes
    {
      transport_registration: 'TR-001-TRZ',
      name: 'Dar es Salaam to Kigoma',
      description: 'Cross-country train service to Kigoma via Morogoro, Dodoma, Tabora',
      origin_code: 'DSM',
      destination_code: 'MBY',
      base_price: 45000,
      status: 'active'
    },
    {
      transport_registration: 'TR-003-KEN',
      name: 'Nairobi to Mombasa',
      description: 'Standard Gauge Railway from Nairobi to Mombasa',
      origin_code: 'DSM',
      destination_code: 'ZNZ',
      base_price: 50000,
      status: 'active'
    },

    // Airplane routes
    {
      transport_registration: 'P-001-AER',
      name: 'Dar es Salaam to Kilimanjaro',
      description: 'Domestic flight from Dar es Salaam to Kilimanjaro Airport',
      origin_code: 'DSM',
      destination_code: 'ARU',
      base_price: 180000,
      status: 'active'
    },
    {
      transport_registration: 'P-002-AER',
      name: 'Dar es Salaam to Zanzibar',
      description: 'Domestic flight from Dar es Salaam to Zanzibar',
      origin_code: 'DSM',
      destination_code: 'ZNZ',
      base_price: 120000,
      status: 'active'
    },
    {
      transport_registration: 'P-003-COA',
      name: 'Arusha to Serengeti',
      description: 'Safari flight to Serengeti airstrip',
      origin_code: 'ARU',
      destination_code: 'DSM',
      base_price: 350000,
      status: 'active'
    },

    // Ferry routes
    {
      transport_registration: 'F-001-ISL',
      name: 'Dar es Salaam to Zanzibar',
      description: 'High-speed ferry service to Zanzibar',
      origin_code: 'DSM',
      destination_code: 'ZNZ',
      base_price: 35000,
      status: 'active'
    },
    {
      transport_registration: 'F-002-AZM',
      name: 'Dar es Salaam to Pemba',
      description: 'Ferry service from Dar es Salaam to Pemba Island',
      origin_code: 'DSM',
      destination_code: 'PMB',
      base_price: 50000,
      status: 'active'
    },

    // Ship routes
    {
      transport_registration: 'S-001-LVC',
      name: 'Mwanza to Bukoba',
      description: 'Lake Victoria passenger ship service',
      origin_code: 'MBY',
      destination_code: 'ZNZ',
      base_price: 30000,
      status: 'active'
    },

    // Boat routes
    {
      transport_registration: 'B-001-ISL',
      name: 'Zanzibar to Prison Island',
      description: 'Speed boat transfer to Prison Island',
      origin_code: 'ZNZ',
      destination_code: 'PMB',
      base_price: 25000,
      status: 'active'
    }
  ];

  const seededRoutes = [];
  for (const data of routeDefinitions) {
    const transport = transports.find((item) => item.registration_number === data.transport_registration);
    const origin = stations.find((station) => station.code === data.origin_code);
    const destination = stations.find((station) => station.code === data.destination_code);

    if (!transport || !origin || !destination) {
      continue;
    }

    const [route] = await Route.findOrCreate({
      where: {
        transport_id: transport.id,
        origin_station_id: origin.id,
        destination_station_id: destination.id
      },
      defaults: {
        company_id: transport.company_id,
        transport_id: transport.id,
        name: data.name,
        description: data.description,
        origin_station_id: origin.id,
        destination_station_id: destination.id,
        base_price: data.base_price,
        distance_km: 120,
        status: data.status
      }
    });

    seededRoutes.push(route);
  }

  return seededRoutes;
};

const seedRouteStations = async (routes, stations) => {
  const routeStops = [
    {
      route_name: 'Dar to Arusha Express',
      stops: [
        { code: 'DSM', cumulative_price: 0, order: 1, is_break_stop: false },
        { code: 'MGO', cumulative_price: 20000, order: 2, is_break_stop: false },
        { code: 'DDM', cumulative_price: 40000, order: 3, is_break_stop: true },
        { code: 'ARU', cumulative_price: 60000, order: 4, is_break_stop: false }
      ]
    },
    {
      route_name: 'Arusha to Dar Return',
      stops: [
        { code: 'ARU', cumulative_price: 0, order: 1, is_break_stop: false },
        { code: 'DDM', cumulative_price: 20000, order: 2, is_break_stop: true },
        { code: 'MGO', cumulative_price: 40000, order: 3, is_break_stop: false },
        { code: 'DSM', cumulative_price: 55000, order: 4, is_break_stop: false }
      ]
    },
    {
      route_name: 'Dar to Morogoro Shuttle',
      stops: [
        { code: 'DSM', cumulative_price: 0, order: 1, is_break_stop: false },
        { code: 'MGO', cumulative_price: 15000, order: 2, is_break_stop: false }
      ]
    },
    {
      route_name: 'Zanzibar to Pemba Ferry',
      stops: [
        { code: 'ZNZ', cumulative_price: 0, order: 1, is_break_stop: false },
        { code: 'PMB', cumulative_price: 35000, order: 2, is_break_stop: false }
      ]
    }
  ];

  for (const routeStop of routeStops) {
    const route = routes.find((item) => item.name === routeStop.route_name);
    if (!route) continue;
    for (const stop of routeStop.stops) {
      const station = stations.find((s) => s.code === stop.code);
      if (!station) continue;
      await RouteStation.findOrCreate({
        where: { route_id: route.id, station_id: station.id },
        defaults: {
          route_id: route.id,
          station_id: station.id,
          sequence_order: stop.order,
          cumulative_price: stop.cumulative_price,
          is_break_stop: stop.is_break_stop,
          distance_from_origin: stop.order * 50
        }
      });
    }
  }
};

const seedSeatLayouts = async (transports) => {
  const layoutDefinitions = [
    { registration_number: 'T-001-KLM', pattern: '2-2', rows: 12 },
    { registration_number: 'T-002-KLM', pattern: '2-1', rows: 13 },
    { registration_number: 'T-003-NRB', pattern: '2-2', rows: 11 },
    { registration_number: 'T-004-NRB', pattern: '1-2', rows: 11 },
    { registration_number: 'T-005-KLM', pattern: '2-2', rows: 13 },
    { registration_number: 'T-006-KLM', pattern: '1-2', rows: 8 },
    { registration_number: 'T-007-SAF', pattern: '1-2', rows: 6 },
    { registration_number: 'T-008-NRB', pattern: '2-2', rows: 5 },
    { registration_number: 'T-009-SAF', pattern: '1-2', rows: 2 },
    { registration_number: 'T-010-SER', pattern: '2-2', rows: 2 },
    { registration_number: 'T-011-SER', pattern: '1-2', rows: 2 },
    { registration_number: 'T-012-SAF', pattern: '1-2', rows: 2 },
    { registration_number: 'TR-001-TRZ', pattern: '3-2', rows: 20 },
    { registration_number: 'TR-002-TRZ', pattern: '3-2', rows: 18 },
    { registration_number: 'TR-003-KEN', pattern: '3-2', rows: 25 },
    { registration_number: 'TR-004-KEN', pattern: '3-2', rows: 24 },
    { registration_number: 'P-001-AER', pattern: '3-3', rows: 20 },
    { registration_number: 'P-002-AER', pattern: '2-2', rows: 12 },
    { registration_number: 'P-003-COA', pattern: '1-1', rows: 6 },
    { registration_number: 'P-004-COA', pattern: '1-1', rows: 3 },
    { registration_number: 'F-001-ISL', pattern: '3-3', rows: 15 },
    { registration_number: 'F-002-AZM', pattern: '4-4', rows: 20 },
    { registration_number: 'F-003-AZM', pattern: '3-4', rows: 18 },
    { registration_number: 'F-004-ISL', pattern: '3-3', rows: 12 },
    { registration_number: 'S-001-LVC', pattern: '5-5', rows: 40 },
    { registration_number: 'S-002-LVC', pattern: '5-5', rows: 35 },
    { registration_number: 'B-001-ISL', pattern: '2-2', rows: 8 },
    { registration_number: 'B-002-AZM', pattern: '2-2', rows: 7 },
    { registration_number: 'B-003-LVC', pattern: '2-3', rows: 8 }
  ];

  for (const layout of layoutDefinitions) {
    const transport = transports.find((item) => item.registration_number === layout.registration_number);
    if (!transport) continue;

    const config = {
      layout_pattern: layout.pattern,
      rows: layout.rows,
      seats_per_row: layout.pattern.split('-').reduce((acc, value) => acc + Number(value || 0), 0)
    };

    const [seatLayout, created] = await SeatLayout.findOrCreate({
      where: { layoutable_id: transport.id, layoutable_type: 'transport' },
      defaults: {
        layoutable_id: transport.id,
        layoutable_type: 'transport',
        layout_type: 'seat',
        pattern: layout.pattern,
        rows: layout.rows,
        total_units: config.rows * config.seats_per_row,
        config,
        status: 'active'
      }
    });

    if (!created) {
      const updateData = {};
      if (seatLayout.pattern !== layout.pattern) updateData.pattern = layout.pattern;
      if (seatLayout.rows !== layout.rows) updateData.rows = layout.rows;
      if (seatLayout.total_units !== config.rows * config.seats_per_row) updateData.total_units = config.rows * config.seats_per_row;
      if (JSON.stringify(seatLayout.config) !== JSON.stringify(config)) updateData.config = config;
      if (Object.keys(updateData).length) await seatLayout.update(updateData);
    }
  }
};

const seedFacilitySeatLayouts = async (facilities) => {
  const facilityLayouts = {
    'cinema-hall-1': { pattern: '3-3', rows: 25 },
    'cinema-hall-2': { pattern: '4-4', rows: 15 },
    'cinemax-imax': { pattern: '5-5', rows: 20 },
    'cinemax-premium': { pattern: '2-2', rows: 20 },
    'mlimani-screen-1': { pattern: '3-3', rows: 17 },
    'mlimani-screen-2': { pattern: '3-3', rows: 15 },
    'main-arena': { pattern: '10-10', rows: 25 },
    'benjamin-mkapa-field': { pattern: '15-15', rows: 100 },
    'uhuru-ground': { pattern: '12-12', rows: 50 },
    'sports-complex-indoor': { pattern: '8-8', rows: 30 },
    'basketball-court': { pattern: '5-5', rows: 10 },
    'grand-conference-hall': { pattern: '5-5', rows: 50 },
    'arusha-summit-hall': { pattern: '8-8', rows: 50 },
    'business-meeting-room': { pattern: '5-5', rows: 10 },
    'concert-arena': { pattern: '10-10', rows: 50 },
    'exhibition-center': { pattern: 'open', rows: 0 },
    'ngorongoro-crater-tour': { pattern: 'safari_vehicle', rows: 0 },
    'mount-meru-summit-trek': { pattern: 'hiking_group', rows: 0 },
    'saadani-beach-safari': { pattern: 'safari_vehicle', rows: 0 },
    'kilimanjaro-marangu-route': { pattern: 'hiking_group', rows: 0 },
    'serengeti-migration-tour': { pattern: 'safari_vehicle', rows: 0 },
    'selous-game-reserve': { pattern: 'safari_vehicle', rows: 0 },
    'serengeti-luxury-lodge': { pattern: 'rooms', rows: 0 },
    'zanzibar-beach-bungalows': { pattern: 'rooms', rows: 0 },
    'kilimanjaro-suites': { pattern: 'rooms', rows: 0 },
    'ngorongoro-crater-camp': { pattern: 'tents', rows: 0 },
    'stone-town-hotel': { pattern: 'rooms', rows: 0 },
    'dar-es-salaam-grand': { pattern: 'rooms', rows: 0 }
  };

  for (const facility of facilities) {
    const layout = facilityLayouts[facility.slug];
    if (!layout) continue;

    const config = {
      layout_pattern: layout.pattern,
      rows: layout.rows,
      seats_per_row: layout.pattern.split('-').reduce((acc, value) => acc + Number(value || 0), 0)
    };

    const totalUnits = config.seats_per_row > 0 ? config.rows * config.seats_per_row : facility.capacity || 0;

    const [seatLayout, created] = await SeatLayout.findOrCreate({
      where: { layoutable_id: facility.id, layoutable_type: 'facility' },
      defaults: {
        layoutable_id: facility.id,
        layoutable_type: 'facility',
        layout_type: 'seat',
        pattern: layout.pattern,
        rows: layout.rows,
        total_units: totalUnits,
        config,
        status: 'active'
      }
    });

    if (!created) {
      const updateData = {};
      if (seatLayout.pattern !== layout.pattern) updateData.pattern = layout.pattern;
      if (seatLayout.rows !== layout.rows) updateData.rows = layout.rows;
      if (seatLayout.total_units !== totalUnits) updateData.total_units = totalUnits;
      if (JSON.stringify(seatLayout.config) !== JSON.stringify(config)) updateData.config = config;
      if (Object.keys(updateData).length) await seatLayout.update(updateData);
    }
  }
};

const seedTimetables = async (routes) => {
  const timetables = [];

  // Transport schedules - Buses
  const transportSchedules = [
    { route_name: 'Dar es Salaam to Mwanza', date: '2026-05-10', startTime: '06:00', endTime: '14:00', availableSeats: 50, status: 'active' },
    { route_name: 'Dar es Salaam to Mwanza', date: '2026-05-10', startTime: '14:00', endTime: '22:00', availableSeats: 48, status: 'active' },
    { route_name: 'Arusha to Dar es Salaam', date: '2026-05-11', startTime: '08:00', endTime: '16:00', availableSeats: 40, status: 'active' },
    { route_name: 'Nairobi to Arusha', date: '2026-05-12', startTime: '07:00', endTime: '11:00', availableSeats: 45, status: 'active' },
    { route_name: 'Dodoma to Mbeya', date: '2026-05-13', startTime: '09:00', endTime: '16:00', availableSeats: 52, status: 'active' },
    { route_name: 'Dar es Salaam to Bagamoyo', date: '2026-05-14', startTime: '10:00', endTime: '12:00', availableSeats: 25, status: 'active' },

    // Safari schedules
    { route_name: 'Arusha to Serengeti', date: '2026-05-15', startTime: '06:00', endTime: '18:00', availableSeats: 7, status: 'active' },
    { route_name: 'Arusha to Ngorongoro', date: '2026-05-16', startTime: '07:00', endTime: '14:00', availableSeats: 8, status: 'active' },

    // Train schedules
    { route_name: 'Dar es Salaam to Kigoma', date: '2026-05-10', startTime: '18:00', endTime: '08:00', availableSeats: 200, status: 'active' },
    { route_name: 'Nairobi to Mombasa', date: '2026-05-11', startTime: '08:00', endTime: '13:00', availableSeats: 280, status: 'active' },

    // Flight schedules
    { route_name: 'Dar es Salaam to Kilimanjaro', date: '2026-05-12', startTime: '10:00', endTime: '11:30', availableSeats: 120, status: 'active' },
    { route_name: 'Dar es Salaam to Zanzibar', date: '2026-05-13', startTime: '14:00', endTime: '14:30', availableSeats: 48, status: 'active' },
    { route_name: 'Arusha to Serengeti', date: '2026-05-14', startTime: '07:00', endTime: '08:30', availableSeats: 12, status: 'active' },

    // Ferry schedules
    { route_name: 'Dar es Salaam to Zanzibar', date: '2026-05-10', startTime: '09:00', endTime: '11:30', availableSeats: 150, status: 'active' },
    { route_name: 'Dar es Salaam to Zanzibar', date: '2026-05-10', startTime: '15:00', endTime: '17:30', availableSeats: 150, status: 'active' },
    { route_name: 'Dar es Salaam to Pemba', date: '2026-05-11', startTime: '08:00', endTime: '13:00', availableSeats: 200, status: 'active' },

    // Ship/Boat schedules
    { route_name: 'Mwanza to Bukoba', date: '2026-05-12', startTime: '20:00', endTime: '08:00', availableSeats: 400, status: 'active' },
    { route_name: 'Zanzibar to Prison Island', date: '2026-05-13', startTime: '11:00', endTime: '13:00', availableSeats: 30, status: 'active' }
  ];

  for (const schedule of transportSchedules) {
    const route = routes.find((item) => item.name === schedule.route_name);
    if (!route) continue;

    const [timetable] = await Timetable.findOrCreate({
      where: {
        route_id: route.id,
        transport_id: route.transport_id,
        date: schedule.date,
        departure_time: schedule.startTime
      },
      defaults: {
        route_id: route.id,
        transport_id: route.transport_id,
        activity_id: null,
        facility_id: null,
        date: schedule.date,
        departure_time: schedule.startTime,
        arrival_time: schedule.endTime,
        available_seats: schedule.availableSeats,
        effective_from: schedule.date,
        status: schedule.status
      }
    });

    timetables.push(timetable);
  }

  // Activity schedules - Movies
  const activitySchedules = [
    { activity_slug: 'avengers-endgame', date: '2026-05-08', startTime: '18:00', endTime: '20:30', availableSeats: 140, status: 'active' },
    { activity_slug: 'avengers-endgame', date: '2026-05-08', startTime: '21:00', endTime: '23:30', availableSeats: 150, status: 'active' },
    { activity_slug: 'the-lion-king', date: '2026-05-09', startTime: '14:00', endTime: '16:00', availableSeats: 120, status: 'active' },
    { activity_slug: 'dune-part-two', date: '2026-05-11', startTime: '19:30', endTime: '22:20', availableSeats: 200, status: 'active' },
    { activity_slug: 'oppenheimer', date: '2026-05-12', startTime: '20:00', endTime: '23:00', availableSeats: 80, status: 'active' },

    // Sports events
    { activity_slug: 'simba-vs-yanga', date: '2026-05-12', startTime: '16:00', endTime: '18:00', availableSeats: 4850, status: 'sold_out' },
    { activity_slug: 'tanzania-vs-kenya', date: '2026-05-15', startTime: '15:00', endTime: '17:00', availableSeats: 58000, status: 'active' },
    { activity_slug: 'azam-vs-kmc', date: '2026-05-16', startTime: '17:00', endTime: '19:00', availableSeats: 18000, status: 'active' },

    // Conferences & Concerts
    { activity_slug: 'east-africa-tech-summit', date: '2026-05-18', startTime: '08:00', endTime: '18:00', availableSeats: 450, status: 'active' },
    { activity_slug: 'afrobeats-live-concert', date: '2026-05-25', startTime: '19:00', endTime: '23:00', availableSeats: 1800, status: 'active' },
    { activity_slug: 'diamond-platnumz-concert', date: '2026-05-28', startTime: '20:00', endTime: '23:00', availableSeats: 0, status: 'sold_out' },

    // Safari & Outdoor
    { activity_slug: 'ngorongoro-crater-full-day-tour', date: '2026-05-10', startTime: '06:00', endTime: '18:00', availableSeats: 45, status: 'active' },
    { activity_slug: 'saadani-beach-bush-safari', date: '2026-05-17', startTime: '07:00', endTime: '17:00', availableSeats: 35, status: 'active' },
    { activity_slug: 'serengeti-migration-3-day-tour', date: '2026-05-22', startTime: '06:00', endTime: '18:00', availableSeats: 30, status: 'active' }
  ];

  // Get all activities for lookup
  const activities = await Activity.findAll();

  for (const schedule of activitySchedules) {
    const activity = activities.find((item) => item.slug === schedule.activity_slug);
    if (!activity) continue;

    const [timetable] = await Timetable.findOrCreate({
      where: {
        activity_id: activity.id,
        facility_id: activity.facility_id,
        date: schedule.date,
        departure_time: schedule.startTime
      },
      defaults: {
        route_id: null,
        transport_id: null,
        activity_id: activity.id,
        facility_id: activity.facility_id,
        date: schedule.date,
        departure_time: schedule.startTime,
        arrival_time: schedule.endTime,
        available_seats: schedule.availableSeats,
        effective_from: schedule.date,
        status: schedule.status
      }
    });

    timetables.push(timetable);
  }

  return timetables;
};

const seedJourneys = async (timetables) => {
  const journeys = [];

  for (const timetable of timetables) {
    const journeyDate = new Date(timetable.effective_from);
    const departureAt = new Date(`${journeyDate.toISOString().slice(0, 10)}T${timetable.departure_time}:00Z`);
    const arrivalAt = new Date(`${journeyDate.toISOString().slice(0, 10)}T${timetable.arrival_time}:00Z`);

    const [journey] = await Journey.findOrCreate({
      where: {
        timetable_id: timetable.id,
        journey_date: journeyDate
      },
      defaults: {
        timetable_id: timetable.id,
        transport_id: timetable.transport_id,
        route_id: timetable.route_id,
        journey_date: journeyDate,
        departure_at: departureAt,
        arrival_at: arrivalAt,
        available_seats: 50,
        booked_seats: 0,
        held_seats: 0,
        status: 'scheduled'
      }
    });

    journeys.push(journey);
  }

  return journeys;
};

const seedFacilities = async (companies) => {
  const facilities = [
    // Entertainment - Cinemas
    {
      company_slug: 'dar-es-salaam-cinemas',
      facility_type_slug: 'movie_theatre',
      name: 'Cinema Hall 1',
      slug: 'cinema-hall-1',
      description: 'Premium cinema with Dolby sound and reclining seats',
      category: 'entertainment',
      location: { address: 'Kariakoo Road', city: 'Dar es Salaam', country: 'Tanzania' },
      capacity: 150,
      base_price: 12000,
      status: 'active'
    },
    {
      company_slug: 'dar-es-salaam-cinemas',
      facility_type_slug: 'movie_theatre',
      name: 'Cinema Hall 2',
      slug: 'cinema-hall-2',
      description: 'Comfort cinema with VIP seating',
      category: 'entertainment',
      location: { address: 'Mwananyamala', city: 'Dar es Salaam', country: 'Tanzania' },
      capacity: 120,
      base_price: 10000,
      status: 'active'
    },
    {
      company_slug: 'cinemax-cinemas',
      facility_type_slug: 'movie_theatre',
      name: 'Cinemax IMAX',
      slug: 'cinemax-imax',
      description: 'Luxury IMAX cinema experience',
      category: 'entertainment',
      location: { address: 'CBD', city: 'Dar es Salaam', country: 'Tanzania' },
      capacity: 200,
      base_price: 15000,
      status: 'active'
    },
    {
      company_slug: 'cinemax-cinemas',
      facility_type_slug: 'movie_theatre',
      name: 'Cinemax Premium',
      slug: 'cinemax-premium',
      description: 'Premium cinema hall',
      category: 'entertainment',
      location: { address: 'CBD', city: 'Dar es Salaam', country: 'Tanzania' },
      capacity: 80,
      base_price: 13000,
      status: 'active'
    },
    {
      company_slug: 'mlimani-city-cinemas',
      facility_type_slug: 'movie_theatre',
      name: 'Mlimani Screen 1',
      slug: 'mlimani-screen-1',
      description: 'Modern cinema in shopping mall',
      category: 'entertainment',
      location: { address: 'Mlimani City', city: 'Dar es Salaam', country: 'Tanzania' },
      capacity: 100,
      base_price: 11000,
      status: 'active'
    },
    {
      company_slug: 'mlimani-city-cinemas',
      facility_type_slug: 'movie_theatre',
      name: 'Mlimani Screen 2',
      slug: 'mlimani-screen-2',
      description: 'Second screen in Mlimani City',
      category: 'entertainment',
      location: { address: 'Mlimani City', city: 'Dar es Salaam', country: 'Tanzania' },
      capacity: 90,
      base_price: 10000,
      status: 'active'
    },

    // Sports - Stadiums
    {
      company_slug: 'national-stadium',
      facility_type_slug: 'stadium',
      name: 'Main Arena',
      slug: 'main-arena',
      description: 'Premier sports venue for major events',
      category: 'sports',
      location: { address: 'Uhuru Road', city: 'Dar es Salaam', country: 'Tanzania' },
      capacity: 5000,
      base_price: 20000,
      status: 'active'
    },
    {
      company_slug: 'benjamin-mkapa-stadium',
      facility_type_slug: 'stadium',
      name: 'Benjamin Mkapa Field',
      slug: 'benjamin-mkapa-field',
      description: 'National stadium for international matches',
      category: 'sports',
      location: { address: 'Benjamin Mkapa Road', city: 'Dar es Salaam', country: 'Tanzania' },
      capacity: 60000,
      base_price: 25000,
      status: 'active'
    },
    {
      company_slug: 'uhuru-stadium',
      facility_type_slug: 'stadium',
      name: 'Uhuru Ground',
      slug: 'uhuru-ground',
      description: 'Historic sports venue',
      category: 'sports',
      location: { address: 'Uhuru Road', city: 'Dar es Salaam', country: 'Tanzania' },
      capacity: 20000,
      base_price: 15000,
      status: 'active'
    },
    {
      company_slug: 'benjamin-mkapa-stadium',
      facility_type_slug: 'arena',
      name: 'Sports Complex Indoor',
      slug: 'sports-complex-indoor',
      description: 'Indoor sports complex',
      category: 'sports',
      location: { address: 'Benjamin Mkapa Road', city: 'Dar es Salaam', country: 'Tanzania' },
      capacity: 3000,
      base_price: 18000,
      status: 'active'
    },
    {
      company_slug: 'uhuru-stadium',
      facility_type_slug: 'court',
      name: 'Basketball Court',
      slug: 'basketball-court',
      description: 'Dedicated basketball court',
      category: 'sports',
      location: { address: 'Uhuru Road', city: 'Dar es Salaam', country: 'Tanzania' },
      capacity: 500,
      base_price: 10000,
      status: 'active'
    },

    // Events - Conference & Concert Halls
    {
      company_slug: 'conference-center-arusha',
      facility_type_slug: 'conference_hall',
      name: 'Grand Conference Hall',
      slug: 'grand-conference-hall',
      description: 'Large event hall for conferences and seminars',
      category: 'events',
      location: { address: 'Njiro Road', city: 'Arusha', country: 'Tanzania' },
      capacity: 500,
      base_price: 50000,
      status: 'active'
    },
    {
      company_slug: 'arusha-conference-centre',
      facility_type_slug: 'conference_hall',
      name: 'Arusha Summit Hall',
      slug: 'arusha-summit-hall',
      description: 'International conference facility',
      category: 'events',
      location: { address: 'Arusha CBD', city: 'Arusha', country: 'Tanzania' },
      capacity: 800,
      base_price: 75000,
      status: 'active'
    },
    {
      company_slug: 'arusha-conference-centre',
      facility_type_slug: 'meeting_room',
      name: 'Business Meeting Room',
      slug: 'business-meeting-room',
      description: 'Executive meeting room',
      category: 'events',
      location: { address: 'Arusha CBD', city: 'Arusha', country: 'Tanzania' },
      capacity: 100,
      base_price: 20000,
      status: 'active'
    },
    {
      company_slug: 'cinemax-cinemas',
      facility_type_slug: 'concert_hall',
      name: 'Concert Arena',
      slug: 'concert-arena',
      description: 'Live music and concert venue',
      category: 'events',
      location: { address: 'CBD', city: 'Dar es Salaam', country: 'Tanzania' },
      capacity: 2000,
      base_price: 35000,
      status: 'active'
    },
    {
      company_slug: 'cinemax-cinemas',
      facility_type_slug: 'exhibition_hall',
      name: 'Exhibition Center',
      slug: 'exhibition-center',
      description: 'Art and culture exhibitions',
      category: 'events',
      location: { address: 'CBD', city: 'Dar es Salaam', country: 'Tanzania' },
      capacity: 1000,
      base_price: 15000,
      status: 'active'
    },

    // Outdoor - Safari & Nature
    {
      company_slug: 'ngorongoro-adventures',
      facility_type_slug: 'safari_park',
      name: 'Ngorongoro Crater Tour',
      slug: 'ngorongoro-crater-tour',
      description: 'Wildlife safari experience',
      category: 'outdoor',
      location: { address: 'Ngorongoro', city: 'Arusha', country: 'Tanzania' },
      capacity: 50,
      base_price: 200000,
      status: 'active'
    },
    {
      company_slug: 'mount-meru-tours',
      facility_type_slug: 'mountain',
      name: 'Mount Meru Summit Trek',
      slug: 'mount-meru-summit-trek',
      description: 'Guided mountain expedition',
      category: 'outdoor',
      location: { address: 'Mount Meru', city: 'Arusha', country: 'Tanzania' },
      capacity: 30,
      base_price: 480000,
      status: 'active'
    },
    {
      company_slug: 'saadani-safari-park',
      facility_type_slug: 'safari_park',
      name: 'Saadani Beach Safari',
      slug: 'saadani-beach-safari',
      description: 'Coastal wildlife adventure',
      category: 'outdoor',
      location: { address: 'Saadani', city: 'Tanga', country: 'Tanzania' },
      capacity: 40,
      base_price: 150000,
      status: 'active'
    },
    {
      company_slug: 'mount-meru-tours',
      facility_type_slug: 'mountain',
      name: 'Kilimanjaro Marangu Route',
      slug: 'kilimanjaro-marangu-route',
      description: 'Summit Africa\'s highest peak',
      category: 'outdoor',
      location: { address: 'Kilimanjaro', city: 'Moshi', country: 'Tanzania' },
      capacity: 60,
      base_price: 960000,
      status: 'active'
    },
    {
      company_slug: 'ngorongoro-adventures',
      facility_type_slug: 'safari_park',
      name: 'Serengeti Migration Tour',
      slug: 'serengeti-migration-tour',
      description: 'Witness the great migration',
      category: 'outdoor',
      location: { address: 'Serengeti', city: 'Mara', country: 'Tanzania' },
      capacity: 35,
      base_price: 450000,
      status: 'active'
    },
    {
      company_slug: 'saadani-safari-park',
      facility_type_slug: 'safari_park',
      name: 'Selous Game Reserve',
      slug: 'selous-game-reserve',
      description: 'River wildlife exploration',
      category: 'outdoor',
      location: { address: 'Selous', city: 'Morogoro', country: 'Tanzania' },
      capacity: 25,
      base_price: 180000,
      status: 'active'
    },

    // Housing - Hotels & Lodges
    {
      company_slug: 'serengeti-lodge-spa',
      facility_type_slug: 'lodge',
      name: 'Serengeti Luxury Lodge',
      slug: 'serengeti-luxury-lodge',
      description: 'Luxury safari lodge near the national park',
      category: 'housing',
      location: { address: 'Serengeti Road', city: 'Serengeti', country: 'Tanzania' },
      capacity: 40,
      base_price: 350000,
      status: 'active'
    },
    {
      company_slug: 'zanzibar-beach-resort',
      facility_type_slug: 'resort',
      name: 'Zanzibar Beach Bungalows',
      slug: 'zanzibar-beach-bungalows',
      description: 'Beachfront accommodation',
      category: 'housing',
      location: { address: 'Nungwi', city: 'Zanzibar', country: 'Tanzania' },
      capacity: 60,
      base_price: 480000,
      status: 'active'
    },
    {
      company_slug: 'kilimanjaro-hotel',
      facility_type_slug: 'hotel',
      name: 'Kilimanjaro Suites',
      slug: 'kilimanjaro-suites',
      description: 'Premium city hotel',
      category: 'housing',
      location: { address: 'CBD', city: 'Arusha', country: 'Tanzania' },
      capacity: 100,
      base_price: 150000,
      status: 'active'
    },
    {
      company_slug: 'serengeti-lodge-spa',
      facility_type_slug: 'camp',
      name: 'Ngorongoro Crater Camp',
      slug: 'ngorongoro-crater-camp',
      description: 'Eco-camping experience',
      category: 'housing',
      location: { address: 'Ngorongoro', city: 'Arusha', country: 'Tanzania' },
      capacity: 20,
      base_price: 120000,
      status: 'active'
    },
    {
      company_slug: 'zanzibar-beach-resort',
      facility_type_slug: 'hotel',
      name: 'Stone Town Hotel',
      slug: 'stone-town-hotel',
      description: 'Cultural immersion hotel',
      category: 'housing',
      location: { address: 'Stone Town', city: 'Zanzibar', country: 'Tanzania' },
      capacity: 50,
      base_price: 180000,
      status: 'active'
    },
    {
      company_slug: 'kilimanjaro-hotel',
      facility_type_slug: 'hotel',
      name: 'Dar es Salaam Grand',
      slug: 'dar-es-salaam-grand',
      description: 'Luxury city accommodation',
      category: 'housing',
      location: { address: 'CBD', city: 'Dar es Salaam', country: 'Tanzania' },
      capacity: 150,
      base_price: 420000,
      status: 'active'
    }
  ];

  const facilityLayouts = {
    'cinema-hall-1': { sittingPlan: '3-3', sittingLength: 25 },
    'cinema-hall-2': { sittingPlan: '4-4', sittingLength: 15 },
    'cinemax-imax': { sittingPlan: '5-5', sittingLength: 20 },
    'cinemax-premium': { sittingPlan: '2-2', sittingLength: 20 },
    'mlimani-screen-1': { sittingPlan: '3-3', sittingLength: 17 },
    'mlimani-screen-2': { sittingPlan: '3-3', sittingLength: 15 },
    'main-arena': { sittingPlan: '10-10', sittingLength: 25 },
    'benjamin-mkapa-field': { sittingPlan: '15-15', sittingLength: 100 },
    'uhuru-ground': { sittingPlan: '12-12', sittingLength: 50 },
    'sports-complex-indoor': { sittingPlan: '8-8', sittingLength: 30 },
    'basketball-court': { sittingPlan: '5-5', sittingLength: 10 },
    'grand-conference-hall': { sittingPlan: '5-5', sittingLength: 50 },
    'arusha-summit-hall': { sittingPlan: '8-8', sittingLength: 50 },
    'business-meeting-room': { sittingPlan: '5-5', sittingLength: 10 },
    'concert-arena': { sittingPlan: '10-10', sittingLength: 50 },
    'exhibition-center': { sittingPlan: 'open', sittingLength: 0 },
    'ngorongoro-crater-tour': { sittingPlan: 'safari_vehicle', sittingLength: 0 },
    'mount-meru-summit-trek': { sittingPlan: 'hiking_group', sittingLength: 0 },
    'saadani-beach-safari': { sittingPlan: 'safari_vehicle', sittingLength: 0 },
    'kilimanjaro-marangu-route': { sittingPlan: 'hiking_group', sittingLength: 0 },
    'serengeti-migration-tour': { sittingPlan: 'safari_vehicle', sittingLength: 0 },
    'selous-game-reserve': { sittingPlan: 'safari_vehicle', sittingLength: 0 },
    'serengeti-luxury-lodge': { sittingPlan: 'rooms', sittingLength: 0 },
    'zanzibar-beach-bungalows': { sittingPlan: 'rooms', sittingLength: 0 },
    'kilimanjaro-suites': { sittingPlan: 'rooms', sittingLength: 0 },
    'ngorongoro-crater-camp': { sittingPlan: 'tents', sittingLength: 0 },
    'stone-town-hotel': { sittingPlan: 'rooms', sittingLength: 0 },
    'dar-es-salaam-grand': { sittingPlan: 'rooms', sittingLength: 0 }
  };

  const seededFacilities = [];
  for (const data of facilities) {
    const company = await Company.findOne({ where: { slug: data.company_slug } });
    const facilityType = await FacilityType.findOne({ where: { slug: data.facility_type_slug } });
    const layout = facilityLayouts[data.slug] || { sittingPlan: null, sittingLength: 0 };
    const [facility, created] = await Facility.findOrCreate({
      where: { slug: data.slug },
      defaults: {
        company_id: company.id,
        facility_type_id: facilityType.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        category: data.category,
        location: data.location,
        capacity: data.capacity,
        base_price: data.base_price,
        sittingPlan: layout.sittingPlan,
        sittingLength: layout.sittingLength,
        status: data.status
      }
    });

    if (!created) {
      const updateData = {};
      if (layout.sittingPlan && facility.sittingPlan !== layout.sittingPlan) {
        updateData.sittingPlan = layout.sittingPlan;
      }
      if (layout.sittingLength && facility.sittingLength !== layout.sittingLength) {
        updateData.sittingLength = layout.sittingLength;
      }
      if (Object.keys(updateData).length) {
        await facility.update(updateData);
      }
    }

    seededFacilities.push(facility);
  }

  return seededFacilities;
};

const seedActivities = async (facilities) => {
  const activityDefinitions = [
    // Entertainment - Movies
    {
      facility_slug: 'cinema-hall-1',
      name: 'Avengers: Endgame',
      slug: 'avengers-endgame',
      description: 'Marvel superhero blockbuster screening',
      activity_type: 'session',
      duration_minutes: 150,
      max_participants: 150,
      base_price: 12000,
      category: 'action',
      age_restriction: 'PG-13',
      language: 'English',
      date: '2026-05-08',
      genre: 'Action',
      status: 'active'
    },
    {
      facility_slug: 'cinema-hall-1',
      name: 'Spider-Man: No Way Home',
      slug: 'spider-man-no-way-home',
      description: 'Action-packed superhero adventure',
      activity_type: 'session',
      duration_minutes: 148,
      max_participants: 150,
      base_price: 12000,
      category: 'action',
      age_restriction: 'PG-13',
      language: 'English',
      date: '2026-05-10',
      genre: 'Action',
      status: 'sold_out'
    },
    {
      facility_slug: 'cinema-hall-2',
      name: 'The Lion King',
      slug: 'the-lion-king',
      description: 'Disney animated classic',
      activity_type: 'session',
      duration_minutes: 118,
      max_participants: 120,
      base_price: 10000,
      category: 'family',
      age_restriction: 'G',
      language: 'English',
      date: '2026-05-09',
      genre: 'Animation',
      status: 'active'
    },
    {
      facility_slug: 'cinemax-imax',
      name: 'Dune: Part Two',
      slug: 'dune-part-two',
      description: 'Epic sci-fi adventure',
      activity_type: 'session',
      duration_minutes: 166,
      max_participants: 200,
      base_price: 15000,
      category: 'sci-fi',
      age_restriction: 'PG-13',
      language: 'English',
      date: '2026-05-11',
      genre: 'Sci-Fi',
      status: 'active'
    },
    {
      facility_slug: 'cinemax-premium',
      name: 'Oppenheimer',
      slug: 'oppenheimer',
      description: 'Historical drama',
      activity_type: 'session',
      duration_minutes: 180,
      max_participants: 80,
      base_price: 13000,
      category: 'drama',
      age_restriction: 'PG-13',
      language: 'English',
      date: '2026-05-12',
      genre: 'Drama',
      status: 'active'
    },
    {
      facility_slug: 'mlimani-screen-1',
      name: 'Fast X',
      slug: 'fast-x',
      description: 'High-octane action thriller',
      activity_type: 'session',
      duration_minutes: 141,
      max_participants: 100,
      base_price: 11000,
      category: 'action',
      age_restriction: 'PG-13',
      language: 'English',
      date: '2026-05-13',
      genre: 'Action',
      status: 'active'
    },
    {
      facility_slug: 'mlimani-screen-2',
      name: 'Barbie',
      slug: 'barbie',
      description: 'Fantasy comedy adventure',
      activity_type: 'session',
      duration_minutes: 114,
      max_participants: 90,
      base_price: 10000,
      category: 'comedy',
      age_restriction: 'PG',
      language: 'English',
      date: '2026-05-14',
      genre: 'Comedy',
      status: 'active'
    },

    // Sports - Matches & Events
    {
      facility_slug: 'main-arena',
      name: 'Simba SC vs Young Africans',
      slug: 'simba-vs-yanga',
      description: 'Premier league football match',
      activity_type: 'event',
      duration_minutes: 120,
      max_participants: 5000,
      base_price: 20000,
      category: 'sports',
      age_restriction: 'All Ages',
      language: 'Swahili',
      date: '2026-05-12',
      genre: 'Sports',
      status: 'active'
    },
    {
      facility_slug: 'benjamin-mkapa-field',
      name: 'Tanzania vs Kenya - Friendly',
      slug: 'tanzania-vs-kenya',
      description: 'International football friendly',
      activity_type: 'event',
      duration_minutes: 120,
      max_participants: 60000,
      base_price: 25000,
      category: 'sports',
      age_restriction: 'All Ages',
      language: 'English',
      date: '2026-05-15',
      genre: 'Sports',
      status: 'active'
    },
    {
      facility_slug: 'uhuru-ground',
      name: 'Azam FC vs KMC',
      slug: 'azam-vs-kmc',
      description: 'League championship match',
      activity_type: 'event',
      duration_minutes: 120,
      max_participants: 20000,
      base_price: 15000,
      category: 'sports',
      age_restriction: 'All Ages',
      language: 'Swahili',
      date: '2026-05-16',
      genre: 'Sports',
      status: 'active'
    },
    {
      facility_slug: 'sports-complex-indoor',
      name: 'East Africa Basketball Finals',
      slug: 'east-africa-basketball-finals',
      description: 'Regional basketball championship',
      activity_type: 'event',
      duration_minutes: 180,
      max_participants: 3000,
      base_price: 18000,
      category: 'sports',
      age_restriction: 'All Ages',
      language: 'English',
      date: '2026-05-18',
      genre: 'Sports',
      status: 'active'
    },
    {
      facility_slug: 'basketball-court',
      name: 'Volleyball Championship',
      slug: 'volleyball-championship',
      description: 'National volleyball tournament',
      activity_type: 'event',
      duration_minutes: 240,
      max_participants: 500,
      base_price: 10000,
      category: 'sports',
      age_restriction: 'All Ages',
      language: 'Swahili',
      date: '2026-05-19',
      genre: 'Sports',
      status: 'active'
    },

    // Events - Conferences & Concerts
    {
      facility_slug: 'grand-conference-hall',
      name: 'East Africa Tech Summit',
      slug: 'east-africa-tech-summit',
      description: 'Annual technology conference',
      activity_type: 'event',
      duration_minutes: 1440,
      max_participants: 500,
      base_price: 50000,
      category: 'conference',
      age_restriction: '18+',
      language: 'English',
      date: '2026-05-18',
      genre: 'Conference',
      status: 'active'
    },
    {
      facility_slug: 'arusha-summit-hall',
      name: 'Business Leaders Forum',
      slug: 'business-leaders-forum',
      description: 'Executive networking event',
      activity_type: 'event',
      duration_minutes: 1440,
      max_participants: 800,
      base_price: 75000,
      category: 'conference',
      age_restriction: '18+',
      language: 'English',
      date: '2026-05-20',
      genre: 'Conference',
      status: 'active'
    },
    {
      facility_slug: 'business-meeting-room',
      name: 'Startup Pitch Competition',
      slug: 'startup-pitch-competition',
      description: 'Entrepreneurship showcase',
      activity_type: 'event',
      duration_minutes: 480,
      max_participants: 100,
      base_price: 20000,
      category: 'workshop',
      age_restriction: '18+',
      language: 'English',
      date: '2026-05-22',
      genre: 'Workshop',
      status: 'active'
    },
    {
      facility_slug: 'concert-arena',
      name: 'Afrobeats Live Concert',
      slug: 'afrobeats-live-concert',
      description: 'Live music performance',
      activity_type: 'event',
      duration_minutes: 240,
      max_participants: 2000,
      base_price: 35000,
      category: 'concert',
      age_restriction: '16+',
      language: 'English',
      date: '2026-05-25',
      genre: 'Concert',
      status: 'active'
    },
    {
      facility_slug: 'concert-arena',
      name: 'Diamond Platnumz Concert',
      slug: 'diamond-platnumz-concert',
      description: 'Bongo Flava superstar live',
      activity_type: 'event',
      duration_minutes: 180,
      max_participants: 2000,
      base_price: 40000,
      category: 'concert',
      age_restriction: 'All Ages',
      language: 'Swahili',
      date: '2026-05-28',
      genre: 'Concert',
      status: 'sold_out'
    },
    {
      facility_slug: 'exhibition-center',
      name: 'Art & Culture Exhibition',
      slug: 'art-culture-exhibition',
      description: 'Contemporary African art showcase',
      activity_type: 'programme',
      duration_minutes: 10080,
      max_participants: 1000,
      base_price: 15000,
      category: 'cultural',
      age_restriction: 'All Ages',
      language: 'English',
      date: '2026-06-01',
      genre: 'Cultural',
      status: 'active'
    },

    // Outdoor - Safari & Trekking
    {
      facility_slug: 'ngorongoro-crater-tour',
      name: 'Ngorongoro Crater Full Day Tour',
      slug: 'ngorongoro-crater-full-day-tour',
      description: 'Wildlife safari experience',
      activity_type: 'programme',
      duration_minutes: 480,
      max_participants: 50,
      base_price: 200000,
      category: 'safari',
      age_restriction: 'All Ages',
      language: 'English',
      date: '2026-05-10',
      genre: 'Safari',
      status: 'active'
    },
    {
      facility_slug: 'mount-meru-summit-trek',
      name: 'Mount Meru 4-Day Trek',
      slug: 'mount-meru-4-day-trek',
      description: 'Guided mountain expedition',
      activity_type: 'programme',
      duration_minutes: 5760,
      max_participants: 30,
      base_price: 480000,
      category: 'safari',
      age_restriction: '16+',
      language: 'English',
      date: '2026-05-15',
      genre: 'Safari',
      status: 'active'
    },
    {
      facility_slug: 'saadani-beach-safari',
      name: 'Saadani Beach & Bush Safari',
      slug: 'saadani-beach-bush-safari',
      description: 'Coastal wildlife adventure',
      activity_type: 'programme',
      duration_minutes: 1440,
      max_participants: 40,
      base_price: 150000,
      category: 'safari',
      age_restriction: 'All Ages',
      language: 'English',
      date: '2026-05-17',
      genre: 'Safari',
      status: 'active'
    },
    {
      facility_slug: 'kilimanjaro-marangu-route',
      name: 'Kilimanjaro Marangu Route 6-Day',
      slug: 'kilimanjaro-marangu-route-6-day',
      description: 'Summit Africa\'s highest peak',
      activity_type: 'programme',
      duration_minutes: 8640,
      max_participants: 60,
      base_price: 960000,
      category: 'safari',
      age_restriction: '18+',
      language: 'English',
      date: '2026-05-20',
      genre: 'Safari',
      status: 'active'
    },
    {
      facility_slug: 'serengeti-migration-tour',
      name: 'Serengeti Migration 3-Day Tour',
      slug: 'serengeti-migration-3-day-tour',
      description: 'Witness the great migration',
      activity_type: 'programme',
      duration_minutes: 4320,
      max_participants: 35,
      base_price: 450000,
      category: 'safari',
      age_restriction: 'All Ages',
      language: 'English',
      date: '2026-05-22',
      genre: 'Safari',
      status: 'active'
    },
    {
      facility_slug: 'selous-game-reserve',
      name: 'Selous Boat Safari',
      slug: 'selous-boat-safari',
      description: 'River wildlife exploration',
      activity_type: 'programme',
      duration_minutes: 1440,
      max_participants: 25,
      base_price: 180000,
      category: 'safari',
      age_restriction: 'All Ages',
      language: 'English',
      date: '2026-05-25',
      genre: 'Safari',
      status: 'active'
    },

    // Housing - Hotel Stays
    {
      facility_slug: 'serengeti-luxury-lodge',
      name: 'Luxury Lodge Weekend Package',
      slug: 'luxury-lodge-weekend-package',
      description: 'Premium safari accommodation',
      activity_type: 'programme',
      duration_minutes: 2880,
      max_participants: 40,
      base_price: 350000,
      category: 'safari',
      age_restriction: 'All Ages',
      language: 'English',
      date: '2026-05-15',
      genre: 'Safari',
      status: 'active'
    },
    {
      facility_slug: 'zanzibar-beach-bungalows',
      name: 'Beach Resort 5-Night Stay',
      slug: 'beach-resort-5-night-stay',
      description: 'All-inclusive beachfront holiday',
      activity_type: 'programme',
      duration_minutes: 7200,
      max_participants: 60,
      base_price: 480000,
      category: 'safari',
      age_restriction: 'All Ages',
      language: 'English',
      date: '2026-05-18',
      genre: 'Safari',
      status: 'active'
    },
    {
      facility_slug: 'kilimanjaro-suites',
      name: 'City Hotel Business Package',
      slug: 'city-hotel-business-package',
      description: 'Executive accommodation',
      activity_type: 'programme',
      duration_minutes: 4320,
      max_participants: 100,
      base_price: 150000,
      category: 'conference',
      age_restriction: 'All Ages',
      language: 'English',
      date: '2026-05-20',
      genre: 'Conference',
      status: 'active'
    },
    {
      facility_slug: 'ngorongoro-crater-camp',
      name: 'Crater Camp Adventure',
      slug: 'crater-camp-adventure',
      description: 'Eco-camping experience',
      activity_type: 'programme',
      duration_minutes: 2880,
      max_participants: 20,
      base_price: 120000,
      category: 'safari',
      age_restriction: '16+',
      language: 'English',
      date: '2026-05-22',
      genre: 'Safari',
      status: 'active'
    },
    {
      facility_slug: 'stone-town-hotel',
      name: 'Stone Town Heritage Stay',
      slug: 'stone-town-heritage-stay',
      description: 'Cultural immersion hotel',
      activity_type: 'programme',
      duration_minutes: 4320,
      max_participants: 50,
      base_price: 180000,
      category: 'cultural',
      age_restriction: 'All Ages',
      language: 'English',
      date: '2026-05-24',
      genre: 'Cultural',
      status: 'active'
    },
    {
      facility_slug: 'dar-es-salaam-grand',
      name: 'Grand Hotel Week Special',
      slug: 'grand-hotel-week-special',
      description: 'Luxury city accommodation',
      activity_type: 'programme',
      duration_minutes: 10080,
      max_participants: 150,
      base_price: 420000,
      category: 'conference',
      age_restriction: 'All Ages',
      language: 'English',
      date: '2026-06-01',
      genre: 'Conference',
      status: 'active'
    }
  ];

  const seededActivities = [];
  for (const data of activityDefinitions) {
    const facility = facilities.find((item) => item.slug === data.facility_slug);
    if (!facility) continue;
    const [activity] = await Activity.findOrCreate({
      where: { slug: data.slug },
      defaults: {
        facility_id: facility.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        activity_type: data.activity_type,
        duration_minutes: data.duration_minutes,
        max_participants: data.max_participants,
        base_price: data.base_price,
        category: data.category,
        age_restriction: data.age_restriction,
        language: data.language,
        date: data.date,
        genre: data.genre,
        status: data.status
      }
    });
    seededActivities.push(activity);
  }

  return seededActivities;
};

const seedActivityInstances = async (activities) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const instances = [];

  for (const activity of activities) {
    const startAt = new Date(tomorrow.getTime() + activities.indexOf(activity) * 24 * 60 * 60 * 1000);
    const endAt = new Date(startAt.getTime() + activity.duration_minutes * 60 * 1000);

    const [instance] = await ActivityInstance.findOrCreate({
      where: {
        activity_id: activity.id,
        start_at: startAt,
        end_at: endAt
      },
      defaults: {
        activity_id: activity.id,
        facility_id: activity.facility_id,
        start_at: startAt,
        end_at: endAt,
        total_slots: activity.max_participants,
        available_slots: activity.max_participants,
        price_modifier: 1.0,
        special_notes: 'Standard session',
        status: 'scheduled'
      }
    });
    instances.push(instance);
  }

  return instances;
};

const seedBookings = async (customers, routes, activities, currency) => {
  const journey = await Journey.findOne({ where: { route_id: routes[0].id } });
  const activityInstance = await ActivityInstance.findOne({ where: { activity_id: activities[0].id } });
  const customer = customers[0];

  if (!journey || !activityInstance || !customer) {
    console.warn('⚠️ Skipping sample bookings because required seeded entities are missing');
    return;
  }

  const [bookingTransport] = await Booking.findOrCreate({
    where: { booking_code: 'BK-TRANSPORT-001' },
    defaults: {
      booking_code: 'BK-TRANSPORT-001',
      user_id: customer.id,
      booking_type: 'transport',
      journey_id: journey.id,
      status: 'confirmed',
      total_amount: 60000,
      currency_id: currency.id,
      exchange_rate_snapshot: 1.0,
      passenger_count: 2,
      contact_name: `${customer.first_name} ${customer.last_name}`,
      contact_phone: customer.phone,
      contact_email: customer.email,
      confirmed_at: new Date()
    }
  });

  await BookingItem.findOrCreate({
    where: { booking_id: bookingTransport.id, item_code: 'A1' },
    defaults: {
      booking_id: bookingTransport.id,
      item_type: 'seat',
      item_code: 'A1',
      passenger_name: `${customer.first_name} ${customer.last_name}`,
      passenger_type: 'adult',
      unit_price: 30000
    }
  });

  await BookingItem.findOrCreate({
    where: { booking_id: bookingTransport.id, item_code: 'A2' },
    defaults: {
      booking_id: bookingTransport.id,
      item_type: 'seat',
      item_code: 'A2',
      passenger_name: `${customer.first_name} ${customer.last_name}`,
      passenger_type: 'adult',
      unit_price: 30000
    }
  });

  await Payment.findOrCreate({
    where: { transaction_reference: 'PAY-TRANSPORT-001' },
    defaults: {
      booking_id: bookingTransport.id,
      transaction_reference: 'PAY-TRANSPORT-001',
      method: 'mpesa',
      provider: 'mpesa',
      amount: 60000,
      currency_id: currency.id,
      exchange_rate_snapshot: 1.0,
      response_json: { stub: true },
      status: 'completed',
      paid_at: new Date()
    }
  });

  // Create seat holds for the transport booking
  await SeatHold.findOrCreate({
    where: { journey_id: journey.id, seat_code: 'A1' },
    defaults: {
      journey_id: journey.id,
      user_id: customer.id,
      seat_code: 'A1',
      booking_id: bookingTransport.id,
      status: 'confirmed',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    }
  });

  await SeatHold.findOrCreate({
    where: { journey_id: journey.id, seat_code: 'A2' },
    defaults: {
      journey_id: journey.id,
      user_id: customer.id,
      seat_code: 'A2',
      booking_id: bookingTransport.id,
      status: 'confirmed',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    }
  });

  const [bookingFacility] = await Booking.findOrCreate({
    where: { booking_code: 'BK-FACILITY-001' },
    defaults: {
      booking_code: 'BK-FACILITY-001',
      user_id: customer.id,
      booking_type: 'facility',
      activity_instance_id: activityInstance.id,
      status: 'confirmed',
      total_amount: activityInstance.price_modifier * 12000,
      currency_id: currency.id,
      exchange_rate_snapshot: 1.0,
      passenger_count: 1,
      contact_name: `${customer.first_name} ${customer.last_name}`,
      contact_phone: customer.phone,
      contact_email: customer.email,
      confirmed_at: new Date()
    }
  });

  await BookingItem.findOrCreate({
    where: { booking_id: bookingFacility.id, item_code: 'R1' },
    defaults: {
      booking_id: bookingFacility.id,
      item_type: 'room',
      item_code: 'R1',
      passenger_name: `${customer.first_name} ${customer.last_name}`,
      passenger_type: 'adult',
      unit_price: 12000
    }
  });

  await Payment.findOrCreate({
    where: { transaction_reference: 'PAY-FACILITY-001' },
    defaults: {
      booking_id: bookingFacility.id,
      transaction_reference: 'PAY-FACILITY-001',
      method: 'card',
      provider: 'stripe',
      amount: 12000,
      currency_id: currency.id,
      exchange_rate_snapshot: 1.0,
      response_json: { stub: true },
      status: 'completed',
      paid_at: new Date()
    }
  });
};

module.exports = { seedDatabase };
