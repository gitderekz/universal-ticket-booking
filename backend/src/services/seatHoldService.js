const { SeatHold, Journey, ActivityInstance, Seat, SeatLayout, sequelize } = require('../models');
const { Op } = require('sequelize');
const {
  getRouteSegments,
  getJourneySegments,
  hasSegmentConflict
} = require('../utils/routeSegments');

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

const holdSeats = async ({ journeyId = null, activityInstanceId = null, startStation = null, endStation = null }, seatCodes, userId, sessionId) => {
  if (!journeyId && !activityInstanceId) {
    throw new Error('Either journeyId or activityInstanceId is required to hold seats');
  }

  const expiresAt = new Date(Date.now() + HOLD_DURATION_MINUTES * 60 * 1000);
  const holds = [];
  let requestedSegments = [];
  let routeStations = [];

  await sequelize.transaction(async (transaction) => {
    if (journeyId) {
      if (!startStation || !endStation) {
        throw new Error('startStation and endStation are required for segment bookings');
      }

      const journey = await Journey.findByPk(journeyId, { transaction });
      if (!journey) {
        throw new Error('Journey not found');
      }

      const models = require('../models');
      const route = await models.Route.findByPk(journey.route_id, {
        include: [{
          model: models.RouteStation,
          include: [{ model: models.Station }]
        }],
        transaction
      });

      if (!route) {
        throw new Error('Route for journey not found');
      }

      routeStations = (route.RouteStations || []).sort((a, b) => a.sequence_order - b.sequence_order);
      requestedSegments = getJourneySegments(routeStations, startStation, endStation);

      if (!requestedSegments.length) {
        throw new Error('Invalid segment selection for the chosen route');
      }
    }

    for (const code of seatCodes) {
      const existingHolds = await SeatHold.findAll({
        where: buildWhereClause({
          journeyId,
          activityInstanceId,
          seatCodes: [code],
          statusIn: ['holding', 'confirmed']
        }),
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      for (const existing of existingHolds) {
        const existingSegments = Array.isArray(existing.occupied_segments) ? existing.occupied_segments : [];
        if (hasSegmentConflict(requestedSegments, existingSegments)) {
          throw new Error(`Seat ${code} is already reserved for the selected journey segment`);
        }
      }

      const hold = await SeatHold.create({
        journey_id: journeyId,
        activity_instance_id: activityInstanceId,
        seat_code: code,
        user_id: userId,
        session_id: sessionId,
        start_station: startStation,
        end_station: endStation,
        occupied_segments: requestedSegments,
        traveled_segment_count: requestedSegments.length,
        held_at: new Date(),
        expires_at: expiresAt,
        status: 'holding'
      }, { transaction });
      holds.push(hold);
    }
  });

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
    attributes: ['seat_code', 'status', 'start_station', 'end_station', 'occupied_segments', 'traveled_segment_count']
  });

  const seatHoldMap = {};
  holds.forEach((hold) => {
    if (!seatHoldMap[hold.seat_code]) {
      seatHoldMap[hold.seat_code] = {
        code: hold.seat_code,
        holds: [],
        occupied_segments: [],
        held_segments: [],
        confirmed_segments: []
      };
    }

    const entry = seatHoldMap[hold.seat_code];
    const occupiedSegments = Array.isArray(hold.occupied_segments) ? hold.occupied_segments : [];
    entry.holds.push({
      status: hold.status,
      start_station: hold.start_station,
      end_station: hold.end_station,
      occupied_segments: occupiedSegments,
      traveled_segment_count: hold.traveled_segment_count
    });

    if (hold.status === 'confirmed') {
      entry.confirmed_segments.push(...occupiedSegments);
    }
    if (hold.status === 'holding') {
      entry.held_segments.push(...occupiedSegments);
    }
    entry.occupied_segments.push(...occupiedSegments);
  });

  Object.values(seatHoldMap).forEach((entry) => {
    entry.occupied_segments = Array.from(new Set(entry.occupied_segments));
    entry.held_segments = Array.from(new Set(entry.held_segments));
    entry.confirmed_segments = Array.from(new Set(entry.confirmed_segments));
  });

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
    const knownCodes = Array.from(new Set(Object.keys(seatHoldMap)));
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

  const seatMap = seats.map((seat) => {
    const seatHold = seatHoldMap[seat.code] || {
      holds: [],
      occupied_segments: [],
      held_segments: [],
      confirmed_segments: []
    };

    const status = seatHold.confirmed_segments.length > 0
      ? 'booked'
      : seatHold.held_segments.length > 0
      ? 'held'
      : 'available';

    return {
      code: seat.code,
      type: seat.seat_type || 'standard',
      status,
      holds: seatHold.holds,
      occupied_segments: seatHold.occupied_segments,
      confirmed_segments: seatHold.confirmed_segments,
      held_segments: seatHold.held_segments
    };
  });

  const totalSeats = seats.length;
  const bookedSeats = seatMap.filter((seat) => seat.status === 'booked').length;
  const heldSeats = seatMap.filter((seat) => seat.status === 'held').length;

  return {
    journeyId,
    activityInstanceId,
    totalSeats,
    bookedSeats,
    heldSeats,
    availableSeats: Math.max(0, totalSeats - bookedSeats - heldSeats),
    seatMap
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
