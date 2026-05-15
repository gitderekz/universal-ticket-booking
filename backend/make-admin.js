const { User, Role, UserRole } = require('./src/models');

async function makeAdmin() {
  try {
    const user = await User.findOne({ where: { email: 'admin@test.com' } });
    if (!user) {
      console.log('User not found');
      return;
    }

    const superAdminRole = await Role.findOne({ where: { slug: 'super_admin' } });
    if (!superAdminRole) {
      console.log('Super admin role not found');
      return;
    }

    // Remove existing customer role
    await UserRole.destroy({ where: { user_id: user.id } });

    // Add super admin role
    await UserRole.create({
      user_id: user.id,
      role_id: superAdminRole.id
    });

    console.log('User promoted to super admin');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

makeAdmin();