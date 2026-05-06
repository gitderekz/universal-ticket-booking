const { SeatHold, Journey, Seat, SeatLayout } = require('../models');

const HOLD_DURATION_MINUTES = 10;

const holdSeats = async (journeyId, seatCodes, userId, sessionId) => {
  const expiresAt = new Date(Date.now() + HOLD_DURATION_MINUTES * 60 * 1000);
  const holds = [];

  for (const code of seatCodes) {
    const existing = await SeatHold.findOne({
      where: { journey_id: journeyId, seat_code: code, status: 'holding' }
    });
    if (existing && existing.expires_at > new Date()) {
      throw new Error(`Seat ${code} is already held by another user`);
    }

    const hold = await SeatHold.create({
      journey_id: journeyId,
      seat_code: code,
      user_id: userId,
      session_id: sessionId,
      held_at: new Date(),
      expires_at: expiresAt,
      status: 'holding'
    });
    holds.push(hold);
  }

  return holds;
};

const releaseSeats = async (journeyId, seatCodes, userId) => {
  const released = await SeatHold.update(
    { status: 'released' },
    {
      where: {
        journey_id: journeyId,
        seat_code: seatCodes,
        user_id: userId,
        status: 'holding'
      }
    }
  );
  return released;
};

const convertHoldsToBooking = async (bookingId, journeyId, seatCodes) => {
  const converted = await SeatHold.update(
    { status: 'converted', booking_id: bookingId },
    {
      where: {
        journey_id: journeyId,
        seat_code: seatCodes,
        status: 'holding'
      }
    }
  );
  return converted;
};

const releaseExpiredHolds = async () => {
  const now = new Date();
  const expired = await SeatHold.update(
    { status: 'expired' },
    {
      where: {
        expires_at: { [require('sequelize').Op.lt]: now },
        status: 'holding'
      }
    }
  );
  return expired;
};

const getJourneyAvailability = async (journeyId) => {
  const journey = await Journey.findByPk(journeyId, {
    include: [{
      model: require('../models').Transport,
      attributes: ['capacity'],
      include: [{
        model: SeatLayout,
        as: 'seatLayout',
        include: [{ model: Seat }]
      }]
    }]
  });

  if (!journey) return null;

  const holds = await SeatHold.findAll({
    where: { journey_id: journeyId, status: 'holding' },
    attributes: ['seat_code']
  });

  const layout = journey.Transport?.seatLayout;
  const heldSeats = holds.map(h => h.seat_code);
  const seats = layout?.Seats || [];

  return {
    journeyId,
    totalSeats: seats.length,
    bookedSeats: journey.booked_seats,
    heldSeats: heldSeats.length,
    availableSeats: seats.length - journey.booked_seats - heldSeats.length,
    seatMap: seats.map(seat => ({
      code: seat.code,
      type: seat.seat_type,
      status: heldSeats.includes(seat.code) ? 'held' : journey.booked_seats > 0 ? 'booked' : 'available'
    }))
  };
};

module.exports = {
  holdSeats,
  releaseSeats,
  convertHoldsToBooking,
  releaseExpiredHolds,
  getJourneyAvailability
};
