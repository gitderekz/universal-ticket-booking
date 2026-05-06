const rateWindow = 60 * 1000; // 60 seconds
const limit = 120;
const visits = new Map();

module.exports = (req, res, next) => {
  const key = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const record = visits.get(key) || { count: 0, start: now };

  if (now - record.start > rateWindow) {
    record.count = 1;
    record.start = now;
  } else {
    record.count += 1;
  }

  visits.set(key, record);

  if (record.count > limit) {
    return res.status(429).json({ message: 'Too many requests. Please try again later.' });
  }

  next();
};
