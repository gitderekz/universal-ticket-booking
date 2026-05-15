const { SeatHold, Journey, Seat, SeatLayout } = require('../models');
const { Op } = require('sequelize');

const HOLD_DURATION_MINUTES = 10;

const holdSeats = async (journeyId, seatCodes, userId, sessionId) => {
  const expiresAt = new Date(Date.now() + HOLD_DURATION_MINUTES * 60 * 1000);
  const holds = [];

  for (const code of seatCodes) {
    const existing = await SeatHold.findOne({
      where: { journey_id: journeyId, seat_code: code, status: 'holding' }
    });
    
    // If seat is held by another user and hasn't expired, throw error
    if (existing && existing.user_id !== userId && existing.expires_at > new Date()) {
      throw new Error(`Seat ${code} is already held by another user`);
    }

    // If same user already has a hold, update the expiration instead of creating new
    if (existing && existing.user_id === userId) {
      await existing.update({
        held_at: new Date(),
        expires_at: expiresAt,
        status: 'holding'
      });
      holds.push(existing);
      continue;
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
    where: {
      journey_id: journeyId,
      status: { [Op.in]: ['holding', 'converted'] }
    },
    attributes: ['seat_code', 'status']
  });

  const layout = journey.Transport?.seatLayout;
  const heldSeats = holds.filter(h => h.status === 'holding').map(h => h.seat_code);
  const bookedSeats = holds.filter(h => h.status === 'converted').map(h => h.seat_code);
  const seats = layout?.Seats || [];

  return {
    journeyId,
    totalSeats: seats.length,
    bookedSeats: bookedSeats.length,
    heldSeats: heldSeats.length,
    availableSeats: seats.length - bookedSeats.length - heldSeats.length,
    seatMap: seats.map(seat => ({
      code: seat.code,
      type: seat.seat_type,
      status: bookedSeats.includes(seat.code)
        ? 'booked'
        : heldSeats.includes(seat.code)
        ? 'held'
        : 'available'
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
