const { Role, Currency, TransportType } = require('../models');

const seedDatabase = async () => {
  const roles = [
    { name: 'Developer', slug: 'developer', is_system: true },
    { name: 'Super Admin', slug: 'super_admin', is_system: true },
    { name: 'Company Admin', slug: 'company_admin', is_system: true },
    { name: 'Staff', slug: 'staff', is_system: true },
    { name: 'Customer', slug: 'customer', is_system: true }
  ];

  for (const role of roles) {
    await Role.findOrCreate({ where: { slug: role.slug }, defaults: role });
  }

  const baseCurrency = process.env.BASE_CURRENCY || 'TZS';
  await Currency.findOrCreate({
    where: { code: baseCurrency },
    defaults: {
      code: baseCurrency,
      name: 'Tanzanian Shilling',
      symbol: 'TZS',
      exchange_rate: 1.0,
      is_base: true,
      active: true
    }
  });

  const transportTypes = [
    { name: 'Safari Car', slug: 'safari_car', category: 'land', requires_routes: true, requires_layout: true },
    { name: 'Mini Bus', slug: 'mini_bus', category: 'land', requires_routes: true, requires_layout: true },
    { name: 'Bus', slug: 'bus', category: 'land', requires_routes: true, requires_layout: true },
    { name: 'Train', slug: 'train', category: 'land', requires_routes: true, requires_layout: true },
    { name: 'Aeroplane', slug: 'aeroplane', category: 'air', requires_routes: true, requires_layout: true },
    { name: 'Boat', slug: 'boat', category: 'water', requires_routes: true, requires_layout: true },
    { name: 'Ferry', slug: 'ferry', category: 'water', requires_routes: true, requires_layout: true },
    { name: 'Ship', slug: 'ship', category: 'water', requires_routes: true, requires_layout: true }
  ];

  for (const type of transportTypes) {
    await TransportType.findOrCreate({ where: { slug: type.slug }, defaults: type });
  }
};

module.exports = { seedDatabase };
