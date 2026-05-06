const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Role, UserRole, UserSession } = require('../models');
const { JWT_SECRET, JWT_REFRESH_SECRET, JWT_EXPIRY, JWT_REFRESH_EXPIRY } = process.env;

const signToken = (payload, secret, expiresIn) => jwt.sign(payload, secret, { expiresIn });

const generateTokens = (user, roles) => {
  const roleSlugs = roles.map(role => role.slug);
  const accessToken = signToken({ sub: user.id, roles: roleSlugs }, JWT_SECRET, JWT_EXPIRY || '15m');
  const refreshToken = signToken({ sub: user.id }, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRY || '7d');
  return { accessToken, refreshToken };
};

const hashToken = async (token) => {
  return await bcrypt.hash(token, 12);
};

const verifyRefreshToken = async (token, hash) => {
  return await bcrypt.compare(token, hash);
};

const register = async ({ email, phone, password, first_name, last_name, preferred_language, preferred_currency_id }) => {
  const existing = await User.findOne({ where: { [User.sequelize.Op.or]: [{ email }, { phone }] } });
  if (existing) {
    throw new Error('Email or phone already registered');
  }

  const user = await User.create({
    email,
    phone,
    password_hash: password,
    first_name,
    last_name,
    preferred_language: preferred_language || 'sw',
    preferred_currency_id: preferred_currency_id || null,
    status: 'active'
  });

  const customerRole = await Role.findOne({ where: { slug: 'customer' } });
  if (customerRole) {
    await UserRole.create({
      user_id: user.id,
      role_id: customerRole.id
    });
  }

  return user;
};

const login = async ({ email, password, ipAddress, deviceInfo }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error('Invalid login credentials');
  }
  if (user.status !== 'active') {
    throw new Error('Account is not active');
  }
  const valid = await user.checkPassword(password);
  if (!valid) {
    throw new Error('Invalid login credentials');
  }

  const roles = await user.getRoles();
  const tokens = generateTokens(user, roles);
  const refreshTokenHash = await hashToken(tokens.refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await UserSession.create({
    user_id: user.id,
    refresh_token_hash: refreshTokenHash,
    device_info: deviceInfo || null,
    ip_address: ipAddress || null,
    expires_at: expiresAt
  });

  return {
    user,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken
  };
};

const refresh = async (token) => {
  if (!token) {
    throw new Error('Refresh token required');
  }

  let payload;
  try {
    payload = jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid refresh token');
  }

  const session = await UserSession.findOne({ where: { user_id: payload.sub }, order: [['created_at', 'DESC']] });
  if (!session) {
    throw new Error('Refresh session not found');
  }

  const valid = await verifyRefreshToken(token, session.refresh_token_hash);
  if (!valid) {
    throw new Error('Refresh token mismatch');
  }

  const user = await User.findByPk(payload.sub);
  if (!user) {
    throw new Error('User not found');
  }

  const roles = await user.getRoles();
  const tokens = generateTokens(user, roles);
  const refreshTokenHash = await hashToken(tokens.refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await session.update({ refresh_token_hash: refreshTokenHash, expires_at: expiresAt });

  return {
    user,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken
  };
};

module.exports = {
  register,
  login,
  refresh
};
