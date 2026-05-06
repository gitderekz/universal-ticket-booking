const { Timetable, Journey, Transport, Route } = require('../models');
const { Op } = require('sequelize');

const generateJourneysForDateRange = async (startDate, endDate) => {
  const timetables = await Timetable.findAll({
    where: {
      status: 'active',
      effective_from: { [Op.lte]: endDate },
      [Op.or]: [
        { effective_until: null },
        { effective_until: { [Op.gte]: startDate } }
      ]
    },
    include: [
      { model: Route, attributes: ['id', 'name'] },
      { model: Transport, attributes: ['id', 'capacity'] }
    ]
  });

  const journeys = [];
  const dateRange = getDateRange(startDate, endDate);

  for (const timetable of timetables) {
    for (const date of dateRange) {
      if (shouldGenerateJourney(timetable, date)) {
        const departure = new Date(date);
        const [depHour, depMin] = timetable.departure_time.split(':');
        departure.setHours(parseInt(depHour), parseInt(depMin), 0, 0);

        const arrival = new Date(date);
        const [arrHour, arrMin] = timetable.arrival_time.split(':');
        arrival.setHours(parseInt(arrHour), parseInt(arrMin), 0, 0);

        const existing = await Journey.findOne({
          where: {
            timetable_id: timetable.id,
            journey_date: date
          }
        });

        if (!existing) {
          const journey = await Journey.create({
            timetable_id: timetable.id,
            transport_id: timetable.transport_id,
            route_id: timetable.route_id,
            journey_date: date,
            departure_at: departure,
            arrival_at: arrival,
            status: 'scheduled',
            available_seats: timetable.Transport?.capacity || 0,
            booked_seats: 0,
            held_seats: 0
          });
          journeys.push(journey);
        }
      }
    }
  }

  return journeys;
};

const getDateRange = (startDate, endDate) => {
  const dates = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    dates.push(new Date(current).toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

const shouldGenerateJourney = (timetable, date) => {
  if (timetable.frequency_type === 'once') {
    const effDate = timetable.effective_from.toISOString().split('T')[0];
    return effDate === date;
  }

  if (timetable.frequency_type === 'daily') {
    return true;
  }

  if (timetable.frequency_type === 'weekly') {
    const dayOfWeek = new Date(date).getDay();
    const config = timetable.frequency_config || {};
    const activeDays = config.days || [];
    return activeDays.includes(dayOfWeek);
  }

  return false;
};

module.exports = {
  generateJourneysForDateRange
};
