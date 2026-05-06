const { Journey } = require('../models');
const seatHoldService = require('../services/seatHoldService');

const holdSeats = async (req, res, next) => {
  try {
    const { journey_id, seat_codes } = req.body;
    const userId = req.user.id;
    const sessionId = req.headers['x-socket-id'] || 'unknown';

    const holds = await seatHoldService.holdSeats(journey_id, seat_codes, userId, sessionId);
    res.status(201).json({
      holds,
      expires_at: holds[0]?.expires_at
    });
  } catch (error) {
    next(error);
  }
};

const releaseSeats = async (req, res, next) => {
  try {
    const { journey_id, seat_codes } = req.body;
    const userId = req.user.id;

    const released = await seatHoldService.releaseSeats(journey_id, seat_codes, userId);
    res.json({ released });
  } catch (error) {
    next(error);
  }
};

const getAvailability = async (req, res, next) => {
  try {
    const { journey_id } = req.params;
    const availability = await seatHoldService.getJourneyAvailability(journey_id);
    if (!availability) {
      return res.status(404).json({ message: 'Journey not found' });
    }
    res.json(availability);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  holdSeats,
  releaseSeats,
  getAvailability
};
