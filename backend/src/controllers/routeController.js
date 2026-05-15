const { sequelize, Route, RouteStation, Station, Transport } = require('../models');

const listRoutes = async (req, res, next) => {
  try {
    const routes = await Route.findAll({
      include: [
        { model: Transport, attributes: ['id', 'name'] },
        { model: Station, as: 'originStation', attributes: ['id', 'name', 'city'] },
        { model: Station, as: 'destinationStation', attributes: ['id', 'name', 'city'] },
        { 
          model: RouteStation, 
          attributes: ['id', 'sequence_order', 'distance_from_origin', 'cumulative_price', 'is_break_stop', 'stop_duration_minutes'],
          include: [{ model: Station, attributes: ['id', 'name', 'city'] }] 
        }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json({ routes });
  } catch (error) {
    next(error);
  }
};

const createRoute = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      company_id,
      transport_id,
      name,
      description,
      origin_station_id,
      destination_station_id,
      base_price,
      distance_km,
      status,
      is_sub_route,
      parent_route_id,
      stations
    } = req.body;

    const route = await Route.create({
      company_id,
      transport_id,
      name,
      description,
      origin_station_id,
      destination_station_id,
      base_price,
      distance_km,
      status: status || 'draft',
      is_sub_route: !!is_sub_route,
      parent_route_id: parent_route_id || null
    }, { transaction });

    if (Array.isArray(stations) && stations.length > 0) {
      const stationRecords = stations.map((station) => ({
        ...station,
        route_id: route.id
      }));
      await RouteStation.bulkCreate(stationRecords, { transaction });
    }

    await transaction.commit();
    const result = await Route.findByPk(route.id, {
      include: [
        { model: RouteStation, include: [{ model: Station, attributes: ['id', 'name', 'city'] }] }
      ]
    });

    res.status(201).json({ route: result });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

module.exports = {
  listRoutes,
  createRoute
};
