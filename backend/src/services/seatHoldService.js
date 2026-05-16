const { SeatHold, Journey, ActivityInstance, Seat, SeatLayout } = require('../models');
const { Op } = require('sequelize');

const HOLD_DURATION_MINUTES = 10;

const buildWhereClause = ({ journeyId, activityInstanceId, seatCodes, userId, status, statusIn }) => {
  const where = {};
  if (journeyId) where.journey_id = journeyId;
  if (activityInstanceId) where.activity_instance_id = activityInstanceId;
  if (seatCodes && seatCodes.length > 0) where.seat_code = seatCodes;
  if (userId) where.user_id = userId;
  if (status) where.status = status;
  if (statusIn) where.status = statusIn;
  return where;
};

const holdSeats = async ({ journeyId = null, activityInstanceId = null }, seatCodes, userId, sessionId) => {
  if (!journeyId && !activityInstanceId) {
    throw new Error('Either journeyId or activityInstanceId is required to hold seats');
  }

  const expiresAt = new Date(Date.now() + HOLD_DURATION_MINUTES * 60 * 1000);
  const holds = [];

  for (const code of seatCodes) {
    const existing = await SeatHold.findOne({
      where: buildWhereClause({
        journeyId,
        activityInstanceId,
        seatCodes: [code],
        statusIn: ['holding', 'confirmed']
      })
    });

    if (existing) {
      if (existing.status === 'holding' && existing.user_id === userId) {
        await existing.update({
          held_at: new Date(),
          expires_at: expiresAt,
          status: 'holding'
        });
        holds.push(existing);
        continue;
      }
      throw new Error(`Seat ${code} is already unavailable`);
    }

    const hold = await SeatHold.create({
      journey_id: journeyId,
      activity_instance_id: activityInstanceId,
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

const releaseSeats = async ({ journeyId = null, activityInstanceId = null }, seatCodes, userId) => {
  const where = buildWhereClause({
    journeyId,
    activityInstanceId,
    seatCodes,
    userId,
    status: 'holding'
  });

  const released = await SeatHold.update(
    { status: 'released' },
    { where }
  );
  return released;
};

const convertHoldsToBooking = async (bookingId, journeyId = null, activityInstanceId = null, seatCodes = null) => {
  const where = buildWhereClause({
    journeyId,
    activityInstanceId,
    seatCodes,
    status: 'holding'
  });
  where.booking_id = bookingId;

  const converted = await SeatHold.update(
    { status: 'confirmed', booking_id: bookingId },
    { where }
  );
  return converted;
};

const confirmHoldsForBooking = async (bookingId, journeyId = null, activityInstanceId = null) => {
  const where = buildWhereClause({
    journeyId,
    activityInstanceId,
    status: 'holding'
  });
  where.booking_id = bookingId;

  const confirmed = await SeatHold.update(
    { status: 'confirmed' },
    { where }
  );
  return confirmed;
};

const releaseHoldsForBooking = async (bookingId, journeyId = null, activityInstanceId = null) => {
  const where = buildWhereClause({
    journeyId,
    activityInstanceId,
    status: 'holding'
  });
  where.booking_id = bookingId;

  const released = await SeatHold.update(
    { status: 'released' },
    { where }
  );
  return released;
};

const releaseExpiredHolds = async () => {
  const now = new Date();
  const expired = await SeatHold.update(
    { status: 'expired' },
    {
      where: {
        expires_at: { [Op.lt]: now },
        status: 'holding'
      }
    }
  );
  return expired;
};

const getAvailability = async ({ journeyId = null, activityInstanceId = null }) => {
  if (!journeyId && !activityInstanceId) {
    return null;
  }

  let record = null;
  let transport = null;
  let facility = null;

  if (journeyId) {
    record = await Journey.findByPk(journeyId, {
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
    transport = record?.Transport;
  } else {
    record = await ActivityInstance.findByPk(activityInstanceId, {
      include: [{
        model: require('../models').Facility,
        attributes: ['capacity'],
        include: [{
          model: SeatLayout,
          as: 'seatLayout',
          include: [{ model: Seat }]
        }]
      }]
    });
    facility = record?.Facility;
  }

  if (!record) return null;

  const holds = await SeatHold.findAll({
    where: buildWhereClause({
      journeyId,
      activityInstanceId,
      statusIn: ['holding', 'confirmed']
    }),
    attributes: ['seat_code', 'status']
  });

  const heldSeats = holds.filter(h => h.status === 'holding').map(h => h.seat_code);
  const bookedSeats = holds.filter(h => h.status === 'confirmed').map(h => h.seat_code);

  const layout = transport?.seatLayout || facility?.seatLayout;
  let seats = layout?.Seats || [];
  if ((!seats || seats.length === 0) && layout && layout.id) {
    try {
      seats = await Seat.findAll({ where: { seat_layout_id: layout.id }, order: [['row', 'ASC'], ['column', 'ASC']] });
    } catch (err) {
      seats = [];
    }
  }

  const capacity = transport?.capacity || facility?.capacity || (record.total_slots ?? 0);
  if ((!seats || seats.length === 0) && capacity) {
    const knownCodes = Array.from(new Set([...heldSeats, ...bookedSeats]));
    const synthesized = [];

    for (const code of knownCodes) {
      synthesized.push({ code, seat_type: 'standard' });
    }

    let idx = 1;
    while (synthesized.length < capacity) {
      const code = `S${idx}`;
      if (!knownCodes.includes(code)) {
        synthesized.push({ code, seat_type: 'standard' });
      }
      idx += 1;
      if (idx > capacity * 3) break;
    }

    seats = synthesized.slice(0, capacity);
  }

  const totalSeats = seats.length;
  return {
    journeyId,
    activityInstanceId,
    totalSeats,
    bookedSeats: bookedSeats.length,
    heldSeats: heldSeats.length,
    availableSeats: Math.max(0, totalSeats - bookedSeats.length - heldSeats.length),
    seatMap: seats.map(seat => ({
      code: seat.code,
      type: seat.seat_type || 'standard',
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
  confirmHoldsForBooking,
  releaseHoldsForBooking,
  releaseExpiredHolds,
  getAvailability,
  getJourneyAvailability: (journeyId) => getAvailability({ journeyId })
};
