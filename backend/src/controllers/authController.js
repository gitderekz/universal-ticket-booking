const authService = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const user = await authService.register({
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      preferred_language: req.body.preferred_language,
      preferred_currency_id: req.body.preferred_currency_id
    });
    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.login({
      email: req.body.email,
      password: req.body.password,
      ipAddress: req.ip,
      deviceInfo: req.headers['user-agent']
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.json({ user, accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const rawCookie = req.headers.cookie || '';
    const token = rawCookie.split(';').map(part => part.trim()).find(part => part.startsWith('refreshToken='));
    const refreshToken = token ? token.split('=')[1] : req.body.refreshToken;
    const { user, accessToken, refreshToken: newRefreshToken } = await authService.refresh(refreshToken);
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.json({ user, accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refresh };
