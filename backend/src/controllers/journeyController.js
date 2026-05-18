const { Journey, Transport, Route, Station, Timetable } = require('../models');
const { Op } = require('sequelize');

const searchJourneys = async (req, res, next) => {
  try {
    const { origin_station_id, destination_station_id, journey_date, limit = 20, offset = 0 } = req.query;

    const where = {
      status: 'scheduled',
      journey_date: journey_date
    };

    const journeys = await Journey.findAll({
      where,
      include: [
        {
          model: Route,
          attributes: ['id', 'name', 'base_price'],
          include: [
            { model: Station, as: 'originStation', attributes: ['id', 'name', 'city'] },
            { model: Station, as: 'destinationStation', attributes: ['id', 'name', 'city'] }
          ]
        },
        {
          model: Transport,
          attributes: ['id', 'name', 'capacity', 'registration_number'],
          include: [{ model: require('../models').TransportType, attributes: ['name'] }]
        },
        {
          model: Timetable,
          attributes: ['id', 'departure_time', 'arrival_time']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['departure_at', 'ASC']]
    });

    const total = await Journey.count({ where });
    res.json({ journeys, total, limit: parseInt(limit), offset: parseInt(offset) });
  } catch (error) {
    next(error);
  }
};

const getJourneysByRoute = async (req, res, next) => {
  try {
    const { route_id, transport_id } = req.query;

    const where = { status: 'scheduled' };
    if (route_id) where.route_id = route_id;
    if (transport_id) where.transport_id = transport_id;

    const journeys = await Journey.findAll({
      where,
      include: [
        {
          model: Route,
          attributes: ['id', 'name', 'base_price'],
          include: [
            { model: Station, as: 'originStation', attributes: ['id', 'name', 'city'] },
            { model: Station, as: 'destinationStation', attributes: ['id', 'name', 'city'] }
          ]
        },
        {
          model: Transport,
          attributes: ['id', 'name', 'capacity', 'registration_number'],
          include: [{ model: require('../models').TransportType, attributes: ['name'] }]
        },
        {
          model: Timetable,
          attributes: ['id', 'departure_time', 'arrival_time']
        }
      ],
      order: [['journey_date', 'ASC'], ['departure_at', 'ASC']]
    });

    res.json({ journeys });
  } catch (error) {
    next(error);
  }
};

const getJourney = async (req, res, next) => {
  try {
    const { id } = req.params;
    const journey = await Journey.findByPk(id, {
      include: [
        {
          model: Transport,
          include: [{ model: require('../models').SeatLayout, as: 'seatLayout', include: [{ model: require('../models').Seat }] }]
        },
        { model: Route, include: [{ model: Station, as: 'originStation' }, { model: Station, as: 'destinationStation' }] },
        { model: Timetable }
      ]
    });

    if (!journey) {
      return res.status(404).json({ message: 'Journey not found' });
    }

    res.json({ journey });
  } catch (error) {
    next(error);
  }
};

const createJourney = async (req, res, next) => {
  try {
    const {
      timetable_id,
      transport_id,
      route_id,
      journey_date,
      departure_at,
      arrival_at,
      status = 'scheduled',
      available_seats = 0,
      booked_seats = 0,
      held_seats = 0,
      delay_minutes,
      cancellation_reason
    } = req.body;

    if (!route_id || !journey_date || !departure_at || !arrival_at) {
      return res.status(400).json({ message: 'route_id, journey_date, departure_at and arrival_at are required' });
    }

    const journey = await Journey.create({
      timetable_id,
      transport_id,
      route_id,
      journey_date,
      departure_at,
      arrival_at,
      status,
      available_seats,
      booked_seats,
      held_seats,
      delay_minutes,
      cancellation_reason
    });

    const result = await Journey.findByPk(journey.id, {
      include: [
        {
          model: Route,
          attributes: ['id', 'name', 'base_price'],
          include: [
            { model: Station, as: 'originStation', attributes: ['id', 'name', 'city'] },
            { model: Station, as: 'destinationStation', attributes: ['id', 'name', 'city'] }
          ]
        },
        { model: Transport, attributes: ['id', 'name', 'capacity', 'registration_number'], include: [{ model: require('../models').TransportType, attributes: ['name'] }] },
        { model: Timetable, attributes: ['id', 'departure_time', 'arrival_time'] }
      ]
    });

    res.status(201).json({ journey: result });
  } catch (error) {
    next(error);
  }
};

const updateJourney = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      timetable_id,
      transport_id,
      route_id,
      journey_date,
      departure_at,
      arrival_at,
      status,
      available_seats,
      booked_seats,
      held_seats,
      delay_minutes,
      cancellation_reason
    } = req.body;

    const journey = await Journey.findByPk(id);
    if (!journey) {
      return res.status(404).json({ message: 'Journey not found' });
    }

    await journey.update({
      timetable_id: timetable_id !== undefined ? timetable_id : journey.timetable_id,
      transport_id: transport_id !== undefined ? transport_id : journey.transport_id,
      route_id: route_id !== undefined ? route_id : journey.route_id,
      journey_date: journey_date !== undefined ? journey_date : journey.journey_date,
      departure_at: departure_at !== undefined ? departure_at : journey.departure_at,
      arrival_at: arrival_at !== undefined ? arrival_at : journey.arrival_at,
      status: status !== undefined ? status : journey.status,
      available_seats: available_seats !== undefined ? available_seats : journey.available_seats,
      booked_seats: booked_seats !== undefined ? booked_seats : journey.booked_seats,
      held_seats: held_seats !== undefined ? held_seats : journey.held_seats,
      delay_minutes: delay_minutes !== undefined ? delay_minutes : journey.delay_minutes,
      cancellation_reason: cancellation_reason !== undefined ? cancellation_reason : journey.cancellation_reason
    });

    const result = await Journey.findByPk(journey.id, {
      include: [
        {
          model: Route,
          attributes: ['id', 'name', 'base_price'],
          include: [
            { model: Station, as: 'originStation', attributes: ['id', 'name', 'city'] },
            { model: Station, as: 'destinationStation', attributes: ['id', 'name', 'city'] }
          ]
        },
        { model: Transport, attributes: ['id', 'name', 'capacity', 'registration_number'], include: [{ model: require('../models').TransportType, attributes: ['name'] }] },
        { model: Timetable, attributes: ['id', 'departure_time', 'arrival_time'] }
      ]
    });

    res.json({ journey: result });
  } catch (error) {
    next(error);
  }
};

const deleteJourney = async (req, res, next) => {
  try {
    const { id } = req.params;
    const journey = await Journey.findByPk(id);
    if (!journey) {
      return res.status(404).json({ message: 'Journey not found' });
    }
    await journey.destroy();
    res.json({ message: 'Journey deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchJourneys,
  getJourneysByRoute,
  getJourney,
  createJourney,
  updateJourney,
  deleteJourney
};
