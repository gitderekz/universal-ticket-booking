const randomString = (length) => {
  return Array.from({ length }, () => Math.random().toString(36).substring(2, 3 + 1)).join('').toUpperCase();
};

const generateBookingCode = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `BKG-${date}-${randomString(6)}`;
};

module.exports = { generateBookingCode };
