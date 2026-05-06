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

module.exports = {
  searchJourneys,
  getJourney
};
