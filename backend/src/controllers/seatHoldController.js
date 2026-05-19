const seatHoldService = require('../services/seatHoldService');

const holdSeats = async (req, res, next) => {
  try {
    const { journey_id, activity_instance_id, seat_codes, start_station, end_station } = req.body;
    const userId = req.user.id;
    const sessionId = req.headers['x-socket-id'] || 'unknown';

    const holds = await seatHoldService.holdSeats(
      {
        journeyId: journey_id || null,
        activityInstanceId: activity_instance_id || null,
        startStation: start_station || null,
        endStation: end_station || null
      },
      seat_codes,
      userId,
      sessionId
    );

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
    const { journey_id, activity_instance_id, seat_codes } = req.body;
    const userId = req.user.id;

    const released = await seatHoldService.releaseSeats(
      {
        journeyId: journey_id || null,
        activityInstanceId: activity_instance_id || null
      },
      seat_codes,
      userId
    );
    res.json({ released });
  } catch (error) {
    next(error);
  }
};

const getAvailability = async (req, res, next) => {
  try {
    const { journey_id } = req.params;
    const { activity_instance_id } = req.query;
    const availability = activity_instance_id
      ? await seatHoldService.getAvailability({ activityInstanceId: activity_instance_id })
      : await seatHoldService.getAvailability({ journeyId: journey_id });

    if (!availability) {
      return res.status(404).json({ message: 'Not found' });
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
