const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.sub);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    // attach basic user info
    req.user = {
      id: user.id,
      email: user.email,
      status: user.status
    };

    // attach roles (from token if present) or fetch from DB
    if (payload.roles && Array.isArray(payload.roles)) {
      req.user.roles = payload.roles;
    } else {
      try {
        const roles = await user.getRoles();
        req.user.roles = roles.map(r => r.slug);
      } catch (err) {
        req.user.roles = [];
      }
    }

    // attach company ids from user_roles table if present
    try {
      const userRoles = await user.getUserRoles();
      const companyIds = userRoles.map(ur => ur.company_id).filter(Boolean);
      req.user.company_ids = Array.from(new Set(companyIds));
    } catch (err) {
      req.user.company_ids = [];
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
