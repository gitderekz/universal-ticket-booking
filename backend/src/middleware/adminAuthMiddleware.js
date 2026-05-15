const jwt = require('jsonwebtoken');
const { User, Role, UserRole } = require('../models');

const adminAuthMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.sub, {
      include: [{
        model: Role,
        through: UserRole,
        as: 'roles'
      }]
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Check if user has admin role
    const adminRoles = ['super_admin', 'company_admin'];
    const userRoleSlugs = user.roles.map(role => role.slug);
    const hasAdminRole = adminRoles.some(role => userRoleSlugs.includes(role));

    if (!hasAdminRole) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      status: user.status,
      roles: userRoleSlugs
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = adminAuthMiddleware;