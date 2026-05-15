const cron = require('node-cron');
const seatHoldService = require('../services/seatHoldService');
const journeyGeneratorService = require('../services/journeyGeneratorService');

const start = () => {
  // Release expired seat holds every 30 seconds
  cron.schedule('*/30 * * * * *', async () => {
    try {
      const released = await seatHoldService.releaseExpiredHolds();
      if (released > 0) {
        console.log(`[CRON] Released ${released} expired seat holds`);
      }
    } catch (error) {
      console.error('[CRON] Error releasing expired holds:', error.message);
    }
  });

  // Generate journeys daily at 1:00 AM
  cron.schedule('0 1 * * *', async () => {
    try {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 30); // Generate for next 30 days

      const count = await journeyGeneratorService.generateJourneysForDateRange(today, endDate);
      console.log(`[CRON] Generated ${count} journeys for next 30 days`);
    } catch (error) {
      console.error('[CRON] Error generating journeys:', error.message);
    }
  });

  console.log('Background jobs started (seat hold expiry: every 30s, journey generation: daily 1am)');
};

module.exports = { start };
