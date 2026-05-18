const { SystemLog } = require('../models');

const systemLogMiddleware = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', async () => {
    try {
      const userId = req.user?.id || null;
      const userName = req.user?.full_name || req.user?.email || req.user?.name || 'Anonymous';
      const statusCode = res.statusCode;
      const status = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warning' : 'success';
      const ipAddress = (req.headers['x-forwarded-for'] || req.ip || req.connection?.remoteAddress || '').toString().split(',')[0].trim();
      const macAddress = req.headers['x-client-mac'] || req.headers['x-mac-address'] || null;
      const modulePath = req.baseUrl?.split('/')?.[1] || 'system';
      const action = `${req.method} ${req.originalUrl}`;
      const details = `${statusCode} ${req.method} ${req.originalUrl}`;

      await SystemLog.create({
        user_id: userId,
        user_name: userName,
        action,
        module: modulePath,
        status,
        timestamp: new Date(),
        details,
        ip_address: ipAddress || null,
        mac_address: macAddress || null
      });
    } catch (error) {
      console.error('System log middleware failed:', error);
    }
  });

  next();
};

module.exports = systemLogMiddleware;
