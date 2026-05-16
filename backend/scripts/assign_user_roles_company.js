const path = require('path');
const { sequelize, UserRole, User, Company, Role } = require('../src/models');

const run = async () => {
  try {
    console.log('Connecting to DB...');
    await sequelize.authenticate();

    const rolesMap = {};
    const roles = await Role.findAll();
    roles.forEach(r => { rolesMap[r.slug] = r.id; });

    const unassigned = await UserRole.findAll({ where: { company_id: null } });
    console.log(`Found ${unassigned.length} user_role(s) without company_id`);

    for (const ur of unassigned) {
      const user = await User.findByPk(ur.user_id);
      if (!user) continue;
      const email = user.email || '';
      const domain = email.split('@')[1] || '';

      // skip system roles
      const role = await Role.findByPk(ur.role_id);
      const roleSlug = role?.slug || '';
      if (['developer', 'super_admin', 'customer'].includes(roleSlug)) {
        console.log(`Skipping role ${roleSlug} for user ${user.email}`);
        continue;
      }

      // find company by matching domain to contact_email domain
      const companies = await Company.findAll();
      let matched = null;
      for (const c of companies) {
        const cEmail = c.contact_email || '';
        const cDomain = cEmail.split('@')[1] || '';
        if (cDomain && domain && cDomain.toLowerCase() === domain.toLowerCase()) {
          matched = c;
          break;
        }
        // also try slug contains local-part or domain contains slug
        if (c.slug && (email.includes(c.slug) || domain.includes(c.slug))) {
          matched = c;
          break;
        }
      }

      if (matched) {
        ur.company_id = matched.id;
        await ur.save();
        console.log(`Assigned company ${matched.slug} to user_role for ${user.email}`);
      } else {
        console.log(`No company matched for ${user.email} (role ${roleSlug})`);
      }
    }

    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

run();
